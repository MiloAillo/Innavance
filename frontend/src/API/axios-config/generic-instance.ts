import axios from "axios";

// create new axios instance
const genericAPI = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL
})

export { genericAPI }