import React from 'react'
import img from '../../assets/crime1.jpg'
import SecurityLayout from '../../layouts/security'


export default function Dashboard() {
  return (
    <>
      <SecurityLayout>

        <div className='img-cnt'>
          <img src={img} style={{height: '100%', width: '100%'}} alt="" />
        </div>

      </SecurityLayout>
    </>
  )
}
