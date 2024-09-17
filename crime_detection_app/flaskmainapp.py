from flask import Flask, render_template, Response, jsonify, request, session, url_for

# FlaskForm--> it is required to receive input from the user
# Whether uploading a video file  to our object detection model
from flask_wtf import FlaskForm
from wtforms import (
    FileField,
    SubmitField,
    StringField,
    DecimalRangeField,
    IntegerRangeField,
)
from werkzeug.utils import secure_filename
from wtforms.validators import InputRequired, NumberRange
import os
from flask_sqlalchemy import SQLAlchemy

# Required to run the YOLOv8 model
import cv2

# YOLO_Video is the python file which contains the code for our object detection model
# Video Detection is the Function which performs Object Detection on Input Video
from Yolo_video import video_detection

# Import your alert module
from alert_moduleX import send_sms_alert

app = Flask(__name__)

app.config["SECRET_KEY"] = "tim"
app.config["UPLOAD_FOLDER"] = "static/uploadedfiles"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///recipient_numbers.db"

# db = SQLAlchemy(app)


# class Recipient(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     number = db.Column(db.String(11), unique=True, nullable=False)
# db.create_all()

# Use FlaskForm to get input video file  from user
class UploadFileForm(FlaskForm):
    # We store the uploaded video file path in the FileField in the variable file
    # We have added validators to make sure the user inputs the video in the valid format  and user does upload the
    # video when prompted to do so
    file = FileField("File", validators=[InputRequired()])
    submit = SubmitField("Run")


def generate_frames(path_x=""):
    yolo_output = video_detection(path_x, callback_function=send_sms_alert)
    for detection_ in yolo_output:
        ref, buffer = cv2.imencode(".jpg", detection_)

        frame = buffer.tobytes()
        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


def generate_frames_web(path_x):
    yolo_output = video_detection(path_x, callback_function=send_sms_alert)
    for detection_ in yolo_output:
        ref, buffer = cv2.imencode(".jpg", detection_)
        # print("Detect", detection_)

        frame = buffer.tobytes()
        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


@app.route("/", methods=["GET", "POST"])
@app.route("/home", methods=["GET", "POST"])
def home():
    session.clear()
    return render_template("index.html")


# Rendering the Webcam Rage
# Now lets make a Webcam page for the application
# Use 'app.route()' method, to render the Webcam page at "/webcam"
@app.route("/webcam", methods=["GET", "POST"])
def webcam():
    session.clear()
    return render_template("webcamfeed.html")


@app.route("/Video", methods=["GET", "POST"])
def front():
    # Upload File Form: Create an instance for the Upload File Form
    form = UploadFileForm()
    if form.validate_on_submit():
        # Our uploaded video file path is saved here
        file = form.file.data
        file.save(
            os.path.join(
                os.path.abspath(os.path.dirname(__file__)),
                app.config["UPLOAD_FOLDER"],
                secure_filename(file.filename),
            )
        )  # Then save the file
        # Use session storage to save video file path
        session["video_path"] = os.path.join(
            os.path.abspath(os.path.dirname(__file__)),
            app.config["UPLOAD_FOLDER"],
            secure_filename(file.filename),
        )
    return render_template("display_video.html", form=form)


@app.route("/security_details", methods=["GET", "POST"])
def security_details():
    return render_template("security_info.html")


recipient_number = None


@app.route("/add_phone_number", methods=["POST"])
def add_phone_number():
    global recipient_number
    if request.method == "POST":
        # Get the phone number from the form submission
        new_recipient_numbers = request.form.getlist("entered_recipient_number")
        added_numbers = []
        for number in new_recipient_numbers:
            if (
                len(number) == 11 and number.isdigit()
            ):  # Check if the phone number has 11 digits
                # Here you would typically add the phone number to your database or perform any other necessary action
                recipient = Recipient(number=number)
                db.session.add(recipient)
                added_numbers.append(number)
            # Optionally, you can provide feedback to the user
            else:
                return (
                    "Invalid phone number. Please enter a valid !!-digit phone number."
                )
        db.session.commit()
        return "Phone numbers added successfully!"
    else:
        return "Method not allowed."

@app.route("/delete_recipient_number/<int:id>", methods=["DELETE"])
def delete_recipient_number(id):
    recipient = Recipient.query.get(id)
    if recipient:
        db.session.delete(recipient)
        db.session.commit()
        return jsonify({"message": "Recipient number deleted successfully"}), 200
    else:
        return jsonify({"error": "Recipient number not found"}), 404

@app.route("/get_recipient_numbers", methods=["GET"])
def get_recipient_numbers():
    recipients = Recipient.query.all()
    recipient_numbers = [recipient.number for recipient in recipients]
    return jsonify({"recipient_numbers": recipient_numbers}), 200

@app.route("/video")
def video():
    # return Response(generate_frames(path_x='static/uploadedfiles/'), mimetype='multipart/x-mixed-replace; boundary=frame')
    return Response(
        generate_frames(path_x=session.get("video_path", None)),
        mimetype="multipart/x-mixed-replace; boundary=frame",)


# To display the Output Video on Webcam page
@app.route("/webapp")
def webapp():
    # return Response(generate_frames(path_x = session.get('video_path', None),conf_=round(float(session.get('conf_', None))/100,2)),mimetype='multipart/x-mixed-replace; boundary=frame')
    return Response(
        generate_frames_web(path_x=0),
        mimetype="multipart/x-mixed-replace; boundary=frame",)


if __name__ == "__main__":
    app.run(debug=True)
