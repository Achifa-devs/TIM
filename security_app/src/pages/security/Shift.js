import React, { useEffect, useState } from 'react'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Shift/Summary'
import '../../components/Security/Shift/styles/xxl.css'
import Body from '../../components/Security/Shift/Body'
import api from '../../services/api'
import { useSelector } from 'react-redux'
import AddShiftOverlay from '../../reusables/newShiftOverlay'

export default function Shift() {
  let [shiftList, setShiftList] = useState([])
  let {info} = useSelector(s=> s.info)
  useEffect(() => {
    // function fetchUserData() {
     if (info !== null) {
       api.get('https://api.sinmfuoyeplatform.com.ng/api/v1/shifts', {params: {
         security_id: info?.id
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
        <div className="shift-overlay" style={{alignItems: 'center', justifyContent: 'center'}}>
          <AddShiftOverlay />
        </div>
        <div className="shift">
          <Summary />
          
          <Body shifts={shiftList} />
        </div>

      </SecurityLayout>
    </>
  )
}
