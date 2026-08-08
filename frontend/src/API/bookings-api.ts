import axios from "axios";
import type { PostReservationType } from "../types/post-reservation.type";

export const postReservation = async ({ room_id, full_name, phone_number, payment_method, duration, addons }: PostReservationType) => {
    console.log({
            room_id,
            full_name,
            phone_number,
            payment_method,
            duration,
            addons
        })

    try {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/bookings`, {
            room_id,
            full_name,
            phone_number,
            payment_method,
            duration,
            addons
        }, {
            timeout: 15000
        })

        return res.data
    } catch (err) {
        return Promise.reject(err)
    }
}