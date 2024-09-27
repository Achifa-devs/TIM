import os
from datetime import datetime
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
    render_template,
)
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_current_user,
    get_jwt,
    jwt_required,
    verify_jwt_in_request,
)
from flask_marshmallow import Marshmallow
from flask_migrate import Migrate
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint, and_
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash

from alert_moduleX import send_sms_alert

from Yolo_video import video_detection


app = Flask(__name__)

app.config["SECRET_KEY"] = "secretkey"
app.config["UPLOAD_FOLDER"] = "static/uploadedfiles"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///TIMSec.db"
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
app.config["ALLOWED_EXTENSIONS"] = {"mp4", "avi", "mov"}  # Set allowed file extensions

CORS(
    app,
    resources={
        r"/api/v1/*": {"origins": "http://localhost:3000", "supports_credentials": True}
    },
)
db = SQLAlchemy(app)
ma = Marshmallow(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)


authorizations = {
    "Bearer auth": {
        "type": "apiKey",
        "in": "header",
        "name": "Authorization",
    }
}

api = Api(
    app,
    version="1.0",
    title="TIMSec API",
    description="TIMSec API Documentation",
    authorizations=authorizations,
)
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
    def create(self):
        db.session.add(self)
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
    password = db.Column(db.String(100), nullable=False)

    def __init__(
        self, first_name, last_name, email_address, phone_number, level, password
    ):
        self.first_name = first_name
        self.last_name = last_name
        self.email_address = email_address
        self.phone_number = phone_number
        self.level = level
        self.password = generate_password_hash(password)

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
        fields = ("id", "name", "email_address", "phone_number", "level")


class ViolenceDetection(db.Model, Abstract):
    id = db.Column(db.Integer, primary_key=True)
    detected_classname = db.Column(db.String(50), nullable=False)
    frame_number = db.Column(db.Integer, nullable=False)
    detected_at = db.Column(db.DateTime(timezone=True), default=datetime.now)

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"), nullable=False)
    video_id = db.Column(db.Integer, db.ForeignKey("uploaded_video.id"))

    def __repr__(self):
        return f"ViolenceDetection(detected_classname='{self.detected_classname}', detected_at='{self.detected_at}')"


class ViolenceDetectionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ViolenceDetection
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

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"))

    __table_args__ = (
        UniqueConstraint(
            "shift_name", "personnel_id", name="uix_shift_name_personnel_id"
        ),
    )

    def __init__(self, shift_name, start_time, end_time, personnel_id):
        self.shift_name = shift_name
        self.start_time = start_time
        self.end_time = end_time
        self.personnel_id = personnel_id

    def __repr__(self):
        return f"Shift(shift_name='{self.shift_name}', start_time='{self.start_time}', end_time='{self.end_time}')"


class ShiftSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Shift
        fields = ("id", "shift_name", "start_time", "end_time", "personnel_id")


with app.app_context():
    db.create_all()


@api_blueprint.route("/auth", methods=["POST"])
@jwt_required()
def personnel_data():
    obj = get_current_user()
    personnel = PersonnelSchema().dump(obj)
    return jsonify(info=personnel), 200


# Rendering the Webcam Rage
# Now lets make a Webcam page for the application
# Use 'app.route()' method, to render the Webcam page at "/webcam"
@api_blueprint.route("/webcam", methods=["GET", "POST"])
def webcam_capture():
    session.clear()
    return render_template("webcamfeed.html")


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in app.config["ALLOWED_EXTENSIONS"]
    )


@api_blueprint.route("/upload/video", methods=["POST"])
# @jwt_required()
def upload_video():
    file = request.files["file"]
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
        new_upload.create()
        return jsonify(message="File uploaded successfully"), 200
    else:
        return jsonify(message="Invalid file type"), 400


@api_blueprint.route("/profile", methods=["GET"])
@jwt_required()
def security_details():
    user = get_current_user()
    personnel = PersonnelSchema().dump(user)
    return jsonify(data=personnel), 200


