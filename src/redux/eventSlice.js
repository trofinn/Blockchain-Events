import { createSlice } from "@reduxjs/toolkit";

const eventSlice = createSlice({
    name: "event",
    initialState: {
        allEvents: [],
    },
    reducers: {
        SetAllEvents: (state,action) => {
            state.event = action.payload;
        }
    }
});

export const {SetAllEvents} = eventSlice.actions;
export default eventSlice.reducer;