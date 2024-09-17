import React from 'react'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Settings/Summary'
import Body from '../../components/Security/Settings/Body'
import '../../components/Security/Settings/styles/xxl.css'

export default function Settings() {
  return (
    <>
        <SecurityLayout>
            <div className="settings">
              <Summary />
              <Body />
            </div>
        </SecurityLayout>
    </>
  )
}
