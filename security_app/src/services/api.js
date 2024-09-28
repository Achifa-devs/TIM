import axios from 'axios';
import { jwtDecode } from "jwt-decode"


const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

const openPaths = ['/login', '/signup'];


async function refreshAccessToken() {
  console.log('Refreshing access token...');
  let response = await api.post('/auth/refresh', { refresh_token: window.localStorage.getItem('refreshToken') });
  let { accessToken } = response.data;
  window.localStorage.setItem('accessToken', accessToken);
  console.log('Access token refreshed successfully!');
  return accessToken;
}

// api.interceptors.request.use(async (config) => {
//   if (openPaths.some(path => config.url.includes(path))) {
//     return config; // Bypass the interceptor logic
//   }

//   let token = window.localStorage.getItem('accessToken');
//   console.log(token)
//   if (token) {
//     let decodedToken = jwtDecode(token);
//     let currentTime = Date.now() / 1000;

//     if (decodedToken.exp < currentTime) {
//       console.log('Token expired, refreshing...');
//       try {
//         token = await refreshAccessToken();
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
// }, async (error) => {
//   let originalRequest = error.config;
//   console.log(error.response.data, error.response)
//   if (error.response.status === 401 && !originalRequest._retry) {
//     originalRequest._retry = true;
//     if (error.response.data.message === 'Token expired' || error.response.data.message === 'Invalid token') {
//       try {
//         let accessToken = await refreshAccessToken();
//         axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
//         return api(originalRequest);
//       } catch (error) {
//         console.log(error)
//       }
//     }
//   } else if (error.response.status === 422) {
//     window.location.href = '/login'
//     window.localStorage.removeItem('accessToken');
//     window.localStorage.removeItem('refreshToken');
//   }
//   return Promise.reject(error);
// });


export default api;
