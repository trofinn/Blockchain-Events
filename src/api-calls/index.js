import axios from 'axios';

axios.defaults.headers.common = {
    "Content-Type": "application/json"
}
export const axiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json',
    }
});