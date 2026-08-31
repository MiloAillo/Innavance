import axios from "axios";
import type { AdminLoginCredentials, AdminLoginResponse } from "../types/admin-auth.type";

export async function adminLogin(credentials: AdminLoginCredentials): Promise<AdminLoginResponse> {
    const response = await axios.post<AdminLoginResponse>(`${import.meta.env.VITE_BACKEND_URL}/admins/auth`, credentials, {
        timeout: 10000
    });
    return response.data;
}
