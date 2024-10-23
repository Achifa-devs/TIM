import { React, useEffect, useState } from 'react'
import soc from '../../services/socket'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Inbox/Summary'
import Body from '../../components/Security/Inbox/Body'
import '../../components/Security/Inbox/styles/xxl.css'


const { socket } = soc;

export default function Inbox() {

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
  
    // Fetch user alerts on mount
    socket.emit('alerts');

    // Listen for 'new alert' event and update alerts list
    socket.on('new alert', (response) => {
      console.log('new alert', response);
      setAlerts((prevAlerts) => [response, ...prevAlerts]);
    });

    // Listen for 'fetch alerts' event to fetch existing alerts
    socket.on('fetch alerts', (response) => {
      console.log('fetched alerts');
      setAlerts(response.alerts);
    });

    return () => {
      socket.off('fetch alerts');
    }
  }, []);

  return (
    <>
      <SecurityLayout>
        <div className="inbox">
          <Summary alerts={alerts} />
          <Body alerts={alerts} />
        </div>
      </SecurityLayout>
    </>
  )
}
