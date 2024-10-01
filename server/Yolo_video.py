import cv2, math
from datetime import datetime
from ultralytics import YOLO
from alert import send_detection_alert


def video_detection(path_x, callback_function=send_detection_alert):
    # Create a Webcam Object
    cap = cv2.VideoCapture(path_x)

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
                    frame, label, (x1, y1 - 2), 0, 1, [255, 255, 255], thickness=1, lineType=cv2.LINE_AA,
                )
                detections.append(class_name)
                
                # Call the callback function if it's not None
                if callback_function:
                    for class_name in set(detections):
                        
                        from app import Detection, Personnel
                        personnel = Personnel.personnel_on_active_shift()
                        phone_number = personnel.phone_number
                        callback_function(class_name, phone_number, personnel.id)

                    Detection(
                        detected_classname=class_name,
                        frame_number=frame_number,
                        personnel_id=2,
                        detected_at=datetime.now(),
                        conf_score=conf,
                    ).create()
        
        yield frame
        
    cap.release()

