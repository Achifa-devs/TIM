/* eslint-disable no-unused-vars */
import React from "react";
import AddShiftOverlay from '../../../reusables/newShiftOverlay'

export default function Summary() {
  function handleShift() {
    // alert('')
    let e = document.querySelector(".shift-overlay");
    if (e.hasAttribute("id")) {
      e.removeAttribute("id");
    } else {
      e.setAttribute("id", "shift-overlay");
    }
  }

  function handleShiftOverlay(e) {
    if (e.target === e.currentTarget) {
      let e = document.querySelector(".shift-overlay");
      e.removeAttribute("id");
    }
  }
  return (
    <>


      <div className="shift-summary">
        <section>
          <small>
            <b>Add Your Shift For Approval From Admin</b>
          </small>
          <button onClick={(e) => handleShift()} style={{ width: "auto", height: "auto", padding: "5px" }}>
            <small>
              <b>Add Shift + </b>
            </small>
          </button>
        </section>
      </div>
    </>
  );
}
