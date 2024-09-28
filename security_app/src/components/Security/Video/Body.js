import React, { useState } from 'react'
import api from '../../../services/api'

export default function Body() {

  let [video, setVideo] = useState('');
  let [detections, setDetections] = useState([]); 

  function uploadVideo(e) {
    let file = e.target.files[0];

    // Create FormData and send to Flask backend
    let formData = new FormData();
    formData.append('video', file);

    api.post('/process_video/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      setDetections(response.data);
      console.log(response.data);

      let reader = new FileReader()
      reader.onload=(result => {
        setVideo(reader.result)
        // console.log(reader.result)
      })
      reader.readAsArrayBuffer(response.data.frames)
    })
    .catch(error => {
      console.error("There was an error uploading the video!", error);
    });


    // console.log(file)
  }

  const constraint = {
    video: true
  }

  function startLiveCam(e) {
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
      navigator.mediaDevices.getUserMedia(constraint)
      .then((stream) => {
        document.querySelector('video').srcObject = stream
      })
      .catch(err => console.log(err))
    }else{

    }
  }
  return (
    <>
      <div className="video-upload-body">
        <section className='body-cnt'>
          <section className='video-cnt'>
            <div className='video'>
              <video controls style={{height: '100%', width: '100%'}} autoPlay src={video}></video>
            </div>
            <div className="input-cnt">
              <input onChange={uploadVideo} accept='video/*' style={{display: 'none'}} type="file" name="file" id="file" />
            </div>
            <div className='btn-cnt'>
              <label htmlFor="file">
                Upload Video
              </label>
              <button onClick={startLiveCam}>
                Use Live Camera/CCTV
              </button>
            </div>
          </section>
          
        </section>
      </div>
    </>
  )
}
