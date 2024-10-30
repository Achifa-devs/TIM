import React from 'react'

export default function Body({user}) {
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
                        <small>{user?.first_name}</small>
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
                        <small>{user?.last_name}</small>
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
                        <small>{user?.email_address}</small>
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
                        <small>{user?.phone_number}</small>
                    </div>
                </section>

            </li>
        </ul>
      </div>
    </>
  )
}
