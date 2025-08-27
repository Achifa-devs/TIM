/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import api from "../services/api";
import { useSelector } from "react-redux";

export default function AddShiftOverlay({ users }) {
  //    let [period,setPeriod] = useState('morning')
  //    let [duration,setDuration] = useState('2')
  let [start_time, set_start_time] = useState("00:00");
  let [end_time, set_end_time] = useState("00:00");
  let {info} = useSelector(s=> s.info)

  // Function to calculate the shift name based on start and end times
  function getShiftName(startTime, endTime) {
    const startHour = parseInt(startTime.split(":")[0], 10);
    const endHour = parseInt(endTime.split(":")[0], 10);

    // Short Shifts logic (1 AM to 11 AM -> Morning, etc.)
    if (startHour >= 1 && startHour < 11) {
      return "Morning Shift";
    } else if (startHour >= 12 && startHour < 18) {
      return "Afternoon Shift";
    } else if (startHour >= 19 || startHour === 0) {
      return "Night Shift";
    }

    // Long Shifts logic (6 AM to 6 PM -> Day Shift, etc.)
    if (startHour >= 6 && startHour < 18 && endHour <= 18) {
      return "Day Shift";
    } else if (startHour >= 18 || endHour < 6) {
      return "Night Shift";
    }

    return "Invalid shift";
  }

  useEffect(() => {
    console.log(users);
  }, [users]);

  function uploadShift() {
    const calculatedShiftName = getShiftName(start_time, end_time);

    api
      .post("https://api.sinmfuoyeplatform.com.ng/api/v1/shifts", { name: calculatedShiftName, start_time, end_time, id: info?.id })
      .then((response) => {
        // console.log('...',response)
        if (response.data) { 
          window.localStorage.setItem("accessToken", response.data.access_token);

          alert("Shift Created");
          let elem = document.querySelector(".shift-overlay");
          elem.removeAttribute("id");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      <form
        style={{
          height: "500px",
          background: "#fff",
          width: "300px",
          borderRadius: "5px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "10px",
        }}
      >
        <h4
          className=""
          style={{
            padding: "10px",
            margin: "0",
            borderBottom: "1px solid #efefef",
            height: "50px",
            width: "100%",
            background: "#fff",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            color: "blueviolet",
            justifyContent: "space-between",
          }}
        >
          Create New Shift
        </h4>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#efefef",
            height: "70%",
            padding: "10px",
          }}
        >
          {/* <div className="input-cnt">
                        <select onClick={e=>setPeriod(e.target.value)} name="" id="">
                            <option value="">Select Shift</option>
                            <option value="morning">Morning Shift</option>
                            <option value="noon">Noon Shift</option>
                            <option value="evening">Evening Shift</option>
                            <option value="night">Night Shift</option>
                        </select>
                    </div>
                    <div className="input-cnt">
                        <select onInput={e => setDuration(e.target.value)} name="" id="">
                            <option value="">Select Duration</option>
                            <option value="2">2 hours</option>
                            <option value="3">3 hours</option>
                            <option value="4">4 hours</option>
                            <option value="5">5 hours</option>
                        </select>
                    </div> */}

          <div className="input-cnt">
            <label style={{ height: "auto", width: "auto", background: "transparent", color: "#000" }} htmlFor="">
              <small>Start Tme</small>
            </label>
            <input onInput={(e) => set_start_time(e.target.value)} type="time" name="" id="" />
          </div>
          <div className="input-cnt">
            <label style={{ height: "auto", width: "auto", background: "transparent", color: "#000" }} htmlFor="">
              <small>End Time</small>
            </label>
            <input onInput={(e) => set_end_time(e.target.value)} type="time" name="" id="" />
          </div>

          <div className="input-cnt">
            <select
              
              name=""
              id=""
            >
              <option value="">Select Security</option>
              {/* {users.map((item, index) => {
                return (
                  <option key={index} value={item?.id}>
                    {`${index + 1}.  ${item?.first_name} ${item?.last_name}`}
                  </option>
                );
              })} */}
            </select>
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
          <button
            onClick={(e) => {
              e.preventDefault();
              uploadShift();
            }}
          >
            Add
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              let elem = document.querySelector(".shift-overlay");
              elem.removeAttribute("id");
            }}
          >
            Cancel
          </button>
        </section>
      </form>
    </>
  );
}
