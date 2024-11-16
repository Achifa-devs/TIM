import logging
import os
import requests
from datetime import datetime, timedelta
from functools import partial, wraps

from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS
from flask_executor import Executor
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_current_user,
    get_jwt_identity,
    get_jwt,
    jwt_required,
    verify_jwt_in_request,
)
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint, and_
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash

from util import detect


app = Flask(__name__)

app.config["SECRET_KEY"] = "secretkey"
app.config["UPLOAD_FOLDER"] = "static/uploadedfiles"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///TIMSec.db"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=3600)
app.config["JSON_SORT_KEYS"] = False
app.config["ALERT_TIME_GAP"] = timedelta(minutes=10)
app.config["EXECUTOR_TYPE"] = "process"
app.config["EXECUTOR_MAX_WORKERS"] = 5


CORS(
    app,
    resources={r"/api/v1/*": {"origins": "*", "supports_credentials": True}},
)
executor = Executor(app)
db = SQLAlchemy(app)
ma = Marshmallow(app)
migrate = Migrate(app, db, "instance/migrations")
jwt = JWTManager(app)
socket = SocketIO(app, cors_allowed_origins="*")

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("app")
file_handler = logging.FileHandler("app.log")
file_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

blacklist = set()
api_blueprint = Blueprint("api_blueprint", __name__, url_prefix="/api/v1")


