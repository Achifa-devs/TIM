import React, { useEffect } from 'react'
import Aside from '../components/Security/Aside/Aside'
import { setInfoTo } from '../redux/security/info'
import {useDispatch, useSelector} from 'react-redux';
import axios from "axios"

export default function SecurityLayout({children}) {

  let dispatch = useDispatch()


  // Set the access token in the headers for all requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('security_token')}`;

  function fetchUserData() {
    axios.post('http://localhost:5000/api/v1/auth', {token: window.localStorage.getItem('security_token')})
    .then((response) => {
      // console.log(response)
        dispatch(setInfoTo(response.data.info))
    })
    .catch(err => {
      console.log(err)
        
    })
  }

  useEffect(() => {
    if(window.location.pathname.split('/').splice(-1)[0] !== 'login' && window.location.pathname.split('/').splice(-1)[0] !== 'signup'){
      // alert()
      if(window.localStorage.getItem('security_token') !== null && window.localStorage.getItem('security_token') !== '' && window.localStorage.getItem('security_token') !== 'null' && window.localStorage.getItem('security_token') !== undefined && window.localStorage.getItem('security_token') !== 'undefined'){
        fetchUserData()
      }else{
        window.location.href = '/login'
      }
    }
  }, [])
  return (
    <>

      <Aside />
      {
        children
      }
    </>
  )
}
