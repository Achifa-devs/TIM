# Import necessary libraries and modules
from flask import Flask, render_template, Response, request, session
from flask_wtf import FlaskForm
from wtforms import FileField, SubmitField
from werkzeug.utils import secure_filename
import os
import cv2
from Yolo_video import video_detection
from alert_module import send_sms_alert

# Create Flask app instance
app = Flask(__name__)
app.config['SECRET_KEY'] = 'tim'
app.config['UPLOAD_FOLDER'] = 'static/uploadedfiles'

# Define FlaskForm for file upload
class UploadFileForm(FlaskForm):
    file = FileField("File")
    submit = SubmitField("Run")

# Route for home page
@app.route('/', methods=['GET', 'POST'])
def home():
    form = UploadFileForm()
    if form.validate_on_submit():
        file = form.file.data
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename)))
        session['video_path'] = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
    return render_template('index.html', form=form)

# Function to generate frames from video
def generate_frames(path_x='', callback_function=None):
    yolo_output = video_detection(path_x, callback_function=callback_function)
    for detection_ in yolo_output:
        ref, buffer = cv2.imencode('.jpg', detection_)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# Route to stream video with object detection
@app.route('/video')
def video():
    return Response(generate_frames(path_x=session.get('video_path', None)), mimetype='multipart/x-mixed-replace; boundary=frame')

# Callback function to handle alerts based on detected objects
def send_alert(class_name):
    if class_name in ["fighting", "burglary", "robbery"]:
        message = f"{class_name.capitalize()} detected at student gate!"
        send_sms_alert(message)

# Function to generate frames with alerts
def generate_frames_with_alerts(path_x=''):
    yolo_output = video_detection(path_x, callback_function=send_alert)
    for detection_ in yolo_output:
        ref, buffer = cv2.imencode('.jpg', detection_)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

# Route to stream video with object detection and alerts
@app.route('/video_with_alerts')
def video_with_alerts():
    return Response(generate_frames_with_alerts(path_x=session.get('video_path', None)), mimetype='multipart/x-mixed-replace; boundary=frame')

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
