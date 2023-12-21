import { createSlice } from "@reduxjs/toolkit";

const eventSlice = createSlice({
    name: "events",
    initialState: {
        allEvents: [],
    },
    reducers: {
        SetAllEvents: (state,action) => {
            state.events = action.payload;
        }
    }
});

export const {SetAllEvents} = eventSlice.actions;
export default eventSlice.reducer;