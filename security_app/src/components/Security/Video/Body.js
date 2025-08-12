import React, { useEffect, useRef, useState } from "react";
import api from "../../../services/api";

export default function Body() {
  const [videoURL, setVideoURL] = useState(null);
  const [btntxt, setbtntxt] = useState("Upload video");
  const [imageURL, setImageURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Function to handle video upload
  function uploadVideo(e) {
    let file = e.target.files[0];
    console.log("Handling video upload");
    setbtntxt("Uploading...");

    // Access the file and start the file reader stream
    setTimeout(() => {
      const reader = new FileReader();
      setbtntxt("Processing...");
      reader.onload = (e) => {
        setVideoURL(reader.result);
        console.log("setVideoURL");
      };
      reader.readAsDataURL(file);
    }, 5000);
    setbtntxt("Upload Video");
  }

  // Constraints for accessing the camera
  const constraint = { video: true };

  // Start the live camera feed
  function startLiveCam(e) {
    console.log("startLiveCam");
    setIsRecording(true); // Set recording state to true
    navigator.mediaDevices
      .getUserMedia(constraint)
      .then((stream) => {
        setStream(stream);
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch((err) => {
        console.error("Error accessing camera: ", err);
      });
  }

  // Stop the live camera feed
  function stopLiveCam() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop()); // Stop each track (audio, video)
      setStream(null); // Clear the stream state
      setIsRecording(false); // Set recording state to false
    }
  }

  // Capture frames from the live video stream/upload and send to backend
  function captureFrame(from) {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    console.log("Video ready state: ", video.readyState);

    if (canvas && video && video.readyState === 4) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the current video frame onto the canvas
      console.log(`capturing Frames from ${from}`);
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert the canvas to a Blob (image format) and send it to the server
      canvas.toBlob(
        (blob) => {
          const formData = new FormData();
          formData.append("frame", blob);

          // Send the frame to the Flask backend and get the processed frame
          api
            .post("/frame_upload/detect", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              responseType: "blob",
            })
            .then((response) => {
              console.log("Frame processed:", response.data);
              const imageBlob = new Blob([response.data], { type: "image/jpeg" });
              const imageURL = URL.createObjectURL(imageBlob);
              setImageURL(imageURL);
            });
        },
        "image/jpeg",
        0.9
      );
    }
  }

  // Capture frames every 3500ms and send to the server
  useEffect(() => {
    let interval;
    if (isRecording || videoURL) {
      interval = setInterval(() => {
        let from = isRecording ? "live video" : "video upload";
        captureFrame(from);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isRecording, videoURL]);

  return (
    <div className="video-upload-body">
      <section className="body-cnt">
        <section className="video-cnt">
          <div className="input-cnt">
            <input
              onChange={uploadVideo}
              accept="video/*"
              style={{ display: "none" }}
              type="file"
              name="file"
              id="file"
            />
          </div>
          <div className="live-feed">
            {(videoURL || isRecording) && (
              <video
                ref={videoRef}
                controls
                autoPlay
                muted
                src={videoURL}
                style={{ width: "70%", height: "auto" }}
              ></video>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
          {imageURL && (
            <div className="side-by-side-container" style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="original-frame">
                <h3>Original Frame</h3>
                {/* canvas for frame capturing (shown when imageURL is available) */}
                <canvas ref={canvasRef} style={{ border: "1px solid black", width: "100%", height: "auto" }}></canvas>
              </div>

              <div className="processed-image">
                <h3>Processed Image</h3>
                <img
                  src={imageURL}
                  className="feed"
                  alt="Processed Detections"
                  style={{ height: "auto", width: "100%" }}
                />
              </div>
            </div>
          )}
          <div className="btn-cnt">
            <label htmlFor="file">{btntxt}</label>
            <button onClick={startLiveCam} hidden={isRecording} disabled={isRecording}>
              Start Live Monitoring
            </button>
            <button onClick={stopLiveCam} hidden={!isRecording} disabled={!isRecording}>
              Stop Live Monitoring
            </button>
          </div>
          {/* canvas for frame capturing */}
        </section>
      </section>
    </div>
  );
}
