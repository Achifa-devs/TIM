import React from 'react'

export default function Body() {
  return (
    <>
      <div className="inbox-body">
        <ul>
            <li>
                <section>
                    <div style={{fontWeight: '500'}}>
                        <>Security Alert</>
                    </div>
                    <div>
                        <small style={{fontSize: 'small'}}>Fighting Detected</small>
                    </div>
                </section>

                <section>
                    <small>2 days ago</small>
                </section>

            </li>

        </ul>
      </div>
    </>
  )
}
