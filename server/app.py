import logging, os, requests
from datetime import datetime, timedelta
from functools import wraps

from flask import (
    Blueprint,
    Flask,
    Response,
    jsonify,
    request,
)
from flask_cors import CORS
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
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

from util import detect, download_model


app = Flask(__name__)

app.config["SECRET_KEY"] = "secretkey"
app.config["UPLOAD_FOLDER"] = "static/uploadedfiles"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///TIMSec.db"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=3600)
app.config["JSON_SORT_KEYS"] = False
app.config["ALLOWED_EXTENSIONS"] = {
    "mp4",
    "png",
    "jpeg",
    "webm",
}
app.config["ALERT_TIME_GAP"] = timedelta(minutes=10)

CORS(
    app,
    resources={
        r"/api/v1/*": {"origins": "http://localhost:3000", "supports_credentials": True}
    },
)
db = SQLAlchemy(app)
ma = Marshmallow(app)
migrate = Migrate(app, db, "instance/migrations")
jwt = JWTManager(app)
socket = SocketIO(app)
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

    def update(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()


# SQLAlchemy Models
class UploadedVideo(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String, unique=True, nullable=False)
    file_path = db.Column(db.String, unique=True, nullable=False)
    uploaded_at = db.Column(db.DateTime(timezone=True), default=datetime.now)


class Detection(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    detected_classname = db.Column(db.String(50), nullable=False)
    frame = db.Column(db.String, nullable=True)
    detected_at = db.Column(db.DateTime(timezone=True), default=datetime.now)
    conf_score = db.Column(db.Float, nullable=True)

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"), nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey("uploaded_video.id"), nullable=True)

    def __repr__(self):
        return f"Detection(detected_classname='{self.detected_classname}', detected_at='{self.detected_at}')"


class Alert(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.now)
    status = db.Column(db.String(50), nullable=False, default="unread")

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"))

    def __init__(self, message, personnel_id):
        self.message = f"Suspicious activity detected: {message}"
        self.personnel_id = personnel_id

    def __repr__(self):
        return f"Alert(message='{self.message}', to='{self.to_personnel}')"

    def create(self):
        super().create()
        self.notify_personnel()

    def notify_personnel(self):
        if Alert.can_create_alert(self.to_personnel.id):
            self._send_sms()
        else:
            logger.info(f"Skipping alert for {self.to_personnel.phone_number} due to time gap")

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
        logger.info(f"Response from SmartSMS: {response.status_code}, {response.json()}")
        logger.info(f"Alert sent to {self.to_personnel.phone_number}")

    @classmethod
    def can_create_alert(cls, personnel_id):
        """Check if enough time has passed since the last alert for the given personnel."""
        last_alert = cls.query.filter_by(personnel_id=personnel_id).order_by(cls.created_at.desc()).first()

        if last_alert:
            time_since_last_alert = datetime.now() - last_alert.created_at
            return time_since_last_alert >= app.config["ALERT_TIME_GAP"]

        # If there's no previous alert, send it
        return True


class Shift(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    shift_name = db.Column(db.String(100), nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)
    status = db.Column(db.String(50), nullable=False, default="inactive")
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

    shifts = db.relationship('Shift', backref='personnel_on_shift', lazy=True)
    detections = db.relationship('Detection', backref='personnel', lazy=True)
    alerts = db.relationship('Alert', backref='to_personnel', lazy=True)

    def __init__(self, **kwargs):
        if request.method == "POST":
            password = kwargs.pop("password")
            self.password_hash = generate_password_hash(password)
        super().__init__(**kwargs)

    def __repr__(self):
        return f"Personnel(name='{self.first_name} {self.last_name}', email='{self.email_address}')"

    @staticmethod
    def on_active_shift():
        active_shift = Shift.query.filter(
            and_(
                Shift.start_time <= datetime.now(),
                Shift.end_time >= datetime.now(),
                Shift.status == "active",
            )
        ).first()
        if not active_shift:
            return None
        personnel = Personnel.query.filter_by(id=active_shift.personnel_id).first()
        return personnel


# SQLAlchemy Schemas
class UploadedVideoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = UploadedVideo


class DetectionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Detection
        include_fk = True


class AlertSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Alert
        include_fk = True


class ShiftSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Shift
        include_fk = True


class PersonnelSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Personnel
        exclude = ("password_hash",)

    shifts = ma.Nested(ShiftSchema, many=True)
    detections = ma.Nested(DetectionSchema, many=True)
    alerts = ma.Nested(AlertSchema, many=True)



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
            ),
            201,
        )
    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Failed to create personnel. Integrity error: {e.orig}")
        return jsonify(message="Failed to create personnel"), 400


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


@api_blueprint.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    logger.info(f"Refreshing token for: {get_jwt_identity()}")
    current_user = get_jwt_identity()
    level = current_user.level
    additional_claims = {"level": level}
    access_token = create_access_token(
        identity=current_user, additional_claims=additional_claims
    )
    return jsonify(access_token=access_token), 200


# Video API Endpoints
def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in app.config["ALLOWED_EXTENSIONS"]
    )


