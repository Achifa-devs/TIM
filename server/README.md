# Yolo_Crime_detection_app
Learned new things.
ffmpeg -i input_video.mp4 -vf fps=25 output_frames/frame_%04d.jpg
- for multimedia conversion, for conversion video to images frames cd

Roboflow is image annotations.

Twilo password: ZatZPHTft?6@5@&k


pyqt=5 for This part of the specification is the package name. In this case, it represents PyQt, which is a set of Python bindings for the Qt application framework.
(Qt applications, for GUI (in C++))
lxml- for labelling images(or frames) for supervised machine learning. 
Loading labelimg, python labelImg.py




For video object detection in scenarios involving violence detection, you would typically want a YOLO variant that strikes a balance between speed and accuracy. YOLOv4-tiny or YOLOv5-tiny are lightweight variants that are suitable for real-time video object detection on resource-constrained devices, and they can work well for violence detection, especially if the video streams are continuous and need to be analyzed in real time.

Here are the reasons to consider YOLOv4-tiny or YOLOv5-tiny for video object detection in violence scenarios:

Real-Time Processing: YOLOv4-tiny and YOLOv5-tiny are designed for real-time or near-real-time object detection. They are faster compared to their larger counterparts, making them suitable for processing video streams in real time.

Lightweight: These variants are more lightweight in terms of model size and computational requirements, which can be advantageous for applications running on embedded systems or devices with limited resources.

Reasonable Accuracy: While they sacrifice some accuracy compared to larger YOLO models, YOLOv4-tiny and YOLOv5-tiny can still provide reasonable accuracy for violence detection, especially when trained on a relevant dataset.

Deployment Flexibility: The lightweight nature of these models makes them more suitable for deployment on a variety of platforms, including edge devices, which might be necessary for real-time monitoring in certain scenarios.

To use YOLOv4-tiny or YOLOv5-tiny for violence detection in videos, you will need to:

Collect and label a dataset of violent and non-violent actions or scenes.

Fine-tune the pre-trained YOLOv4-tiny or YOLOv5-tiny model on your dataset. Fine-tuning is essential to adapt the model to your specific detection task.

Implement post-processing techniques and rules to identify violence events based on the model's predictions and confidence scores.

Remember that achieving good performance in violence detection also depends on the quality and diversity of your training data, as well as how well the model is fine-tuned. Careful data collection, preprocessing, and training are crucial to the success of your video object detection system.
what is describe as crime are weapon
classes: Fighting, burglary, robbery