class Abstract:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

    def create(self):
        db.session.add(self)
        db.session.commit()
        db.session.refresh(self)
        return self

    def update(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
        db.session.commit()
        db.session.refresh(self)

    def delete(self):
        db.session.delete(self)
        db.session.commit()


# SQLAlchemy Models
class Detection(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    detected_classname = db.Column(db.String(50), nullable=False)
    frame = db.Column(db.String, nullable=True)
    detected_at = db.Column(db.DateTime(timezone=True), default=datetime.now)
    conf_score = db.Column(db.Float, nullable=True)

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"), nullable=False)

    def __repr__(self):
        return f"Detection(detected_classname='{self.detected_classname}', detected_at='{self.detected_at}')"


class Alert(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now)
    status = db.Column(db.String(50), nullable=False, default="unread")
    state = db.Column(db.String(20), nullable=True, default="display")

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"))

    def __init__(self, message, personnel_id):
        self.message = f"Suspicious activity detected lil bih: {message}"
        self.personnel_id = personnel_id

    def __repr__(self):
        return f"Alert(message='{self.message}', to='{self.to_personnel}')"

    def create(self):
        return super().create()
        # self.notify_personnel()

    def notify_personnel(self):
        self._send_sms()

    def _send_sms(self):
        url = "https://app.smartsmssolutions.com/io/api/client/v1/sms/"
        data = {
            "token": os.getenv("SMARTSMS_TOKEN"),
            "sender": "Timsecurity",
            "to": self.to_personnel.phone_number,
            "message": self.message,
            "type": 0,  # Plain Text message (default)
            "routing": "2",
        }
        response = requests.post(url, data=data)
        logger.info(
            f"Response from SmartSMS: {response.status_code}, {response.json()}"
        )
        logger.info(f"Alert sent to {self.to_personnel.phone_number}")

    @classmethod
    def can_create_alert(cls, personnel_id):
        """Check if enough time has passed since the last alert for the given personnel."""
        last_alert = (
            cls.query.filter_by(personnel_id=personnel_id)
            .order_by(cls.created_at.desc())
            .first()
        )

        if last_alert:
            time_since_last_alert = datetime.now() - last_alert.created_at
            return time_since_last_alert >= app.config["ALERT_TIME_GAP"]

        # If there's no previous alert, send it
        return True


class Personnel(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email_address = db.Column(db.String(50), nullable=False, unique=True)
    phone_number = db.Column(db.String, nullable=False, unique=True)
    level = db.Column(db.String(50), nullable=False, default="staff")
    joined_at = db.Column(
        db.DateTime(timezone=True), nullable=True, default=datetime.now
    )
    last_active_at = db.Column(db.DateTime(timezone=True), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)

    shifts = db.relationship("Shift", backref="personnel_on_shift", lazy=True)
    detections = db.relationship("Detection", backref="personnel", lazy=True)
    alerts = db.relationship("Alert", backref="to_personnel", lazy=True)

    def __init__(self, **kwargs):
        if request.method == "POST":
            password = kwargs.pop("password")
            self.password_hash = generate_password_hash(password)
        super().__init__(**kwargs)

    def __repr__(self):
        return f"Personnel(name='{self.first_name} {self.last_name}', email='{self.email_address}')"

    @classmethod
    def on_active_shift(cls):
        active_shift = Shift.query.filter(
            and_(
                Shift.start_time <= datetime.now(),
                Shift.end_time >= datetime.now(),
                Shift.status == "active",
            )
        ).first()
        if not active_shift:
            return None
        # personnel = cls.query.filter_by(id=active_shift.personnel_id).first()

        return cls.query.first()


class Shift(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    shift_name = db.Column(db.String(99), nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)
    status = db.Column(db.String(49), nullable=False, default="inactive")
    created_at = db.Column(
        db.DateTime(timezone=True), nullable=False, default=datetime.now
    )

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"))

    __table_args__ = (
        UniqueConstraint(
            "shift_name", "personnel_id", name="uix_shift_name_personnel_id"
        ),
    )

    def __repr__(self):
        return f"Shift(shift_name='{self.shift_name}', duration='{self.end_time - self.start_time}')"


# SQLAlchemy Schemas
class DetectionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Detection
        include_fk = True


class AlertSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Alert
        include_fk = True


class PersonnelSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Personnel
        exclude = ("password_hash",)

    shifts = ma.Nested("ShiftSchema", many=True)
    detections = ma.Nested(DetectionSchema, many=True)
    alerts = ma.Nested(AlertSchema, many=True)


class ShiftSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Shift
        include_fk = True

    personnel_on_shift = ma.Nested(
        PersonnelSchema, exclude=("shifts", "detections", "alerts")
    )


with app.app_context():
    db.create_all()


def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims["level"] == "admin":
                return fn(*args, **kwargs)
            else:
                return jsonify(msg="Admins only!"), 403

        return decorator

    return wrapper


# Authentication API Endpoints
@api_blueprint.route("/signup", methods=["POST"])
def register():
    data = request.get_json()
    first_name = data.get("fname")
    last_name = data.get("lname")
    email_address = data.get("email")
    phone_number = data.get("phone")
    level = data.get("level", "staff")
    password = data.get("password")
    new_personnel = Personnel(
        first_name=first_name,
        last_name=last_name,
        email_address=email_address,
        phone_number=phone_number,
        level=level,
        password=password,
    )
    try:
        new_personnel.create()
        logger.info(f"New Personnel added: {new_personnel}")
        return (
            jsonify(
                message="Personnel added successfully",
                personnel=PersonnelSchema().dump(new_personnel),
                created=True,
            ),
            201,
        )
    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Failed to create personnel. Integrity error: {e.orig}")
        return jsonify(message="Failed to create personnel")


@api_blueprint.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email_address = data.get("email")
    password = data.get("password")
    personnel = Personnel.query.filter_by(email_address=email_address).first()
    if personnel and check_password_hash(personnel.password_hash, password):
        additional_claims = {"level": personnel.level}
        access_token = create_access_token(
            email_address, additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(email_address)
        personnel.update(last_active_at=datetime.now())
        logger.info(f"Access token for {email_address}")
        logger.info(f"Refresh token for {email_address}")
        return (
            jsonify(access_token=access_token, refresh_token=refresh_token, bool=True),
            200,
        )
    else:
        return jsonify(error="Invalid email or password", bool=False), 401


@api_blueprint.route("/sign_out", methods=["DELETE"])
@jwt_required()
def sign_out():
    jti = get_jwt()["jti"]
    blacklist.add(jti)
    return jsonify(message="Signed out successfully"), 200


@socket.on("connect")
def connect():
    try:
        verify_jwt_in_request(locations=["query_string"])
        socket.emit("connected", "connected successfully")
    except Exception as e:
        print(e)
        socket.emit("error", str(e))


@socket.on("disconnect")
def disconnect():
    socket.emit("disconnected", {"msg": "disconnected successfully"})


@socket.on("auth refresh", namespace="/auth")
@jwt_required(refresh=True)
def refresh_token():
    logger.info(f"Refreshing token for: {get_jwt_identity()}")
    current_user = get_jwt_identity()
    level = current_user.level
    additional_claims = {"level": level}
    access_token = create_access_token(
        identity=current_user, additional_claims=additional_claims
    )
    return socket.emit("refreshed", {"access_token": access_token}, namespace="/auth")


# Video API Endpoints
def handle_detection_result(future, frame_bytes):
    try:
        # Get the result once the task is done
        processed_frame_bytes, detections = future.result()

        # Handle detections
        if processed_frame_bytes and detections:
            new_alert = Alert(message=detections, personnel_id=1).create()
            logger.info("Sending processed frame to the client")
            return socket.emit(
                "processed frame",
                {
                    "original_frame_bytes": frame_bytes,
                    "processed_frame_bytes": processed_frame_bytes,
                    "detections": detections,
                    "processed": True,
                },
            )

    except Exception as e:
        logger.error(f"Error in background task: {e}")
        return socket.emit(
            "processed frame",
            {"message": "Failed to process frame", "processed": False},
        )


@socket.on("frame upload")
# @jwt_required()
def video_frame_upload(data):
    frame_bytes = data.get("frame")
    if not frame_bytes:
        return socket.emit(
            "processed frame",
            {"message": "No file selected", "processed": False, "processing": True},
        )

    try:
        # Submit the background task to process the frame
        print("Received and submitted frame for processing")
        future = executor.submit(detect, frame_bytes)

        # Add a done callback to handle the result once the task is complete
        # The done callback function expects only one argument, using `partial` to pass extra args
        # to the callback
        partial_handle_result = partial(
            handle_detection_result, frame_bytes=frame_bytes
        )
        future.add_done_callback(partial_handle_result)
        return socket.emit(
            "processed frame", {"message": "Processing started", "processed": False}
        )

    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Failed database operation. Integrity error: {e.orig}")
        return socket.emit(
            "processed frame",
            {"message": "Failed to process frame", "processed": False},
        )


# Personnel API Endpoints
@api_blueprint.route("/profile", methods=["GET"])
# @jwt_required()
def get_current_personnel():
    obj = Personnel.query.first()
    personnel = PersonnelSchema().dump(obj)
    return jsonify(info=personnel), 200


@socket.on("add phone", "/personnels")
# @jwt_required()
def add_personnel_phone_number(data):
    personnel = get_current_user()
    new_phone_number = data.get("phone_number")
    if len(new_phone_number) == 11 and new_phone_number.isdigit():
        personnel.update(phone_number=new_phone_number)
        return socket.emit(
            "added phone", {"message": "Phone number added successfully."}
        )
    else:
        return socket.emit(
            "added phone",
            {
                "error": "Invalid phone number. Please enter a valid 11-digit phone number.",
                "added": True,
            },
        )


@socket.on("delete personnel", "/nur_fur_admin")
# @admin_required()
def delete_personnel(id):
    personnel = Personnel.query.get_or_404(id)
    personnel.delete()
    return socket.emit(
        "deleted_personnel",
        {"message": "Personnel deleted successfully."},
        namespace="/nur_fur_admin",
    )


@api_blueprint.route("/personnels", methods=["GET"])
# @admin_required()
def get_personnels():
    personnels = Personnel.query.all()
    personnel_list = PersonnelSchema(many=True).dump(personnels)
    return jsonify(personnel_list), 200


# Shifts API Endpoints
# @socket.on("add_shift", "/nur_fur_admin")
# @admin_required()
@api_blueprint.route("/admin/new-shift", methods=["POST"])
def add_new_shift():
    data = request.json
    shift_name = data.get("shift_name")
    start_time = datetime.strptime(data.get("start_time"), "%H:%M")
    end_time = datetime.strptime(data.get("end_time"), "%H:%M")
    personnel_id = data.get("personnel_id")
    now = datetime.now().replace(second=0, microsecond=0).time()
    status = (
        start_time.replace(second=0)
        <= datetime.strptime(str(now), "%H:%M:%S")
        <= end_time.replace(second=0)
    )
    try:
        new_shift = Shift(
            shift_name=shift_name,
            start_time=start_time,
            end_time=end_time,
            personnel_id=personnel_id,
            status="active" if status else "inactive",
        ).create()
        socket.emit(
            "shift added",
            {"shift": ShiftSchema().dump(new_shift), "added": True},
        )
        return jsonify("Shift added successfully"), 201
    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Failed to create shift. Integrity error: {e.orig}")
        socket.emit(
            "shift added",
            {"message": "Failed to create shift", "added": False},
        )
        return jsonify("Failed to create shift"), 400


@socket.on("admin_get_shifts")
# @admin_required()
def get_shifts():
    # personnel = get_current_user()
    shifts = Shift.query.all()
    shift_list = ShiftSchema(many=True).dump(shifts)
    return socket.emit("fetch shifts", shift_list)


@socket.on("shift")
def get_single_shift(id):
    shift = Shift.query.get_or_404(id)
    return socket.emit("fetch shifts", ShiftSchema().dump(shift))


@api_blueprint.get("/shifts/current")
def get_active_shift():
    shift = Shift.query.filter(
        Shift.status == "active", Shift.start_time <= datetime.now()
    ).first()
    active_shift = ShiftSchema().dump(shift) if shift else None

    return jsonify({"shift": active_shift, "is_active": True if shift else False})


@socket.on("update_shift", "/nur_fur_admin")
# @admin_required()
def update_shift(id):
    data = request.get_json()
    shift = Shift.query.get_or_404(id)
    shift_name = data.get("shift_name", shift.shift_name)
    start_time = data.get("start_time", shift.start_time)
    end_time = data.get("end_time", shift.end_time)
    shift.update(shift_name=shift_name, start_time=start_time, end_time=end_time)
    return socket.emit(
        "updated_shift",
        {"updated_shift": ShiftSchema().dump(shift), "updated": True},
        namespace="/nur_fur_admin",
    )


@socket.on("update shift status", "/nur_fur_admin")
# @admin_required()
def update_shift_status(data):
    id = data.get("shift_id")
    shift = Shift.query.get_or_404(id)
    status = data.get("status")
    shift.update(status=status)
    return socket.emit(
        "updated_shift",
        {"updated_shift": ShiftSchema().dump(shift), "updated": True},
        namespace="/nur_fur_admin",
    )


@socket.on("delete shift", "/nur_fur_admin")
# @admin_required()
def delete_shift(id):
    shift = Shift.query.get_or_404(id)
    shift.delete()
    return socket.emit(
        "shift deleted",
        {"message": "Shift deleted successfully."},
        namespace="/nur_fur_admin",
    )


# Alert API Endpoints
@socket.on("alerts")
# @jwt_required()
def read_alerts():
    # active_personnel = get_current_user()
    alerts = (
        Alert.query.filter_by(state="display").order_by(Alert.created_at.desc()).all()
    )
    alerts_data = AlertSchema(many=True).dump(alerts)
    return socket.emit("fetch alerts", {"alerts": alerts_data})


@socket.on("update alert")
# @jwt_required()
def update_alert_status(data):
    # active_personnel = get_current_user()
    alert = Alert.query.filter_by(
        # personnel_id=active_personnel.id,
        id=data.get("id")
    ).first_or_404()
    status = data.get("status", alert.status)
    state = data.get("state", alert.state)
    alert.update(status=status, state=state)
    return socket.emit(
        "updated alert",
        {"message": "Alert status updated."},
    )


app.register_blueprint(api_blueprint)


@app.before_request
def log_request():
    logger.info(f"Handling request for: {request.url} - {request.method}")


@app.after_request
def log_response(response):
    logger.info(f"Response status: {response.status_code}")
    return response


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, _jwt_payload):
    email_address = _jwt_payload["sub"]
    user = Personnel.query.filter_by(email_address=email_address).first()
    return user if user else None


@jwt.token_in_blocklist_loader
def token_in_blocklist_callback(_jwt_header, _jwt_payload):
    jti = _jwt_payload["jti"]
    return jti in blacklist


if __name__ == "__main__":
    # download_model(logger)
    socket.run(app, debug=True, port=8000)
