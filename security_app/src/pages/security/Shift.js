import React, { useEffect, useState } from 'react'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Shift/Summary'
import '../../components/Security/Shift/styles/xxl.css'
import Body from '../../components/Security/Shift/Body'
import api from '../../services/api'
import { useSelector } from 'react-redux'

export default function Shift() {
  let [shiftList, setShiftList] = useState([])
  let {info} = useSelector(s=> s.info)
  useEffect(() => {
    // function fetchUserData() {
     if (info !== null) {
       api.get('/shift', {params: {
         security_id: info?.security_id
       }})
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
