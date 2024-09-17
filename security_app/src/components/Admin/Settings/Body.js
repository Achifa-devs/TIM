import React from 'react'

export default function Body() {
  return (
    <>
      <div className="settings-body">
        <ul>
            <li>
                <section>
                    <div style={{fontWeight: '500'}}>
                        <>Notification Settings</>
                    </div>

                    <br />
                    <div style={{padding: '0px 10px', display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between'}}>
                        <small style={{fontWeight: '500'}}>Receive Notification Via Email</small>

                        <div className="input-cnt">
                            <input style={{height: '20px', width: '20px'}} type="checkbox" name="" id="" />
                        </div>
                    </div>

                    <div style={{padding: '0px 10px', display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between'}}>
                        <small style={{fontWeight: '500'}}>Receive Notification Via Phone</small>
                        <div className="input-cnt">
                            <input style={{height: '20px', width: '20px'}} type="checkbox" name="" id="" />
                        </div>
                    </div>

                    <div>
                        <button style={{background: '#000', width: 'auto', height: 'auto', padding: '8px'}}>
                            Save
                        </button>
                    </div>

                </section>



            </li>

            
        </ul>
      </div>
    </>
  )
}
