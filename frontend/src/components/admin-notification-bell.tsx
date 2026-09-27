import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { getAdminUnreadCount } from "../API/admin-api";
import AdminNotificationPopup from "./admin-notification-popup";

export default function AdminNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const response = await getAdminUnreadCount();
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleUnreadCountChange = () => {
    fetchUnreadCount();
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={togglePopup}
        className="relative p-2 text-white hover:text-green-400 hover:bg-neutral-800 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px] animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isPopupOpen && (
        <AdminNotificationPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onUnreadCountChange={handleUnreadCountChange}
          buttonRef={buttonRef}
        />
      )}
    </>
  );
}
