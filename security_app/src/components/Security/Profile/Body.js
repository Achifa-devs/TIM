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
                        <small>{info?.firstname}</small>
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
                        <small>{info?.lastname}</small>
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
                        <small>{info?.email}</small>
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
                        <small>{info?.phone}</small>
                    </div>
                </section>

            </li>
        </ul>
      </div>
    </>
  )
}
