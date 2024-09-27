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

    # out=cv2.VideoWriter('output.avi', cv2.VideoWriter_fourcc('M', 'J', 'P','G'), 10, (frame_width, frame_height))

    # Specify the path to your custom weights file
    custom_weights_path = "./notebooks/best.pt"

    # Initialize YOLO model with custom weights
    model = YOLO(custom_weights_path)

    class_names = ["Burglary", "Fighting", "Robbery"]
    # if class_names in ["fighting", "burglary", "robbery"]:
    #     message = f"{class_names.capitalize()} detected at student gate!"
    #     return message

    while True:
        success, img = cap.read()
        if not success:
            print("Failed to grab frame")
            break
        frame_number = int(cap.get(cv2.CAP_PROP_POS_FRAMES))
        timestamp = datetime.now()

        results = model(img, stream=True)
        for r in results:
            boxes = r.boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0]
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                print(x1, y1, x2, y2)
                cv2.rectangle(img, (x1, y1), (x2, y2), (255, 0, 255), 3)
                conf = math.ceil((box.conf[0] * 100)) / 100
                cls = int(box.cls[0])
                class_name = class_names[cls]
                label = f"{class_name}{conf}"
                t_size = cv2.getTextSize(label, 0, fontScale=1, thickness=2)[0]
                print(t_size)
                c2 = x1 + t_size[0], y1 - t_size[1] - 3
                cv2.rectangle(
                    img, (x1, y1), c2, [255, 0, 255], -1, cv2.LINE_AA
                )  # filled
                cv2.putText(
                    img,
                    label,
                    (x1, y1 - 2),
                    0,
                    1,
                    [255, 255, 255],
                    thickness=1,
                    lineType=cv2.LINE_AA,
                )

                # Call the callback function if it's not None
                if callback_function:
                    callback_function(class_name)

                    from server.app import ViolenceDetection, Personnel

                    ViolenceDetection(
                        detected_classname=class_name,
                        frame_number=frame_number,
                        personnel_id=Personnel.personnel_on_active_shift(),
                        detected_at=datetime.now(),
                    ).create()

        yield img
        # out.write(img)
        # cv2.imshow("image", img)
        # if cv2.waitKey(1) & 0xFF==ord('1'):
        # break
    # out.release()

    cap.release()
    cv2.destroyAllWindows()
