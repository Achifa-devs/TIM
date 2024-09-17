import React, { useState } from 'react'

export default function Body() {

  let [video, setVideo] = useState('');

  function uploadVideo(e) {
    let file = e.target.files;

    let reader = new FileReader()
    reader.onload=(result => {
      setVideo(reader.result)
      console.log(reader.result)
    })

    reader.readAsDataURL(file[0])
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
