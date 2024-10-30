import React, { useEffect, useState } from 'react'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Shift/Summary'
import '../../components/Security/Shift/styles/xxl.css'
import Body from '../../components/Security/Shift/Body'
import getSocket from '../../services/socket'


const { socket } = getSocket;

export default function Shift() {

  const [shiftList, setShiftList] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date());
  

  useEffect(() => {

    socket.emit('admin_get_shifts');
    socket.on('fetch shifts', (response) => {
      console.log('fetched shifts', response);
      setShiftList(response);
    });

    socket.on('shift added', (response) => {
      console.log('new shift', response);
      setShiftList((shifts) => [response.shift, ...shifts]);
    });

    socket.on('updated_shift', (response) => {
      console.log('updated shift', response);
      setShiftList((prevShifts) => prevShifts.map((shift) => shift.id === response.id ? response : shift));
    });

    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);  
    }, 1000); 

    return () => {
      clearInterval(intervalId);
      socket.off('fetch shifts')
    }; 
  }, [])


  return (
    <>
      <SecurityLayout>     
        <div className="shift">
          <Summary currentTime={currentTime} />
          <Body shifts={shiftList} />
        </div>
      </SecurityLayout>
    </>
  );
  
}
