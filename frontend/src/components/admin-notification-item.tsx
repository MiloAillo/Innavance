import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";
import type { AdminNotification } from "../types/admin-notification.type";

interface AdminNotificationItemProps {
  notification: AdminNotification;
  onMarkRead: (id: number) => void;
  onDismiss: (id: number) => void;
}

export default function AdminNotificationItem({
  notification,
  onMarkRead,
  onDismiss,
}: AdminNotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss(notification.id);
  };

  const getTypeBadgeColor = () => {
    switch (notification.type) {
      case "info":
        return "bg-blue-500";
      case "warning":
        return "bg-amber-500";
      case "important":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const relativeTime = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
        !notification.isRead ? "bg-blue-50" : "bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-block px-2 py-0.5 text-xs font-medium text-white rounded ${getTypeBadgeColor()}`}
            >
              {notification.type.toUpperCase()}
            </span>
            <span className="text-xs text-gray-500">{relativeTime}</span>
          </div>
          <h4
            className={`text-sm mb-1 ${
              !notification.isRead ? "font-bold" : "font-medium"
            }`}
          >
            {notification.title}
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {notification.description}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
