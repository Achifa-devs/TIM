import React from 'react'

export default function Summary() {
  return (
    <>
      <div className="video-upload-summary">
        <section>
          <b>Active Shift</b>
          <div style={{margin: '0px 0px 5px 0px'}}><small>Night Shift: 10:00 PM - 01:00 AM</small></div>
          <div className="btn-cnt">
            <button>
              <small>End Shift</small>
            </button>
            <button>
              <small>Switch Shift</small>
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
