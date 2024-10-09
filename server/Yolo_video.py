import math, os

from datetime import datetime

import boto3, cv2

from botocore.config import Config
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from flask import current_app
from ultralytics import YOLO

from alert import send_detection_alert


load_dotenv()

BUCKET = os.getenv("BACKBLAZE_BUCKET")
END_POINT = os.getenv("BACKBLAZE_BUCKET_ENDPOINT")
KEY_NAME = os.getenv("BACKBLAZE_KEY_NAME")
KEY_ID = os.getenv("BACKBLAZE_KEY_ID")
APP_KEY = os.getenv("BACKBLAZE_APPLICATION_KEY")
LOCAL_NAME = "best.pt"
DIR = os.getenv("DIR", "/usr/models/yolo")

if not os.path.exists(DIR):
    os.makedirs(DIR)

MODEL_FILE_PATH = os.path.join(DIR, LOCAL_NAME)


def get_b2_resource(end_point, key_id, application_key):
    return boto3.resource(
        service_name='s3',
        endpoint_url=end_point,
        aws_access_key_id=key_id,
        aws_secret_access_key=application_key,
        config=Config(signature_version='s3v4')
    )


def download_model(bucket, file_path, key_name, b2):
    try:
        b2.Bucket(bucket).download_file(key_name, file_path)
    except ClientError as ce:
        print('error', ce)


def load_model():
    if LOCAL_NAME not in os.listdir(DIR):
        b2 = get_b2_resource(END_POINT, KEY_ID, APP_KEY)
        download_model(BUCKET, MODEL_FILE_PATH, KEY_NAME, b2)
    model = YOLO(MODEL_FILE_PATH)
    return model


def video_detection(path_x, callback_function=send_detection_alert):
    # Create a Webcam Object
    cap = cv2.VideoCapture(path_x)

    model = load_model()

    class_names = ["Burglary", "Fighting", "Robbery"]
    frame_number = 0
    
    while True:
        success, frame = cap.read()
        if not success:
            print("Failed to grab frame")
            break
        
        frame_number = int(cap.get(cv2.CAP_PROP_POS_FRAMES))
        timestamp = datetime.now()
        detections = []

        results = model(frame, stream=True)
        for r in results:
            boxes = r.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 255), 3)
                conf = math.ceil((box.conf[0] * 100)) / 100
                cls = int(box.cls[0])
                class_name = class_names[cls]
                label = f"{class_name}{conf}"
                t_size = cv2.getTextSize(label, 0, fontScale=1, thickness=2)[0]
                c2 = x1 + t_size[0], y1 - t_size[1] - 3
                cv2.rectangle(frame, (x1, y1), c2, [255, 0, 255], -1, cv2.LINE_AA)
                cv2.putText(
                    frame, label, (x1, y1 - 2), 0, 1, [255, 255, 255], thickness=1, lineType=cv2.LINE_AA,
                )
                detections.append(class_name)
                
                # Call the callback function if it's not None
                if callback_function:
                    for class_name in set(detections):
                        
                        from app import Detection, Personnel
                        
                        with current_app.app_context():
                            personnel = Personnel.personnel_on_active_shift()
                            phone_number = personnel.phone_number
                            callback_function(class_name, phone_number, personnel.id)

                    Detection(
                        detected_classname=class_name,
                        frame_number=frame_number,
                        personnel_id=2,
                        detected_at=timestamp,
                        conf_score=conf,
                    ).create()
        
        yield frame
    print(detections)
    cap.release()
