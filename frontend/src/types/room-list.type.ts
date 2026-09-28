export interface Room {
    id: number;
    name: string;
    price: number;
    capacity: number;
    isAvailable: boolean;
    features?: Array<{
        id: number;
        feature: string;
    }>;
    addons?: Array<{
        id: number;
        addon: string;
        price: number;
        isActive: boolean;
    }>;
}

export interface RoomListMeta {
    total: number;
    page: number;
    order: string;
    order_by: string;
    has_page_before: boolean;
    has_page_after: boolean;
    page_end: number;
}

export interface RoomListResponse {
    data: Room[];
    meta: RoomListMeta;
}
