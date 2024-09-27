import React, { useEffect, useState } from 'react'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Shift/Summary'
import '../../components/Security/Shift/styles/xxl.css'
import Body from '../../components/Security/Shift/Body'
import axios from "axios"
import { useSelector } from 'react-redux'

export default function Shift() {
  let [shiftList, setShiftList] = useState([])
  let {info} = useSelector(s=> s.info)
  useEffect(() => {
    // function fetchUserData() {
     if (info !== null) {
       axios.get('http://localhost:8888/api/v1/shift', {params: {
        security_id: info?.security_id
       },
       headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('security_token')}`
      }
      })
       .then((response) => {
         setShiftList(response.data)
       })
       .catch(err => {
         console.log(err)
           
       }) 
     }
    // }
  
  }, [info])
  return (
    <>
      <SecurityLayout>     

        <div className="shift">
          <Summary />
          <Body shifts={shiftList} />
        </div>

      </SecurityLayout>
    </>
  )
}
