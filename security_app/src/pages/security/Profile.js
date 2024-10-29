import { React, useEffect, useState } from 'react'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Profile/Summary'
import Body from '../../components/Security/Profile/Body'
import '../../components/Security/Profile/styles/xxl.css'
import api from '../../services/api'


export default function Profile() {

  const [user, setUser] = useState([])

  useEffect(() => {
    api.get('/profile')
      .then(response => {
        setUser(response.data.info);
      })
      .catch(error => {
        throw (error);
      })
  }, []);


  return (
    <>
      <SecurityLayout>
        <div className="profile">
          <Summary info={user} />
          <Body info={user} />
        </div>

      </SecurityLayout>
    </>
  )
}
