import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Aside from "../components/Security/Aside/Aside";
import { setInfoTo } from "../redux/security/info";
import api from "../services/api";

export default function SecurityLayout({ children }) {
  const dispatch = useDispatch();

  function fetchUserData(token) {
    api
      .get("https://api.sinmfuoyeplatform.com.ng/api/v1/auth/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response);
        dispatch(setInfoTo(response.data.user));
      })
      .catch((err) => {
        console.log(err);
        // alert('Session expired, please login to continue')
        window.location.href = "/login";
      });
  }

  useEffect(() => {
    const token = window.localStorage.getItem("accessToken");

    // Check if current page is login or signup
    const currentPage = window.location.pathname.split("/").splice(-1)[0];
    if (currentPage !== "login" && currentPage !== "signup") {
      // Define invalid token values
      const invalidValues = [null, undefined, "", "null", "undefined"];

      // Check if token is invalid
      if (!token || invalidValues.includes(token)) {
        window.location.href = "/login";
      } else {
        // Token exists and is valid, fetch user data
        fetchUserData(token.trim());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Aside />
      {children}
    </>
  );
}
