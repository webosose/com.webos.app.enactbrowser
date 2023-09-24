import { configureStore } from '@reduxjs/toolkit'
import devSettingsSlice from './slice/menu/devSettingsSlice'

export default configureStore({
    reducer: {
        devSettings: devSettingsSlice
    },
})
