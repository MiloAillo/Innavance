export interface AdminNotification {
  id: number;
  type: 'info' | 'warning' | 'important';
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
}

export interface PaginatedAdminNotificationsResponse {
  data: AdminNotification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  unread_count: number;
}
