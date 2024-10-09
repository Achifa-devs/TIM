import React, { useEffect, useState } from 'react'
import AddShiftOverlay from '../../../reusables/newShiftOverlay';
import api from '../../../services/api'


export default function Body({users}) {

  let [id, set_security_id] = useState(null);

  let [userList, setUserList] = useState([])
  let [filteredUserList, setfilteredUserList] = useState([])

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

  function handleShift() {
    let elem = document.querySelector('.shift-overlay')
    if(elem.hasAttribute('id')){
        elem.removeAttribute('id')
    }else{
        elem.setAttribute('id', 'shift-overlay')
    }
  }

function handleShiftOverlay(e) {
    if(e.target === e.currentTarget){
        let e = document.querySelector('.shift-overlay')
        e.removeAttribute('id')
    }
  }

  useEffect(() => {
    setfilteredUserList(userList.filter(item => item.id === id))
  }, [id])
  return (
    <>

      <div onClick={e=>handleShiftOverlay(e)} className="shift-overlay" style={{justifyContent: 'center', alignItems: 'center'}}>
        <AddShiftOverlay users={filteredUserList} />
      </div>
      <div className="user-body">
        <ul>
          {
            users.map((item, index) => 
            <li key={index}> 
               <div>
                {index + 1}. &nbsp;&nbsp; {`${item.first_name} ${item.last_name}`}  <small style={{color: item.is_active ? 'green':'red', background: '#fff', padding: '3px 8px', borderRadius: '2px', fontWeight: '500'}}>{item.is_active ? "online" : "offline"} </small>
               </div>
               <div style={{textAlign: 'right'}}>
                 <div>
                   <button onClick={e=>{
                    set_security_id(item.id)
                    handleShift(e)
                   }} style={{background: '#000', width: 'auto', height: 'auto', padding: '10px'}}>
                    Assign New Shift
                   </button>
                 </div>

                 <div>
                   <small>
                    Joined {
                      item?.joined_at
                      ?
                      new Date(item?.joined_at).toUTCString()
                      :
                      "loading..."
                    }
                   </small>
                 </div>
               </div>
            </li>)
          }
        </ul>
      </div>
    </>
  )
}
