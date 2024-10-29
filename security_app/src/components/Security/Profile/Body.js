import React from 'react'

export default function Body({info}) {
  return (
    <>
      <div className="profile-body">
        <ul>
            <li>
                <section>
                    <div style={{fontWeight: '500'}}>
                        <>FirstName: </>
                    </div>

                    &nbsp;
                    &nbsp;

                    <div>
                        <small>{info?.first_name}</small>
                    </div>
                </section>

            </li>

            <li>
                <section>
                    <div style={{fontWeight: '500'}}>
                        <>LastName: </>
                    </div>

                    &nbsp;
                    &nbsp;

                    <div>
                        <small>{info?.last_name}</small>
                    </div>
                </section>

            </li>


            <li>
                <section>
                    <div style={{fontWeight: '500'}}>
                        <>Email: </>
                    </div>

                    &nbsp;
                    &nbsp;

                    <div>
                        <small>{info?.email_address}</small>
                    </div>
                </section>

            </li>

            <li>
                <section>
                    <div style={{fontWeight: '500'}}>
                        <>Phone: </>
                    </div>

                    &nbsp;
                    &nbsp;

                    <div>
                        <small>{info?.phone_number}</small>
                    </div>
                </section>

            </li>
        </ul>
      </div>
    </>
  )
}
