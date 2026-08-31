import axios from "axios";
import type { DashboardResponse } from "../types/dashboard.type";

const BASE_URL = "http://localhost:3000";

export async function dashboardLogin(roomId: number, accountId: string): Promise<void> {
    const response = await axios.get(`${BASE_URL}/dashboard/${roomId}/check`, {
        headers: {
            Authorization: `Bearer ${accountId}`
        },
        timeout: 10000
    });

    return response.data;
}

export async function getDashboardData(roomId: number, accountId: string): Promise<DashboardResponse> {
    const response = await axios.get<DashboardResponse>(`${BASE_URL}/dashboard/${roomId}`, {
        headers: {
            Authorization: `Bearer ${accountId}`
        },
        timeout: 10000
    });

    return response.data;
}
