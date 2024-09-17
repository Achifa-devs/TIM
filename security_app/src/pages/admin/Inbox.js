import React from 'react'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Inbox/Summary'
import Body from '../../components/Security/Inbox/Body'
import '../../components/Security/Inbox/styles/xxl.css'

export default function Inbox() {
  return (
    <>
        <SecurityLayout>

          <div className="inbox">
            <Summary />
            <Body />
          </div>
            
        </SecurityLayout>
    </>
  )
}
