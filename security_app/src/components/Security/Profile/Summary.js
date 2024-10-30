import React from 'react'
import AddShiftOverlay from '../../../reusables/newShiftOverlay'
import myImg from '../../../assets/WhatsApp Image 2023-08-10 at 19.54.34.jpg'


export default function Summary({user}) {

  return (
    <>
        
        <div className="shift-summary" style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <section style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end'}}>
                <div style={{height: '70px', width: 'auto'}}>
                    <svg width="70px" height="70px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="blueviolet">

                        <g id="SVGRepo_bgCarrier" stroke-width="0"/>

                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

                        <g id="SVGRepo_iconCarrier"> <path d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z" fill="blueviolet"/> <path d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z" fill="blueviolet"/> </g>

                    </svg>
                </div>
                &nbsp;
                &nbsp;
                <section style={{justifyContent: 'flex-end', padding: '0px'}}>
                    
                    <div>
                        <small style={{fontWeight: '400'}}><>Joined {new Date(user?.joined_at).toLocaleString()}</></small>
                    </div>
                    <div>
                        <small style={{fontWeight: '400'}}><>ID :  TIM-{user?.id}</></small>
                    </div>
                </section>
            </section>
        </div>
    </>
  )
}
