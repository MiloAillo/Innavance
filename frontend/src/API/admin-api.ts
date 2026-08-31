import axios from "axios";
import type {
  AdminUser,
  AdminUserInfo,
  AdminRoomsResponse,
  AdminBookingsResponse,
  AdminUsersResponse,
  AdminSettings,
  StaffPermissions,
} from "../types/admin-dashboard.type";

const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

// Create a dedicated axios instance for admin requests
export const adminApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Track if we're currently refreshing to prevent multiple refresh requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("adminRefreshToken");
  if (!refreshToken) return null;

  try {
    const response = await axios.post<{ activeToken: string }>(
      `${BASE_URL}/admins/auth/refresh`,
      { refresh_token: refreshToken },
      { timeout: 10000 },
    );
    const newActiveToken = response.data.activeToken;
    localStorage.setItem("adminActiveToken", newActiveToken);
    return newActiveToken;
  } catch {
    localStorage.removeItem("adminActiveToken");
    localStorage.removeItem("adminRefreshToken");
    window.location.href = "/login/admin";
    return null;
  }
}

// Request interceptor: attach active token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminActiveToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: refresh on 401
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(adminApi(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return adminApi(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

// API Functions
export async function getAdminUserInfo(): Promise<AdminUserInfo> {
  const response = await adminApi.get<AdminUserInfo>("/admins/dashboard");
  return response.data;
}

export async function getAdminRooms(
  params?: Record<string, unknown>,
): Promise<AdminRoomsResponse> {
  const response = await adminApi.get<AdminRoomsResponse>(
    "/admins/dashboard/rooms",
    { params },
  );
  return response.data;
}

export async function getAdminBookings(
  params?: Record<string, unknown>,
): Promise<AdminBookingsResponse> {
  const response = await adminApi.get<AdminBookingsResponse>(
    "/admins/dashboard/bookings",
    { params },
  );
  return response.data;
}

export async function getAdminUsers(
  params?: Record<string, unknown>,
): Promise<AdminUsersResponse> {
  const response = await adminApi.get<AdminUsersResponse>(
    "/admins/dashboard/users",
    { params },
  );
  return response.data;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const response = await adminApi.get<AdminSettings>(
    "/admins/dashboard/settings",
  );
  return response.data;
}

export async function updateBookingSettings(
  data: Pick<
    AdminSettings,
    | "is_auto_approve"
    | "auto_approve_time"
    | "checkout_grace_period"
    | "smart_door_default_pin"
  >,
): Promise<AdminSettings> {
  const response = await adminApi.put<AdminSettings>(
    "/admins/dashboard/settings",
    data,
  );
  return response.data;
}

export async function updateStaffPermissions(
  data: StaffPermissions,
): Promise<StaffPermissions> {
  const response = await adminApi.put<StaffPermissions>(
    "/admins/dashboard/settings/staff-permissions",
    data,
  );
  return response.data;
}

export async function markAddonServed(booking_id: number): Promise<void> {
  await adminApi.patch("/admins/dashboard/bookings/served", { booking_id });
}

export async function dismissInnkeeperCall(
  booking_id: number,
  message: string,
): Promise<void> {
  await adminApi.patch("/admins/dashboard/bookings/dismiss", {
    booking_id,
    message,
  });
}

export async function forceCheckout(
  booking_id: number,
  allow_grace_period: boolean,
  message: string,
): Promise<void> {
  await adminApi.patch("/admins/dashboard/bookings/checkout", {
    booking_id,
    allow_grace_period,
    message,
  });
}

export async function rejectBooking(booking_id: number): Promise<void> {
  await adminApi.patch("/admins/dashboard/bookings/reject", { booking_id });
}

export async function approveBooking(booking_id: number): Promise<void> {
  await adminApi.patch("/admins/dashboard/bookings/approve", { booking_id });
}

export async function createStaff(data: {
  name: string;
  username: string;
  password: string;
}): Promise<AdminUser> {
  const response = await adminApi.post<AdminUser>(
    "/admins/dashboard/users",
    data,
  );
  return response.data;
}

export async function deleteStaff(id: number): Promise<void> {
  await adminApi.delete(`/admins/dashboard/users/${id}`);
}
