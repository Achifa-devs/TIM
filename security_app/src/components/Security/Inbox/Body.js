import React, { useEffect } from 'react';
import soc from '../../../services/socket';

const { socket } = soc;

export default function Body({alerts}) {
  // const [alerts, setAlerts] = useState([]);

  useEffect(() => {

    // Listen for 'updated alert' event and update the corresponding alert
    socket.on('updated alert', (response) => {
      console.log('updated alert', response);
    });

    // Clean up event listeners when component unmounts
    return () => {
      socket.off('updated alert');
    };
  }, []); 

  return (
    <div className='inbox-body'>
      <h2>Alerts</h2>
      {alerts.length > 0 ? (
        <ul>
          {alerts.map((alert) => (
            <li key={alert.id}>
              <section>
                <div>
                  <strong>{alert.message}</strong>
                </div>
                <div>
                  <small>{alert.status}</small>
                </div>
            </section>
            <section>
              <small> {new Date(alert.created_at).toLocaleString().split(',')[1]} </small>
            </section>
            </li>
          ))}
        </ul>
      ) : (
        <p>No alerts available</p>
      )}
    </div>
  );
}
