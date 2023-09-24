import { createSlice } from '@reduxjs/toolkit'

export const devSettingsSlice = createSlice({
  name: 'devSettings',
  initialState: {
    value: false,
  },
  reducers: {
    set: (state, action) => {
      // we can use "mutating" logic here
      state.value = action.payload;
    },
  },
})

export const { set } = devSettingsSlice.actions;

export const selectDevSettings = (state) => state.devSettings.value;

export default devSettingsSlice.reducer;
