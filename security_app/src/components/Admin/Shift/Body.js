import React from 'react'

export default function Body({shifts}) {
  return (
    <>
      <div className="shift-body">
        <ul>

            {
                shifts.map((item,index) => {
                    return(
                        <li style={{marginBottom: '10px'}} key={index}>
                            <section>
                                <div>
                                    <b style={{textTransform: 'capitalize'}}>{item.period} Shift</b>
                                </div>
                                <div>
                                    <small><>Duration</></small>
                                    &nbsp;
                                    <small><>{item.duration} hours</></small>
                                </div>

                                <div>
                                    <small><>{item.time.split(',')[0]} - {item.time.split(',')[1]}</></small>
                                </div>
                            </section>

                            <section>
                                <div>
                                    <button style={{background: '#000', height: 'auto', width: 'auto', padding: '5px'}}>
                                        
                                        {
                                            item.status === 'pending'
                                            ?
                                            'No Security Assigned'
                                            :
                                            `Assigned To TIM-${item.security_id}`
                                        }
                                    </button>
                                    &nbsp;
                                    &nbsp;
                                    <button style={{background: 'red', height: 'auto', width: 'auto', padding: '5px'}}>
                                        Close This Shift
                                    </button>
                                    
                                </div>

                                <div style={{width: '100%'}}>
                                    <small style={{float: 'right', fontSize: 'x-small'}}>
                                        <b>Set By Admin {item.created_at}</b>
                                    </small>
                                </div>
                            </section>
                        </li>
                    )
                })
            }
            
        </ul>
      </div>
    </>
  )
}
