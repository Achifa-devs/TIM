import React, { useEffect, useState } from 'react'
import AddShiftOverlay from '../../../reusables/newShiftOverlay'
import axios from "axios"

export default function Summary() {

    let [userList, setUserList] = useState([])

    useEffect(() => {
        // function fetchUserData() {
        axios.get('http://localhost:8888/api/v1/admin/users', {})
        .then((response) => {
            setUserList(response.data)
        })
        .catch(err => {
            console.log(err)
            
        })
        // }
    
    }, [])

    function handleShift() {
        let e = document.querySelector('.shift-overlay')
        if(e.hasAttribute('id')){
            e.removeAttribute('id')
        }else{
            e.setAttribute('id', 'shift-overlay')
        }
    }

    function handleShiftOverlay(e) {
        if(e.target === e.currentTarget){
            let e = document.querySelector('.shift-overlay')
            e.removeAttribute('id')
        }
    }
  return (
    <>
        <div onClick={e=>handleShiftOverlay(e)} className="shift-overlay" style={{justifyContent: 'center', alignItems: 'center'}}>
            <AddShiftOverlay users={userList} />
        </div>
        <div className="shift-summary">
            <section>
                <small><b>Add Your Shift For Approval From Admin</b></small>
                <button onClick={e=>handleShift()} style={{width: 'auto', height: 'auto', padding: '5px'}}>
                    <small>
                        <b>Add Shift For Securities To Accept + </b>
                    </small>
                </button> 
            </section>
        </div>
    </>
  )
}
