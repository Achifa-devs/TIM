import React, { useEffect, useRef, useState } from "react";
import api from "../../../services/api";

export default function Body() {
  const [videoURL] = useState(null);
  // const [btntxt, setbtntxt] = useState("Upload video");
  const [imageURL, setImageURL] = useState(null);
  const [isRecording] = useState(false);
  const [result, setResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  function loaderSwitch(params) {
    let elem = document.querySelector(".loader-overlay");
    if (elem.hasAttribute("id")) {
      elem.removeAttribute("id");
    } else {
      elem.setAttribute("id", "loader-overlay");
    }
  }

  // Function to handle video upload
  function uploadVideo(e) {
    let file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      setImageURL(e.target.result);
    };

    reader.readAsDataURL(file);

    loaderSwitch();
    // Create FormData
    let formData = new FormData();
    formData.append("file", file); // "video" must match backend field name

    api
      .post("https://api.sinmfuoyeplatform.com.ng/api/v1/detect/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${window.localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        setResult(response?.data);
        console.log("Upload success:", response.data.violence_detected);
        loaderSwitch();
        const isViolent = response.data.violence_detected ? "Violence Detected" : "No Violence Detected";
        alert(isViolent);
      })
      .catch((err) => {
        loaderSwitch();
        alert("Internal server error");
        console.error("Upload failed:", err);
      });
  }

  function uploadImage(e) {
    let file = e.target.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      setImageURL(e.target.result);
    };

    reader.readAsDataURL(file);

    loaderSwitch();
    // Create FormData
    let formData = new FormData();
    formData.append("file", file); // "video" must match backend field name

    api
      .post("https://api.sinmfuoyeplatform.com.ng/api/v1/detect/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${window.localStorage.getItem("accessToken")}`,
        },
      })
      .then((response) => {
        setResult(response?.data);
        console.log("Upload success:", response.data.violence_detected);
        loaderSwitch();
        const isViolent = response.data.violence_detected ? "Violence Detected" : "No Violence Detected";
        alert(isViolent);
      })
      .catch((err) => {
        loaderSwitch();
        alert("Internal server error");
        console.error("Upload failed:", err);
      });
  }

  // Constraints for accessing the camera
  // const constraint = { video: true };

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
              name="video"
              id="video"
            />
            <input
              onChange={uploadImage}
              accept="image/*"
              style={{ display: "none" }}
              type="file"
              name="image"
              id="image"
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

          <div className="btn-cnt">
            <label htmlFor="video">Upload Video</label>
            <label htmlFor="image">Upload Image</label>

            {/* <button onClick={startLiveCam} hidden={isRecording} disabled={isRecording}>
              Start Live Monitoring
            </button>
            <button onClick={stopLiveCam} hidden={!isRecording} disabled={!isRecording}>
              Stop Live Monitoring
            </button> */}
          </div>
          {imageURL && (
            <div className="side-by-side-container" style={{ display: "flex", justifyContent: "space-between" }}>
              {/* <div className="original-frame"> */}
              {/* <h3>Original Frame</h3> */}
              {/* canvas for frame capturing (shown when imageURL is available) */}
              {/* <canvas ref={canvasRef} style={{ border: "1px solid black", width: "100%", height: "auto" }}></canvas> */}
              {/* </div> */}

              <div className="processed-image" style={{ width: "100%", height: "90%", marginTop: "20px" }}>
                {/* <h3>Processed Image</h3> */}
                <img
                  src={imageURL}
                  className="feed"
                  alt="Processed Detections"
                  style={{ height: "auto", width: "100%" }}
                />
              </div>
            </div>
          )}
          {/* canvas for frame capturing */}
        </section>

        <section
          className="result-cnt"
          style={{
            width: "45%",
            display: "flex",
            alignTtems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <p>
            Frame: <b>{result?.frame}</b>
          </p>
          <p>
            Violence detected: <b>{result?.violence_detected ? "Yes" : "No"}</b>
          </p>
          <p>
            Confidence: <b>{result?.confidence}</b>
          </p>
          <div>
            Detections:
            <b>{result?.detections?.length > 0 ? result?.detections?.map((item) => <p>{item}</p>) : "No detections"}</b>
          </div>
        </section>
      </section>
    </div>
  );
}
