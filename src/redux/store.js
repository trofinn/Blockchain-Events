import { configureStore } from "@reduxjs/toolkit";

import eventReducer from "./eventSlice.js";
const store = configureStore({
    reducer: {
        eventReducer,
    },
});

export default store;