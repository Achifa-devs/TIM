import React, { useState, useRef, useEffect } from 'react';
import getSocket from '../../../services/socket';
import { formToJSON } from 'axios';


const { socket } = getSocket;

export default function Body() {
  
  const [videoURL, setVideoURL] = useState(null);
  const [btntxt, setbtntxt] = useState('Upload video');
  const [detections, setDetections] = useState([]);
  const [imageURL, setImageURL] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);


  // Function to handle video upload
  function uploadVideo(e) {
    let file = e.target.files[0];
    console.log('Handling video upload');
    setbtntxt('Uploading...');

    // Access the file and start the file reader stream
    setTimeout(() => {
      const reader = new FileReader();
      setbtntxt('Processing...');
      reader.onload = (e => {
        setVideoURL(reader.result);
        console.log('setVideoURL');
      });
      reader.readAsDataURL(file);
    }, 5000);
    setbtntxt('Upload Video');
  }


  // Constraints for accessing the camera
  const constraint = {video: true};


  // Start the live camera feed
  function startLiveCam(e) {
    console.log('startLiveCam');
    setIsRecording(true); // Set recording state to true
    navigator.mediaDevices.getUserMedia(constraint)
      .then((stream) => {
        setStream(stream);
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
        .catch((err) => {
          console.error('Error accessing camera: ', err);
        });
  }

    // Stop the live camera feed
    function stopLiveCam() {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop()); // Stop each track (audio, video)
        setStream(null); // Clear the stream state
        setIsRecording(false); // Set recording state to false
      }
    };
    
  let count = 0;
  socket.on('processed frame', (response) => {
    console.log('Frame processed:', response);
    count += 1;
    console.log(count, 'processed frames');
    if (response.processed && response.frame_bytes) {
      const imageBlob = new Blob([response.frame_bytes], { type: 'image/jpeg' });
      const imageURL = URL.createObjectURL(imageBlob);
        setImageURL(imageURL);
    } else {
      console.log('Failed to process frame');
    }
  });

  // Capture frames every 3500ms and send to the server
  useEffect(() => {
    const captureFrame = (from) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      count += 1;
      console.log(count, 'captured frames');
      if (!canvas || !video) {
        console.error('Canvas or video element is not available');
        return;
      }

      if (video.paused || video.ended) {
        console.log('Video is paused or ended, skipping frame capture.');
        return;
      }
      
      if (video.readyState === 4) {
        console.log(`Capturing frame from ${from}`);
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
  
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const formData = new FormData();
            console.log(blob)
            formData.append('frame', blob);
            socket.emit('frame upload', formToJSON(formData));
          }
        }, 'image/jpeg', 0.9);
      } else {
        console.log('Video is not ready for capturing frames.');
        setbtntxt('Upload Video')
      }
    };
  
    let interval;
    if (isRecording || videoURL) {
      interval = setInterval(() => {
        const from = isRecording ? "live video" : "video upload";

        if (videoRef.current.ended) {
          console.log('Video has ended, clearing interval.');
          clearInterval(interval);  // Stop capturing frames when video ends
        } else {
          captureFrame(from);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval)
    };
  
  }, [isRecording, videoURL]); 

  return (
    <div className="video-upload-body">
      <section className="body-cnt">
        <section className="video-cnt" style={{ margin: '0 auto', width: '50%' }}>
          <div className="input-cnt">
            <input
              onChange={uploadVideo}
              accept="video/*"
              style={{ display: 'none' }}
              type="file"
              name="file"
              id="file"
            />
          </div>
          <div className="btn-cnt" style={{ margin: '1rem 0'}}> 
            <label htmlFor="file">{btntxt}</label>
            <button onClick={startLiveCam} hidden={isRecording} disabled={isRecording}>Start Live Monitoring</button>
            <button onClick={stopLiveCam} hidden={!isRecording} disabled={!isRecording}>Stop Live Monitoring</button>
          </div>
          <div className="live-feed">
            {(videoURL || isRecording) && (
              <video
                ref={videoRef}
                controls
                autoPlay
                muted
                src={videoURL}
                style={{ width: '70%', height: '65%', margin: '0 auto' }}
              ></video>
            )}
          </div>
          <canvas
            ref={canvasRef}
            style={{ display: 'none'}}
          ></canvas>
          {imageURL && (
            <div className="side-by-side-container" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="original-frame">
                <h3>Original Frame</h3>
                {/* canvas for frame capturing (shown when imageURL is available) */}
                <canvas
                  ref={canvasRef}
                  style={{ border: '1px solid black', width: '100%', height: 'auto' }}
                ></canvas>
              </div>

              <div className="processed-image">
                <h3>Processed Image</h3>
                <img
                  src={imageURL}
                  className="feed"
                  alt="Processed Detections"
                  style={{ height: 'auto', width: '100%' }}
                />
              </div>
            </div>
          )}
          {/* canvas for frame capturing */}
        </section>
      </section>
    </div>
  );
}
