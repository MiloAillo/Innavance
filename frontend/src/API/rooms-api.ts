import axios from "axios"
import { genericAPI } from "./axios-config/generic-instance"
import type { RoomListResponse } from "../types/room-list.type"

export const getRoomDetail = async (id: number | string) => {
    try {
        const res = await genericAPI.get(`${import.meta.env.VITE_BACKEND_URL}/rooms/${id}`)
        return res.data
    } catch (err) {
        return Promise.reject(err)        
    }
}

export const getRoomList = async (params?: { page?: number; limit?: number; order_by?: string; order?: string }): Promise<RoomListResponse> => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rooms`, { params })
        return res.data
    } catch (err) {
        return Promise.reject(err)
    }
}

export const getRoomQRCode = async (id: number | string) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/rooms/${id}/qr-code`)
        return res.data
    } catch (err) {
        return Promise.reject(err)
    }
}