import React, { useEffect, useState } from 'react'
import Summary from '../../components/Admin/Shift/Summary'
import '../../components/Admin/Shift/styles/xxl.css'
import Body from '../../components/Admin/Shift/Body'
import AdminLayout from '../../layouts/admin'
import getSocket from '../../services/socket'


const { socket, adminSocket } = getSocket;

export default function Shift() {
  let [shiftList, setShiftList] = useState([])
  const [reload, setReload] = useState(0)

  useEffect(() => {

    socket.emit('admin_get_shifts');

    socket.on('fetch shifts', (response) => {
      console.log('shift', response);
      setShiftList(response);
    });

    socket.on('shift added', (response) => {
      console.log('shift', response);
      setShiftList((shifts) => [response.shift, ...shifts]);
    });

    return () => {
      socket.off('fetch shifts');
    };

  }, [reload])


  useEffect(() => {

    adminSocket.on('shift deleted', (response) => {
      console.log(response )
      setReload((prevReload) => !prevReload)
    });

  }, [])

  return (
    <>
      <AdminLayout>    
        <div className="shift">
          <Summary />
          <Body shifts={shiftList} />
        </div>
      </AdminLayout>
    </>
  )
}
