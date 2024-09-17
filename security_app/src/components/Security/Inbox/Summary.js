import React from 'react'
import AddShiftOverlay from '../../../reusables/newShiftOverlay'
export default function Summary() {
  return (
    <>
        
        <div className="inbox-summary" style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <section style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-end'}}>
                <div style={{height: '100%', width: '70px'}}>
                    <svg width="50px" height="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="blueviolet">

                        <g id="SVGRepo_bgCarrier" stroke-width="0"/>

                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

                        <g id="SVGRepo_iconCarrier"> <path d="M2 13H5.16026C6.06543 13 6.51802 13 6.91584 13.183C7.31367 13.3659 7.60821 13.7096 8.19729 14.3968L8.80271 15.1032C9.39179 15.7904 9.68633 16.1341 10.0842 16.317C10.482 16.5 10.9346 16.5 11.8397 16.5H12.1603C13.0654 16.5 13.518 16.5 13.9158 16.317C14.3137 16.1341 14.6082 15.7904 15.1973 15.1032L15.8027 14.3968C16.3918 13.7096 16.6863 13.3659 17.0842 13.183C17.482 13 17.9346 13 18.8397 13H22" stroke="blueviolet" stroke-width="1.5" stroke-linecap="round"/> <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="blueviolet" stroke-width="1.5" stroke-linecap="round"/> </g>

                    </svg>
                </div>
                &nbsp;
                &nbsp;
                &nbsp;
                &nbsp;
                &nbsp;
                <div style={{display: 'flex',justifyContent: 'flex-end', padding: '0px', height: '100%', width: '100px', alignItems: 'flex-end'}}>
                    
                    <div style={{background: 'blueviolet', color: '#fff', fontWeight: '500', margin: '0px 10px -7px 0px', padding: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: '5px'}}>
                        <small style={{fontWeight: '400', fontSize: 'x-small'}}><>30 Inbox</></small>
                    </div>
                    <div style={{background: 'blueviolet', color: '#fff', fontWeight: '500', margin: '0px 10px -7px 0px', padding: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: '5px'}}>
                        <small style={{fontWeight: '400', fontSize: 'x-small'}}><>24 Read</></small>
                    </div>
                    <div style={{background: 'blueviolet', color: '#fff', fontWeight: '500', margin: '0px 10px -7px 0px', padding: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderRadius: '5px'}}>
                        <small style={{fontWeight: '400', fontSize: 'x-small'}}><>24 Unread</></small>
                    </div>
                </div>
            </section>
        </div>
    </>
  )
}
