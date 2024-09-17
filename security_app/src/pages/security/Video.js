import React from 'react'
import SecurityLayout from '../../layouts/security'
import Summary from '../../components/Security/Video/Summary'
import '../../components/Security/Video/styles/xxl.css'
import Body from '../../components/Security/Video/Body'

export default function Video() {
  return (
    <>
      <SecurityLayout>

        <div className="video-upload">
          <Summary />
          <Body />
        </div>

      </SecurityLayout>
    </>
  )
}
