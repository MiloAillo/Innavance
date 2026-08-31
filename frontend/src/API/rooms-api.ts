import axios from "axios"
import { genericAPI } from "./axios-config/generic-instance"

export const getRoomDetail = async (id: number | string) => {
    try {
        const res = await genericAPI.get(`${import.meta.env.VITE_BACKEND_URL}/rooms/${id}`)
        return res.data
    } catch (err) {
        return Promise.reject(err)        
    }
}

export const getRoomList = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rooms`)
        return res.data
    } catch (err) {
        return Promise.reject(err)
    }
}