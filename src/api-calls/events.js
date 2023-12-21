import { axiosInstance } from "./index.js";

export const CreateEventCall = async (data) => {
    try {
        const response = await axiosInstance.post("/api/events/new-event", data);
        return response.data;
    }
    catch (e) {
        return e.response.data;
    }
}

export const GetAllEvents = async (data) => {
    try {
        const response = await axiosInstance.put("/api/events/all-events", data);
        return response.data;
    }
    catch (e) {
        return e.response.data;
    }
}