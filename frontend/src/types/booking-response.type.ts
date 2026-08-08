export interface BookingAddon {
    addon_name: string;
    count: number;
    price: number;
}

export interface BookingResponse {
    booking_id: number;
    room_name: string;
    duration: number;
    price: number;
    addons: BookingAddon[];
    wait_for_approval: boolean;
}
