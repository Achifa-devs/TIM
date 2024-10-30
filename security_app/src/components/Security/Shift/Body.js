import { React, useEffect, useState } from 'react';
import getSocket from '../../../services/socket';


const { adminSocket } = getSocket;

export default function Body({ shifts }) {

  const [currentShiftList, setCurrentShiftList] = useState([])

  useEffect(() => {

    const checkShifts = (now) => {
      const updatedShifts = shifts.map(shift => {
        const startTime = new Date(shift.start_time);
        const endTime = new Date(shift.end_time);

        // Adjust the date to account for shifts crossing midnight
        if (endTime.toLocaleTimeString() < startTime.toLocaleTimeString()) {
          endTime.setDate(endTime.getDate() + 1); // Shift end_time to the next day
        }

        // Check if the current time is within the shift's start and end times
        if (shift.status === 'active') {
          if (now >= startTime.toLocaleTimeString() && now <= endTime.toLocaleTimeString()) {
            return shift;
          } else {
            adminSocket.emit('update shift status', { shift_id: shift.id, status: 'inactive' })
            return { ...shift, status: 'inactive' };
          }
        } else { // Shift status is not active (inactive)
          if (now >= startTime.toLocaleTimeString() && now <= endTime.toLocaleTimeString()) {
            adminSocket.emit('update shift status', { shift_id: shift.id, status: 'active' })
            return { ...shift, status: 'active' };
          } else {
            return shift;
          }
        }
      });

      setCurrentShiftList(updatedShifts)
    };

    checkShifts(new Date().toLocaleTimeString());

    const intervalId = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      checkShifts(now);
    }, 300000);

    return () => clearInterval(intervalId);
  }, [shifts]);


  return (
    <>
      <div className="shift-body">
        <section style={{ margin: '0 auto 2.5rem auto', width: '100%', display: 'flex', justifyContent: 'space-evenly' }}>
          {(() => {
            const isActive = currentShiftList.filter(shift => shift.status === 'active');
            if (isActive.length > 0) {
              return (
                <>

                  {isActive.map((shift, index) => (
                    <div key={index}>
                      <b style={{ textTransform: 'capitalize' }}>{shift.shift_name}</b>
                      <button
                        style={{
                          background: 'green',
                          margin: '0 12px',
                          height: 'auto',
                          width: 'auto',
                          padding: '5px',
                        }}
                      >
                        Active
                      </button>
                      <div>
                        <small>Duration</small>&nbsp;<small>{shift.duration} hours</small>
                      </div>
                      <div>
                        <small>
                          {shift.start_time ? shift.start_time.split('T')[1] : 'N/A'} -{' '}
                          {shift.end_time ? shift.end_time.split('T')[1] : 'N/A'}
                        </small> <br></br>
                        <small>Assigned to {shift.personnel_on_shift.first_name} {shift.personnel_on_shift.last_name}</small>
                      </div>
                    </div>
                  ))}
                </>
              );
            }
          })()}
        </section>
        <ul>
          {Array.isArray(currentShiftList) && currentShiftList.length > 0 ? (
            currentShiftList.filter(shift => shift.status === 'inactive').map((shift, index) => (
              <li style={{ marginBottom: '10px' }} key={index}>
                <section>
                  <div>
                    <b style={{ textTransform: 'capitalize' }}>{shift.shift_name}</b>
                    {shift.status === 'active' &&
                      <button style={{ background: 'green', margin: '0 12px', height: 'auto', width: 'auto', padding: '5px' }}>
                        Active
                      </button>
                    }
                  </div>
                  <div>
                    <small>Duration</small>
                    &nbsp;
                    <small>{shift.status} hours</small>
                  </div>
                  <div>
                    <small>
                      {shift.start_time ? shift.start_time.split('T')[1] : 'N/A'} -
                      {shift.end_time ? shift.end_time.split('T')[1] : 'N/A'}
                    </small>
                  </div>
                </section>
                <section>
                  <div>
                    <button
                      disabled={new Date(shift.end_time).toLocaleTimeString() > new Date().toLocaleTimeString()}
                      style={{ background: 'red', height: 'auto', width: 'auto', padding: '5px', disabled: 'green' }}
                    >
                      End Shift
                    </button>
                  </div>
                  <div style={{ width: '100%' }}>
                    <small style={{ float: 'right', fontSize: 'x-small' }}>
                      <b>Set By Admin {new Date(shift.created_at).toLocaleDateString()}</b>
                    </small>
                  </div>
                </section>
              </li>
            ))
          ) : (
            <section>No Assigned Shifts</section>
          )}
        </ul>
      </div>
    </>
  );
}
