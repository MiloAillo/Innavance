export type NotificationType = "info" | "important" | "warning";
export type NotificationOrderBy = "createdAt" | "title";
export type NotificationOrder = "asc" | "desc";

export interface PaginatedNotification {
    id: number;
    type: NotificationType;
    title: string;
    description: string;
    createdAt: string;
}

export interface NotificationMeta {
    total: number;
    page: number;
    order: NotificationOrder;
    order_by: NotificationOrderBy;
    has_page_before: boolean;
    has_page_after: boolean;
    page_end: number;
}

export interface PaginatedNotificationsResponse {
    notifications: PaginatedNotification[];
    meta: NotificationMeta;
}

export interface NotificationQuery {
    page?: number;
    limit?: number;
    order_by?: NotificationOrderBy;
    order?: NotificationOrder;
    filter_type?: NotificationType[];
}
