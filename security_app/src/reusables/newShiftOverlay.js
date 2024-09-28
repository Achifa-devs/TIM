import { useEffect, useState } from "react"
import api from '../services/api'

export default function AddShiftOverlay({users}){
   let [period,setPeriod] = useState('morning')
   let [duration,setDuration] = useState('2')
   let [from,setFrom] = useState('00:00')
   let [to,setTo] = useState('00:00')
   let [security_id, set_security_id] = useState(null);

   useEffect(() => {
     console.log(users)
   }, [users])

   
   function uploadShift() {
        api.post('/admin/new-shift', {period,duration,from,to,security_id}) 
        .then((response) => {
            // console.log('...',response)
            if(response.data){
                window.localStorage.setItem('accessToken', response.data.access_token)

                alert('Shift Created')
                let elem = document.querySelector('.shift-overlay');
                elem.removeAttribute('id');
            }
        })
        .catch(err => {
            console.log(err)
            
        })
   }
    return(
        <>
            <form style={{height: '500px', background: '#fff', width: '300px', borderRadius: '5px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px'}}>
                <h4 className="" style={{padding:'10px', margin: '0', borderBottom: '1px solid #efefef', height: '50px', width: '100%', background: '#fff', fontWeight: '600', display: 'flex', alignItems: 'center', color: 'blueviolet', justifyContent: 'space-between'}}>Create New Shift</h4>

                <section style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', background: '#efefef', height: '70%', padding: '10px'}}>
                    <div className="input-cnt">
                        <select onClick={e=>setPeriod(e.target.value)} name="" id="">
                            <option value="">Select Shift</option>
                            <option value="morning">Morning Shift</option>
                            <option value="noon">Noon Shift</option>
                            <option value="evening">Evening Shift</option>
                            <option value="night">Night Shift</option>
                        </select>
                    </div>
                    <div className="input-cnt">
                        <select onInput={e => setDuration(e.target.value)} name="" id="">
                            <option value="">Select Duration</option>
                            <option value="2">2 hours</option>
                            <option value="3">3 hours</option>
                            <option value="4">4 hours</option>
                            <option value="5">5 hours</option>
                        </select>
                    </div>

                    <div className="input-cnt">
                        <label style={{height: 'auto', width: 'auto', background: 'transparent'}} htmlFor=""><small>From</small></label>
                        <input onInput={e => setFrom(e.target.value)} type="time" name="" id="" />
                    </div>
                    <div className="input-cnt">
                        <label style={{height: 'auto', width: 'auto', background: 'transparent'}} htmlFor=""><small>To</small></label>
                        <input onInput={e => setTo(e.target.value)} type="time" name="" id="" />
                    </div>


                    <div className="input-cnt">
                        <select onInput={e => {
                            set_security_id(e.target.value)
                        }} name="" id="">
                            <option value="">Select Security</option>
                            {
                                users.map((item,index) => {
                                    return(
                                        <option key={index} value={item?.security_id}>
                                            {`${index+1}.  ${item?.fname} ${item?.lname}`}
                                        </option>
                                    )
                                })
                            }
                            
                        </select>
                    </div>
                </section>

                <section style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                    <button onClick={e => {
                        e.preventDefault();
                        uploadShift()
                    }}>Add</button>
                    <button onClick={e => {
                        e.preventDefault();
                        let elem = document.querySelector('.shift-overlay');
                        elem.removeAttribute('id');

                    }}>Cancel</button>
                </section>
            </form> 
        </>
    )
}
