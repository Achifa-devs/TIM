import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    info: null,
  }
  
  export const infoSlice = createSlice({
    name: 'info',
    initialState,
    reducers: {
      
      setInfoTo: (state, action) => {
        state.info = action.payload
      },
    },
  })
  
  // Action creators are generated for each case reducer function
  export const { setInfoTo } = infoSlice.actions
  
  export default infoSlice.reducer

  
  