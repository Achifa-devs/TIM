import { configureStore } from '@reduxjs/toolkit';
import info from './security/info';

let store = configureStore({
  reducer: {
    info: info
  }

})


export default store;