export interface DashboardMetrics {
    is_addon_served: boolean;
    is_innkeeper_called: boolean;
    checkout_grace_time: Date;
    created_at: Date;
    updated_at: Date;
    smart_door_is_locked: boolean;
    smart_door_is_opened: boolean;
    water_output: number;
    electricity_output: number;
}

export interface DashboardBooking {
    id: number;
    status: string;
    name: string;
    duration: number;
    price: number;
    payment_method: string;
    checked_in_at: Date | null;
}

export interface DashboardNotification {
    id: number;
    type: string;
    title: string;
    description: string;
    createdAt: Date;
}

export interface DashboardRoom {
    id: number;
    name: string;
    price: number;
    capacity: number;
    description: string;
}

export interface DashboardAddon {
    id: number;
    name: string;
    count: number;
    price: number;
}

export interface DashboardResponse {
    room: DashboardRoom;
    metrics: DashboardMetrics;
    booking: DashboardBooking;
    addons: DashboardAddon[];
    notifications: DashboardNotification[];
    notificationsCount: number;
}
