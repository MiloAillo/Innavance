export type BookingStatus = 'on_hold' | 'rejected' | 'checked_in' | 'checking_out' | 'checked_out';

export interface BookingDetail {
    room_id: number;
    name: string;
    phone_number: string;
    status: BookingStatus;
    duration: number;
    price: string;
    payment_method: string;
    room_name: string;
    is_auto_approve: boolean;
    auto_approve_time: number;
    created_at: string;
}
