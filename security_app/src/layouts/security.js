import React from "react";
import Aside from "../components/Security/Aside/Aside";

export default function SecurityLayout({ children }) {
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
      {children}
    </>
  );
}
