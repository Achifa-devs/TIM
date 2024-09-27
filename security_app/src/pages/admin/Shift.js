import React, { useEffect, useState } from 'react'
import Summary from '../../components/Admin/Shift/Summary'
import '../../components/Admin/Shift/styles/xxl.css'
import Body from '../../components/Admin/Shift/Body'
import AdminLayout from '../../layouts/admin'
import axios from "axios"


export default function Shift() {
  let [shiftList, setShiftList] = useState([])

  useEffect(() => {
    // function fetchUserData() {
      axios.get('http://localhost:5000/api/v1/admin/shifts', {})
      .then((response) => {
        setShiftList(response.data)
      })
      .catch(err => {
        console.log(err)
          
      })
    // }
  
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
