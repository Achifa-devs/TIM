import { React } from 'react'


export default function Summary({ currentTime }) {

  return (
    <>
      <div className="shift-summary">
      <div className="current-time">
        <h2>Current Time: {currentTime.toLocaleTimeString()}</h2>
      </div>
        <section>
          <small><b>Here goes your shifts</b></small>
        </section>
      </div>
    </>
  )
}


