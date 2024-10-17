import io from 'socket.io-client';


const token = window.localStorage.getItem('accessToken');
let pathWithToken = 'http://127.0.0.1:8000'
let adminPathWithToken = 'http://127.0.0.1:8000/nur_fur_admin'

if (token) {
  console.log('token', token);
  pathWithToken += `?jwt=${token}`
  adminPathWithToken += `?jwt=${token}`
}

const socket = io(pathWithToken);
const adminSocket = io(adminPathWithToken);

socket.on('connect', () => {
  console.log('connected');
});

adminSocket.on('connect', () => {
  console.log('connected');
});

adminSocket.on('disconnect', () => {
  console.log('disconnected');
});

adminSocket.on('disconnect', () => {
  console.log('disconnected');
});

const soc = { socket, adminSocket };

export default soc;