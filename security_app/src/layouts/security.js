import React, { useEffect } from "react";
import Aside from "../components/Security/Aside/Aside";
import api from "../services/api";
import { setInfoTo } from "../redux/security/info";
import { useDispatch } from "react-redux";

export default function SecurityLayout({ children }) {
  const dispatch = useDispatch()
  function fetchUserData(token) {
    api.get('https://api.sinmfuoyeplatform.com.ng/api/v1/auth/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((response) => {
      console.log(response)
        dispatch(setInfoTo(response.data.user))
    })
    .catch(err => {
      console.log(err)
      // alert('Session expired, please login to continue')
      window.location.href='/login' 
      
    })
  }

  useEffect(() => {
    const token =  window.localStorage.getItem('accessToken')
    if(window.location.pathname.split('/').splice(-1)[0] !== 'login' && window.location.pathname.split('/').splice(-1)[0] !== 'signup'){
      // alert()
      let invalid = [null, undefined, '', 'null', 'undefined'];
      if(token.includes[invalid]){
        window.location.href='/login' 

      }else{
        // alert(token)
        fetchUserData(token.trim())

      }
      
    }
  }, [])

  return (
    <>
      <Aside />
      {children}
    </>
  );
}
