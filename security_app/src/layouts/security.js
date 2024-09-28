import React, { useEffect } from 'react'
import Aside from '../components/Security/Aside/Aside'
import { setInfoTo } from '../redux/security/info'
import {useDispatch, useSelector} from 'react-redux';
import api from '../services/api';

export default function SecurityLayout({children}) {

  let dispatch = useDispatch()

  // function fetchUserData() {
  //   api.post('/auth', {token: window.localStorage.getItem('accessToken')})
  //   .then((response) => {
  //     // console.log(response)
  //       dispatch(setInfoTo(response.data.info))
  //   })
  //   .catch(err => {
  //     console.log(err)
        
  //   })
  // }

  // useEffect(() => {
  //   if(window.location.pathname.split('/').splice(-1)[0] !== 'login' && window.location.pathname.split('/').splice(-1)[0] !== 'signup'){
  //     // alert()
  //     let invalid = [null, undefined, '', 'null', 'undefined']
  //     invalid.forEach(item => {
  //       if(window.localStorage.getItem('accessToken') === item){
  //         // fetchUserData()
  //       } else {
  //         window.location.href = '/'
  //       }
  //     })
  //   }
  // }, [])

  return (
    <>

      <Aside />
      {
        children
      }
    </>
  )
}
