import React, { useState, useRef } from 'react'
import api from '../../../services/api'

export default function Body() {

  let [video, setVideo] = useState('');
  let [btntxt, setbtntxt] = useState('Upload video');
  let [detections, setDetections] = useState([]); 

  const videoRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);

  function uploadVideo(e) {
    let file = e.target.files[0];
    setbtntxt('Processing...')

    // Create FormData and send to Flask backend
    let formData = new FormData();
    formData.append('video', file);

    api.post('/process_video/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType: 'blob'
    })
    .then(response => {
      setDetections(response.data);
      console.log(response.data);
      setbtntxt('Upload video')

      const videoBlob = new Blob([response.data], { type: 'video/mp4' });
      const videoURL = URL.createObjectURL(videoBlob);
      setVideoURL(videoURL);


      let reader = new FileReader()
      reader.onload=(result => {
        setVideo(reader.result)
        // console.log(reader.result)
      })
      reader.readAsDataURL(file)
    })
    .catch(error => {
      setbtntxt('Upload video')

      console.error("There was an error uploading the video!", error);
    });


    // console.log(file)
  }

  const constraint = {
    video: true
  }

  function startLiveCam(e) {
    let feed = document.querySelector('.feed');
    feed.src = api.defaults.baseURL + '/video_feed';
  }


  return (
    <>
      <div className="video-upload-body">
        <section className='body-cnt'>
          <section className='video-cnt'>
            <div className='video'>
              <video controls style={{height: '80%', width: '80%'}} autoPlay src={video}></video>
            </div>
            <div className="input-cnt">
              <input onChange={uploadVideo} accept='video/*' style={{display: 'none'}} type="file" name="file" id="file" />
            </div>
            <div className='live-feed'>
              <img src='' className='feed' alt="Detections" />
              {/* <img src='http://localhost:5000/api/v1/video_feed' alt="Detections" /> */}
            </div>
            <div>
              <h2>Upload a Video for Detection</h2>
              <input type="file" accept="video/*" onChange={uploadVideo} />
              {videoURL && (
                <div>
                  <h3>Detected Video</h3>
                  <video ref={videoRef} controls autoPlay muted src={videoURL} style={{ width: '70%', height: 'auto' }}></video>
                </div>
              )}
            </div>
            <div className='btn-cnt'>
              <label htmlFor="file">
                {btntxt}
              </label>
              <button onClick={startLiveCam}>
                Start Live Monitoring
              </button>
            </div>
          </section>
          
        </section>
      </div>
    </>
  )
}


