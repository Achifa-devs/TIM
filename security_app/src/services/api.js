/* eslint-disable no-unused-vars */
import axios from "axios";

const api = axios.create({
  // baseURL: 'https://timsec.onrender.com/api/v1',
  baseURL: "http://localhost:5000/api/v1",
});

const openPaths = ["/login", "/signup"];

function refreshAccessToken() {
  console.log("Refreshing access token...");
  api
    .post("/auth/refresh", {
      headers: { Authorization: `Bearer ${window.localStorage.getItem("refreshToken")}` },
    })
    .then((response) => {
      console.log(response.data);
      let { access_token } = response.data;
      window.localStorage.setItem("accessToken", access_token);
      console.log("Access token refreshed successfully!");
      return access_token;
    })
    .catch((error) => {
      console.log(error);
    });
}

// api.interceptors.request.use((config) => {
//   if (openPaths.some(path => config.url.includes(path))) {
//     return config; // Bypass the interceptor logic
//   }

//   let token = window.localStorage.getItem('accessToken');
//   // console.log(token, 'this is the token')
//   if (token) {
//     let decodedToken = jwtDecode(token);
//     let currentTime = Date.now() / 1000;

//     if (decodedToken.exp < currentTime) {
//       console.log('Token expired, refreshing...');
//       try {
//         token = refreshAccessToken();
//       } catch (error) {
//         console.log(error)
//       }
//     } else {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//   } else {
//     // If no token, log out the user
//     window.location.href = '/login';
//   }
//   return config;
// }, (error) => {
//   return Promise.reject(error);
// });

// api.interceptors.response.use((response) => {
//   return response;
// },(error) => {
//   let originalRequest = error.config;
//   console.log(error.response.data, error.response)
//   if (error.response.status === 401 && !originalRequest._retry) {
//     originalRequest._retry = true;
//     if (error.response.data.msg === 'Token has expired') {
//       try {
//         let accessToken = refreshAccessToken();
//         axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
//         return api(originalRequest);
//       } catch (error) {
//         console.log(error)
//       }
//     }
//   } else {
//     window.location.href = '/login'
//     window.localStorage.removeItem('accessToken');
//     window.localStorage.removeItem('refreshToken');
//   }
//   return Promise.reject(error);
// });

export default api;
