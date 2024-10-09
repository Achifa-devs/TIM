import logging, os
from datetime import datetime, timedelta
from functools import wraps

import cv2
from flask import (
    Blueprint,
    Flask,
    Response,
    jsonify,
    make_response,
    request,
    session,
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
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint, and_
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

from Yolo_video import video_detection


app = Flask(__name__)

app.config["SECRET_KEY"] = "secretkey"
app.config["UPLOAD_FOLDER"] = "static/uploadedfiles"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///TIMSec.db"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=36000)
app.config["ALLOWED_EXTENSIONS"] = {
    "mp4",
    "png",
    "mov",
    "webm",
} 

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

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("app")
file_handler = logging.FileHandler("app.log")
file_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)


api_blueprint = Blueprint("api_blueprint", __name__, url_prefix="/api/v1")


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


class UploadedVideo(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    file_name = db.Column(db.String, unique=True, nullable=False)
    file_path = db.Column(db.String, unique=True, nullable=False)
    uploaded_at = db.Column(db.DateTime(timezone=True), default=datetime.now)


class UploadedVideoSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = UploadedVideo
        fields = ("id", "file_name", "file_path", "uploaded_at")


class Personnel(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email_address = db.Column(db.String(50), nullable=False, unique=True)
    phone_number = db.Column(db.Integer, nullable=False, unique=True)
    level = db.Column(db.String(50), nullable=False, default="staff")
    joined_at = db.Column(
        db.DateTime(timezone=True), nullable=True, default=datetime.now
    )
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    password = db.Column(db.String(100), nullable=False)

    def __init__(self, **kwargs):
        if request.method == "POST":
            password = kwargs.pop("password")
            self.password = generate_password_hash(password)
        super().__init__(**kwargs)

    def __repr__(self):
        return f"Personnel(name='{self.first_name} {self.last_name}', email='{self.email_address}')"

    @staticmethod
    def personnel_on_active_shift():
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


class PersonnelSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Personnel
        fields = (
            "id",
            "first_name",
            "last_name",
            "email_address",
            "phone_number",
            "level",
            "joined_at",
            "is_active",
        )


class Detection(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    detected_classname = db.Column(db.String(50), nullable=False)
    frame_number = db.Column(db.Integer, nullable=False)
    detected_at = db.Column(db.DateTime(timezone=True), default=datetime.now)
    conf_score = db.Column(db.Float, nullable=True)
    # frame = db.Column(db.I)
    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"), nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey("uploaded_video.id"))

    def __repr__(self):
        return f"Detection(detected_classname='{self.detected_classname}', detected_at='{self.detected_at}')"


class DetectionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Detection
        fields = ("id", "detected_classname", "frame_number", "detected_at")


class Alert(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(100), nullable=False)
    alert_at = db.Column(db.DateTime(timezone=True), default=datetime.now)
    status = db.Column(db.String(50), nullable=False, default="unread")

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"))

    def __repr__(self):
        return f"Alert(message='{self.message}', to='{self.personnel_id}')"


class AlertSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Alert
        fields = ("id", "message", "alert_at", "status", "personnel_id")


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


class ShiftSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Shift
        fields = (
            "id",
            "shift_name",
            "start_time",
            "end_time",
            "created_at",
            "personnel_id",
        )


with app.app_context():
    db.create_all()


# Video API Endpoints
def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in app.config["ALLOWED_EXTENSIONS"]
    )


def generate_frames(path_x):
    yolo_output = video_detection(path_x)
    for detection in yolo_output:
        _, buffer = cv2.imencode(".jpeg", detection)
        frame = buffer.tobytes()
        yield b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"


# @admin_required()
@api_blueprint.route("/video_feed", methods=["GET"])
def video_feed():
    return Response(
        generate_frames(0),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


@api_blueprint.route("/process_video/upload", methods=["POST"])
# @jwt_required()
def video_upload():
    file = request.files.get("video")
    if not file.filename:
        return jsonify(error="No file selected"), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        video_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(video_path)
        session["video_path"] = video_path
        new_upload = UploadedVideo(
            file_name=file.filename, file_path=video_path, uploaded_at=datetime.now()
        )
        try:
            # new_upload.create()
            return Response(
                generate_frames(video_path),
                mimetype="multipart/x-mixed-replace; boundary=frame",
            )
        except IntegrityError as e:
            db.session.rollback()
            return (
                jsonify(
                    message="Failed to upload video. Integrity error: " + str(e.orig)
                ),
                400,
            )
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


# Authentication API Endpoints
@api_blueprint.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email_address = data.get("email")
    password = data.get("password")
    personnel = Personnel.query.filter_by(email_address=email_address).first()
    if personnel and check_password_hash(personnel.password, password):
        additional_claims = {"level": personnel.level}
        access_token = create_access_token(
            email_address, additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(email_address)
        logger.info(f"Access token: {access_token}")
        logger.info(f"Refresh token: {refresh_token}")
        return (
            jsonify(access_token=access_token, refresh_token=refresh_token, bool=True),
            200,
        )
    else:
        return jsonify(error="Invalid email or password", bool=False), 401


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
        return (
            jsonify(
                message="Personnel added successfully",
                personnel=PersonnelSchema().dump(new_personnel),
            ),
            201,
        )
    except IntegrityError as e:
        db.session.rollback()
        return (
            jsonify(
                message="Failed to create personnel. Integrity error: " + str(e.orig)
            ),
            400,
        )


@api_blueprint.route("/sign_out", methods=["POST"])
@jwt_required()
def sign_out():
    response = make_response(jsonify(message="Signed out successfully"), 200)
    response.set_cookie("access_token_cookie", "", expires=0)
    response.set_cookie("refresh_token_cookie", "", expires=0)
    return response


@api_blueprint.route("/auth/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    logger.info(f"refreshing token for user: {get_jwt_identity()}")
    current_user = get_jwt_identity()
    level = current_user.level
    additional_claims = {"level": level}
    access_token = create_access_token(
        identity=current_user, additional_claims=additional_claims
    )
    return jsonify(access_token=access_token), 200


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
        return (
            jsonify(message="Failed to create shift. Integrity error: " + str(e.orig)),
            400,
        )


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


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, _jwt_payload):
    email_address = _jwt_payload["sub"]
    user = Personnel.query.filter_by(email_address=email_address).first()
    return user if user else None


if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