@api_blueprint.route("/process_video/upload", methods=["POST"])
# @jwt_required()
def frame_upload():
    data = request.files
    frame_data = data.get("frame")
    if not frame_data:
        return jsonify("No file selected"), 400
    if frame_data and frame_data.filename:
        # new_upload = UploadedVideo(
        # file_name=file.filename, file_path=video_path, uploaded_at=datetime.now()
        # )
        try:
            # Process and run detections on the frame
            frame_bytes, detections = detect(frame_data)

            for detection in detections:
                class_name, conf = detection
                personnel = Personnel.on_active_shift()

                # Send alert to personnel
                if Alert.can_create_alert(personnel.id):
                    Alert(message=class_name, personnel_id=1).create()

                # Save the detection in the database
                filename = secure_filename(frame_data.filename)
                to_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                frame_data.save(to_path)
                Detection(
                    classname=class_name,
                    frame=to_path,
                    personnel_id=1,
                    detected_at=datetime.now(),
                    conf_score=conf,
                ).create()

            return Response(
                frame_bytes,
                mimetype="multipart/x-mixed-replace; boundary=frame",
            )
        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"Failed to upload video. Integrity error: {e.orig}")
            return jsonify(message="Failed to upload video"), 400
    else:
        return jsonify(message="Invalid file type"), 400


# Personnel API Endpoints
@api_blueprint.route("/profile", methods=["GET"])
@jwt_required()
def get_current_personnel():
    obj = get_current_user()
    personnel = PersonnelSchema().dump(obj)
    return jsonify(info=personnel), 200


@api_blueprint.route("/personnels/add_phone_number", methods=["POST"])
@jwt_required()
def add_personnel_phone_number():
    personnel = get_current_user()
    data = request.get_json()
    new_phone_number = data.get("phone_number")
    if len(new_phone_number) == 11 and new_phone_number.isdigit():
        personnel.update(phone_number=new_phone_number)
        return jsonify(message="Phone number added successfully."), 201
    else:
        return (
            jsonify(
                error="Invalid phone number. Please enter a valid 11-digit phone number."
            ),
            400,
        )


@api_blueprint.route("/personnels/<int:id>", methods=["DELETE"])
@admin_required()
def delete_personnel(id):
    personnel = Personnel.query.get(id)
    if personnel:
        personnel.delete()
        return jsonify(), 204
    else:
        return jsonify(error="Personnel not found"), 404


@api_blueprint.route("/personnels", methods=["GET"])
# @admin_required()
def get_personnels():
    personnels = Personnel.query.all()
    personnel_list = PersonnelSchema(many=True).dump(personnels)
    return jsonify(personnel_list), 200


# Shifts API Endpoints
@api_blueprint.route("/admin/new-shift", methods=["POST"])
# @admin_required()
def add_new_shift():
    data = request.get_json()
    shift_name = data.get("shift_name")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    personnel_id = data.get("personnel_id")
    new_shift = Shift(
        shift_name=shift_name,
        start_time=datetime.strptime(start_time, "%H:%M"),
        end_time=datetime.strptime(end_time, "%H:%M"),
        personnel_id=personnel_id,
    )
    try:
        new_shift.create()
        return (
            jsonify(
                message="Shift created successfully",
                shift=ShiftSchema().dump(new_shift),
            ),
            201,
        )
    except IntegrityError as e:
        db.session.rollback()
        logger.error(f"Failed to create shift. Integrity error: {e.orig}")
        return jsonify(message="Failed to create shift"), 400


@api_blueprint.route("/admin/shifts", methods=["GET"])
# @admin_required()
def get_shifts():
    # personnel = get_current_user()
    shifts = Shift.query.all()
    shift_list = ShiftSchema(many=True).dump(shifts)
    return jsonify(shift_list), 200


@api_blueprint.route("/shifts/<int:id>", methods=["GET"])
def get_single_shift(id):
    shift = Shift.query.get(id)
    if shift:
        return jsonify(shift=ShiftSchema().dump(shift)), 200
    else:
        return jsonify(error="Shift not found"), 404


@api_blueprint.route("/shifts/<int:id>", methods=["PUT"])
@jwt_required(optional=True)
def update_shift(id):
    data = request.get_json()
    shift = Shift.query.get(id)
    if shift:
        shift_name = data.get("shift_name")
        start_time = data.get("start_time")
        end_time = data.get("end_time")
        shift.update(shift_name=shift_name, start_time=start_time, end_time=end_time)
        return (
            jsonify(
                message="Shift updated successfully", shift=ShiftSchema().dump(shift)
            ),
            200,
        )
    else:
        return jsonify(error="Shift not found"), 404


@api_blueprint.route("/shifts/<int:id>", methods=["DELETE"])
@admin_required()
def delete_shift(id):
    shift = Shift.query.get(id)
    if shift:
        shift.delete()
        return jsonify(), 204
    else:
        return jsonify(error="Shift not found"), 404


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
    download_model(logger)
    app.run()
