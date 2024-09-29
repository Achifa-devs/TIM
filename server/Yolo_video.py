import cv2, math
from datetime import datetime
from ultralytics import YOLO


def video_detection(path_x, callback_function=None):
    """Video Detection Function

    Args:
        path_x (str): Video Path
        callback_function (function, optional): Function to be called when a new frame is detected. Defaults to None.

    Yields:
        tuple: Frame and Frame Number

    """
    video_capture = path_x

    # Create a Webcam Object
    cap = cv2.VideoCapture(video_capture)
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_rate = cap.get(cv2.CAP_PROP_FPS)

    # Specify the path to your custom weights file
    custom_weights_path = "./notebooks/best.pt"

    # Initialize YOLO model with custom weights
    model = YOLO(custom_weights_path)

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
                    frame,
                    label,
                    (x1, y1 - 2),
                    0,
                    1,
                    [255, 255, 255],
                    thickness=1,
                    lineType=cv2.LINE_AA,
                )
                detections.append(class_name)
                
                # Call the callback function if it's not None
                if callback_function:
                    for class_name in set(detections):
                        callback_function(class_name, 9867545678)

                    from app import Detection, Personnel

                    Detection(
                        detected_classname=class_name,
                        frame_number=frame_number,
                        personnel_id=2,
                        detected_at=datetime.now(),
                    ).create()
        print( f"this is the frame number {frame_number}")
        yield frame 
        
    cap.release()
    cv2.destroyAllWindows()


def process_uploaded_video(video_path):
    cap = cv2.VideoCapture(video_path)
    model = YOLO("./notebooks/best.pt")  # Custom YOLO model

    class_names = ["Burglary", "Fighting", "Robbery"]
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
        
        # YOLO detection
        results = model(frame, stream=True)
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Bounding box coordinates
                x1, y1, x2, y2 = int(box.xyxy[0][0]), int(box.xyxy[0][1]), int(box.xyxy[0][2]), int(box.xyxy[0][3])
                conf = math.ceil((box.conf[0] * 100)) / 100
                cls = int(box.cls[0])
                class_name = class_names[cls]
                
                # Draw rectangle and text on the frame
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 255), 3)
                label = f"{class_name} {conf}"
                cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)

        # Encode the frame to JPEG format
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        # Return the frame in a multipart response
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
    
    cap.release()