@api_blueprint.route("/personnels/add_phone_number", methods=["POST"])
@jwt_required()
def add_personnel_phone_number():
    personnel = get_current_user()
    data = request.get_json()
    new_phone_number = data.get("phone_number")
    if len(new_phone_number) == 11 and new_phone_number.isdigit():
        personnel.phone_number = new_phone_number
        db.session.commit()
        return jsonify(message="Phone number added successfully."), 201
    else:
        return jsonify(
            error="Invalid phone number. Please enter a valid 11-digit phone number."
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
@admin_required()
def get_personnels():
    personnels = Personnel.query.all()
    personnel_list = PersonnelSchema(many=True).dump(personnels)
    return jsonify(personnels=personnel_list), 200


@api_blueprint.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email_address = data.get("email")
    password = data.get("password")
    personnel = Personnel.query.filter_by(email_address=email_address).first()
    if personnel and check_password_hash(personnel.password, password):
        additional_claims = {
            "level": "admin" if personnel.level == "admin" else "staff"
        }
        access_token = create_access_token(
            email_address, additional_claims=additional_claims
        )
        return jsonify(access_token=access_token, bool=True), 200
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
    Personnel(
        first_name, last_name, email_address, phone_number, level, password
    ).create()
    return jsonify(message="Personnel added successfully"), 201


@api_blueprint.route("/sign_out", methods=["POST"])
# @jwt_required()
def sign_out():
    response = make_response(jsonify(message="Signed out successfully"), 200)
    response.set_cookie("access_token_cookie", "", expires=0)
    response.set_cookie("refresh_token_cookie", "", expires=0)
    return response


# Shifts API Endpoints
@api_blueprint.route("/admin/new-shift", methods=["POST"])
# @admin_required()
def new_shift():
    data = request.get_json()
    shift_name = data.get("shift_name")
    start_time = data.get("start_time")
    end_time = data.get("end_time")
    personnel_id = data.get("personnel_id")
    new_shift = Shift(shift_name, start_time, end_time, personnel_id)
    try:
        new_shift.create()
        return jsonify(message="Shift created successfully"), 201
    except IntegrityError as e:
        db.session.rollback()
        return (
            jsonify(message="Failed to create shift. Integrity error: " + str(e.orig)),
            400,
        )


@api_blueprint.route("/admin/shifts", methods=["GET"])
# @admin_required()
def get_shifts():
    personnel = get_current_user()
    shifts = Shift.query.filter_by(personnel_id=personnel.id).all()
    shift_list = ShiftSchema(many=True).dump(shifts)
    return jsonify(shifts=shift_list), 200


@api_blueprint.route("/shifts/<int:id>", methods=["GET"])
def get_single_shift(id):
    shift = Shift.query.get(id)
    if shift:
        return jsonify(shift=ShiftSchema().dump(shift)), 200
    else:
        return jsonify(error="Shift not found"), 404


@api_blueprint.route("/shifts/<int:id>", methods=["PUT"])
@admin_required()
def update_shift(id):
    data = request.get_json()
    shift = Shift.query.get(id)
    if shift:
        shift.shift_name = data.get("shift_name")
        shift.start_time = data.get("start_time")
        shift.end_time = data.get("end_time")
        db.session.commit()
        return jsonify(message="Shift updated successfully"), 200
    else:
        return jsonify(error="Shift not found"), 404


@api_blueprint.route("/shifts/<int:id>", methods=["DELETE"])
@admin_required()
def delete_shift(id):
    shift = Shift.query.get(id)
    if shift:
        shift.delete()
        return jsonify(message="Shift deleted successfully"), 204
    else:
        return jsonify(error="Shift not found"), 404


def generate_frames(path_x):
    yolo_output = video_detection(path_x, callback_function=send_sms_alert)
    for detection_ in yolo_output:
        ref, buffer = cv2.imencode(".jpg", detection_)

        frame = buffer.tobytes()
        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


# @admin_required()
@api_blueprint.route("/videos", methods=["GET"])
def video():
    # return Response(generate_frames(path_x='static/uploadedfiles/'), mimetype='multipart/x-mixed-replace; boundary=frame')
    return Response(
        generate_frames(path_x=session.get("video_path", None)),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


# @admin_required()
# To display the Output Video on Webcam page
@api_blueprint.route("/webcam")
def webcam():
    # return Response(generate_frames(path_x = session.get('video_path', None),conf_=round(float(session.get('conf_', None))/100,2)),mimetype='multipart/x-mixed-replace; boundary=frame')
    return Response(
        generate_frames(path_x=0),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


app.register_blueprint(api_blueprint)


@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, _jwt_payload):
    email_address = _jwt_payload["sub"]
    user = Personnel.query.filter_by(email_address=email_address).first()
    return user if user else None


if __name__ == "__main__":
    app.run(debug=True, host="localhost", port=5000)
