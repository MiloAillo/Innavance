import axios from "axios";
import type { DashboardResponse } from "../types/dashboard.type";
import type { CheckoutResponse } from "../types/checkout.type";
import type { PaginatedNotificationsResponse, NotificationQuery } from "../types/paginated-notifications.type";

export async function dashboardLogin(roomId: number, accountId: string): Promise<void> {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/dashboard/${roomId}/check`, {
        headers: {
            Authorization: `Bearer ${accountId}`
        },
        timeout: 10000
    });

    return response.data;
}

export async function getDashboardData(roomId: number, accountId: string): Promise<DashboardResponse> {
    const response = await axios.get<DashboardResponse>(`${import.meta.env.VITE_BACKEND_URL}/dashboard/${roomId}`, {
        headers: {
            Authorization: `Bearer ${accountId}`
        },
        timeout: 10000
    });

    return response.data;
}

export async function callInnkeeper(roomId: number, accountId: string, value: boolean): Promise<void> {
    const response = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/dashboard/${roomId}/call`, null, {
        params: { value },
        headers: {
            Authorization: `Bearer ${accountId}`
        },
        timeout: 10000
    });

    return response.data;
}

export async function checkoutBooking(bookingId: number, accountId: string): Promise<CheckoutResponse> {
    const response = await axios.post<CheckoutResponse>(`${import.meta.env.VITE_BACKEND_URL}/bookings/${bookingId}/checkout`, null, {
        headers: {
            Authorization: `Bearer ${accountId}`
        },
        timeout: 10000
    });

    return response.data;
}

export async function getPaginatedNotifications(
    roomId: number,
    accountId: string,
    query: NotificationQuery
): Promise<PaginatedNotificationsResponse> {
    const filter_type = query.filter_type?.join(",");
    const response = await axios.get<PaginatedNotificationsResponse>(`${import.meta.env.VITE_BACKEND_URL}/dashboard/${roomId}/notifications`, {
        params: {
            ...query,
            filter_type
        },
        headers: {
            Authorization: `Bearer ${accountId}`
        },
        timeout: 10000
    });

    return response.data;
}
