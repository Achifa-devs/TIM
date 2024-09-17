# test_Yolo_video.py

from Yolo_video import video_detection

# Provide the path to the test video
video_path = "figthtest3.mp4"

# Define a dummy callback function for testing
def dummy_callback(class_name):
    print("Detected class:", class_name)

# Call the video_detection function with debug messages
for frame in video_detection(video_path, callback_function=dummy_callback):
    pass  # You can perform additional processing if needed
