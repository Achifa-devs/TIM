import React from 'react'
import homeSvg from '../../../assets/home-svgrepo-com (7).svg'
import videoSvg from '../../../assets/video-library-svgrepo-com.svg'
import shiftSvg from '../../../assets/gear-box-svgrepo-com.svg'
import inboxSvg from '../../../assets/inbox-svgrepo-com.svg'
import settingsSvg from '../../../assets/settings-svgrepo-com (6).svg'
import profileSvg from '../../../assets/user-svgrepo-com (3).svg'

export default function Aside() {
  return (
    <>
      <div className='aside'>
        <div>
          <b>TIM</b>
        </div>
        <hr />
        <section>

          <ul>
            <li onClick={e=>window.location.href='/'}>
              <span>
                <img src={homeSvg} style={{height: '20px', width: '20px'}} alt="" />
              </span>
              &nbsp;              &nbsp;
              <span>Home</span>
            </li>
            <li onClick={e=>window.location.href='/video'}>
              <span>
                <img src={videoSvg} style={{height: '20px', width: '20px'}} alt="" />
              </span>
              &nbsp;              &nbsp;
              <span>Video</span>
             </li>
            <li onClick={e=>window.location.href='/shift'}>
              <span>
                <img src={shiftSvg} style={{height: '20px', width: '20px'}} alt="" />
              </span>
              &nbsp;              &nbsp;
              <span>Shift</span>
            </li>
            <li onClick={e=>window.location.href='/inbox'}>
              <span>
                <img src={inboxSvg} style={{height: '20px', width: '20px'}} alt="" />
              </span>
              &nbsp;              &nbsp;
              <span>Inbox</span>
            </li>
          </ul>

          <ul>
            <li onClick={e=>window.location.href='/settings'}>
              <span>
                <img src={settingsSvg} style={{height: '20px', width: '20px'}} alt="" />
              </span>
              &nbsp;              &nbsp;
              <span>Sett</span>
            ings</li>
            <li onClick={e=>window.location.href='/profile'}>
              <span>
                <img src={profileSvg} style={{height: '20px', width: '20px'}} alt="" />
              </span>
              &nbsp;              &nbsp;
              <span>Prof</span>
            ile</li>
          </ul>
          
        </section>
      </div>
    </>
  )
}
