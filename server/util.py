import math, os

import boto3, cv2
from botocore.config import Config
from botocore.exceptions import ClientError
from dotenv import load_dotenv
import numpy as np
from ultralytics import YOLO


load_dotenv(".env.server")


BUCKET = os.getenv("B2_BUCKET")
B2_ENDPOINT = os.getenv("B2_BUCKET_ENDPOINT")
KEY_NAME = os.getenv("B2_KEY_NAME")
KEY_ID = os.getenv("B2_KEY_ID")
APP_KEY = os.getenv("B2_APPLICATION_KEY")
LOCAL_NAME = "best.pt"
CURRENT_DIR = os.path.dirname(__file__)
MODEL_DIR = os.path.join(CURRENT_DIR, "model\\weights")

if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

MODEL_FILE_PATH = os.path.join(MODEL_DIR, LOCAL_NAME)


def get_b2_resource():
    b2 = boto3.resource(
        service_name="s3",
        endpoint_url=B2_ENDPOINT,
        aws_access_key_id=KEY_ID,
        aws_secret_access_key=APP_KEY,
        config=Config(signature_version="s3v4"),
    )
    return b2


def download_model(logger=None):
    if not os.path.exists(MODEL_FILE_PATH):
        logger.info(f"Downloading model weights to {MODEL_FILE_PATH}")
        b2 = get_b2_resource()
        bucket = b2.Bucket(BUCKET)
        try:
            bucket.download_file(KEY_NAME, MODEL_FILE_PATH)
        except ClientError as ce:
            logger.error(f"Error download model weights {ce}")
    logger.info(f"Model weights downloaded to {MODEL_FILE_PATH}")


def detect(frame_data):
    frame = process_frame_data(frame_data)

    model = YOLO("./notebooks/best.pt")

    class_names = ["Burglary", "Fighting", "Robbery"]

    # YOLO detection on the provided frame
    results = model(frame, stream=True)
    detections = []  # To store detected classes in this frame

    # Process the YOLO detection results
    for r in results:
        boxes = r.boxes

        if len(boxes) == 0:
            return None, None

        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0]
            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

            # Draw a rectangle on the detected object
            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 255), 3)

            # Get the confidence score and class name
            conf = math.ceil((box.conf[0] * 100)) / 100
            cls = int(box.cls[0])
            class_name = class_names[cls]
            label = f"{class_name} {conf}"

            # Draw the label on the frame
            t_size = cv2.getTextSize(label, 0, fontScale=1, thickness=2)[0]
            c2 = x1 + t_size[0], y1 - t_size[1] - 3
            cv2.rectangle(frame, (x1, y1), c2, [255, 0, 255], -1, cv2.LINE_AA)
            cv2.putText(
                frame,
                label,
                (x1, y1 - 2),
                0,
                1,
                [255, 255, 255],
                thickness=1,
                lineType=cv2.LINE_AA,
            )

            # Append the detected class
            detections.append((class_name, conf))

    return to_bytes(frame), detections  # Return the modified frame


def process_frame_data(frame_bytes):
    # Read the frame data and decode
    np_frame = np.frombuffer(frame_bytes, dtype=np.uint8)
    frame = cv2.imdecode(np_frame, cv2.IMREAD_COLOR)
    return frame


def to_bytes(processed_frame):
    # Ensure frame is being processed in a loop
    while processed_frame is not None:
        # Encode the frame as JPEG
        success, buffer = cv2.imencode(".jpeg", processed_frame)
        if not success:
            continue

        frame = buffer.tobytes()
        return frame
