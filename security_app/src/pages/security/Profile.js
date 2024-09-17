import React from 'react'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Profile/Summary'
import Body from '../../components/Security/Profile/Body'
import '../../components/Security/Profile/styles/xxl.css'
import { useSelector } from 'react-redux'


export default function Profile() {

  let {info} = useSelector(s=> s.info)
  return (
    <>
        <SecurityLayout>

          <div className="profile">
            <Summary info={info} />
            <Body info={info} />
          </div>
            
        </SecurityLayout>
    </>
  )
}
