import React, { useEffect, useState } from 'react'
import Summary from '../../components/Admin/Users/Summary'
import '../../components/Admin/Users/styles/xxl.css'
import Body from '../../components/Admin/Users/Body'
import AdminLayout from '../../layouts/admin'
import api from "../../services/api"

export default function Users() {
  let [userList, setUserList] = useState([])

  useEffect(() => {
    // function fetchUserData() {
      api.get('/personnels', {})
      .then((response) => {
        setUserList(response.data)
      })
      .catch(err => {
        console.log(err)
          
      })
    // }
  
  }, [])
  return (
    <>
      <AdminLayout>

        <div className="user">
          <Summary />
          <Body users={userList} />
        </div>

      </AdminLayout>
    </>
  )
} 
