import {React, useEffect, useState } from 'react'
import soc from '../../services/socket'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Inbox/Summary'
import Body from '../../components/Security/Inbox/Body'
import '../../components/Security/Inbox/styles/xxl.css'


const { socket } = soc;

export default function Inbox() {

  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (Notification.permission === 'default' || Notification.permission === 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }

      // Fetch user alerts on mount
      socket.emit('alerts');

      // Listen for 'new alert' event and update alerts list
      socket.on('new alert', (response) => {
        console.log('new alert', response);
        setAlerts((prevAlerts) => [...prevAlerts, response]);
  
        // Trigger browser notification
        if (Notification.permission === 'granted') {
          const notification = new Notification('New Alert', {
            body: response.message,
            icon: '/path-to-icon/icon.png', // Optional, can use any image for notification
          });
  
          notification.onclick = () => {
            window.focus(); // When the user clicks the notification, focus the window
          };
        }
      });
  
      // Listen for 'fetch alerts' event to fetch existing alerts
      socket.on('fetch alerts', (response) => {
        console.log('fetch alerts', response);
        setAlerts(response.alerts);
      });

      return () => {
        socket.off('new alert');
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
