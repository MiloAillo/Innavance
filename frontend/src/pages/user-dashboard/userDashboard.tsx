import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import type { JSX } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import type { DashboardResponse } from "../../types/dashboard.type";
import type {
  PaginatedNotificationsResponse,
  NotificationQuery,
  NotificationType,
} from "../../types/paginated-notifications.type";
import {
  Bell,
  CircleAlert,
  TriangleAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  callInnkeeper,
  getDashboardData,
  checkoutBooking,
  getPaginatedNotifications,
} from "../../API/dashboard-api";
import { io } from "socket.io-client";
import { SiteFooter } from "../../components/site-footer";

interface MetricsData {
  roomId: number;
  accountId: string | null;
  smartDoorIsLocked: boolean;
  smartDoorIsOpened: boolean;
  electricityOutput: number;
  waterOutput: number;
  isInnkeeperCalled: boolean;
}

export function UserDashboard(): JSX.Element {
  const [data, setData] = useState<DashboardResponse>(useLoaderData());
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--");
  const [gracePeriodLeft, setGracePeriodLeft] = useState<string>("--:--");
  const [isLessThanHour, setIsLessThanHour] = useState<boolean>(false);
  const [isLessThanDay, setIsLessThanDay] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showGracePeriodWarning, setShowGracePeriodWarning] = useState(false);
  const [gracePeriodWarningShown, setGracePeriodWarningShown] = useState(false);
  const [socketError, setSocketError] = useState(false);
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [notificationsData, setNotificationsData] =
    useState<PaginatedNotificationsResponse | null>(null);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsOrderBy, setNotificationsOrderBy] = useState<
    "createdAt" | "title"
  >("createdAt");
  const [notificationsOrder, setNotificationsOrder] = useState<"asc" | "desc">(
    "desc",
  );
  const [notificationsFilter, setNotificationsFilter] = useState<
    NotificationType[]
  >(["info", "important", "warning"]);

  const handleCallInnkeeper = async () => {
    const roomID = parseInt(localStorage.getItem("roomID") ?? "0");
    const accountID = localStorage.getItem("accountID") ?? "0";

    setIsCallLoading(true);
    setCallError(null);

    try {
      await callInnkeeper(roomID, accountID, true);
      const updatedData = await getDashboardData(roomID, accountID);
      setData(updatedData);
      setShowCallModal(false);
    } catch (error) {
      console.error("Failed to call innkeeper:", error);
      setCallError("Failed to call innkeeper. Please try again.");
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleCancelInnkeeper = async () => {
    const roomID = parseInt(localStorage.getItem("roomID") ?? "0");
    const accountID = localStorage.getItem("accountID") ?? "0";

    setIsCancelLoading(true);
    setCancelError(null);

    try {
      await callInnkeeper(roomID, accountID, false);
      const updatedData = await getDashboardData(roomID, accountID);
      setData(updatedData);
      setShowCancelModal(false);
    } catch (error) {
      console.error("Failed to cancel innkeeper:", error);
      setCancelError("Failed to cancel innkeeper call. Please try again.");
    } finally {
      setIsCancelLoading(false);
    }
  };

  const handleCheckout = async () => {
    const roomID = parseInt(localStorage.getItem("roomID") ?? "0");
    const accountID = localStorage.getItem("accountID") ?? "0";

    setIsCheckoutLoading(true);
    setCheckoutError(null);

    try {
      await checkoutBooking(data.booking.id, accountID);
      const updatedData = await getDashboardData(roomID, accountID);
      setData(updatedData);
      setShowCheckoutModal(false);
    } catch (error) {
      console.error("Failed to checkout:", error);
      setCheckoutError("Failed to checkout. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("roomID");
    localStorage.removeItem("accountID");
    window.location.href = "/login/user";
  };

  const fetchNotifications = async () => {
    const roomID = parseInt(localStorage.getItem("roomID") ?? "0");
    const accountID = localStorage.getItem("accountID") ?? "0";

    try {
      const query: NotificationQuery = {
        page: notificationsPage,
        limit: 10,
        order_by: notificationsOrderBy,
        order: notificationsOrder,
        filter_type: notificationsFilter,
      };
      const notifData = await getPaginatedNotifications(
        roomID,
        accountID,
        query,
      );
      setNotificationsData(notifData);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleShowAllNotifications = () => {
    setShowNotificationsModal(true);
    fetchNotifications();
  };

  useEffect(() => {
    if (showNotificationsModal) {
      fetchNotifications();
    }
  }, [
    notificationsPage,
    notificationsOrderBy,
    notificationsOrder,
    notificationsFilter,
  ]);

  // Poll notifications every 5 seconds when modal is open
  useEffect(() => {
    if (!showNotificationsModal) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, [showNotificationsModal, notificationsPage, notificationsOrderBy, notificationsOrder, notificationsFilter]);

  useEffect(() => {
    const accountID = localStorage.getItem("accountID");
    if (!accountID) return;

    const socket = io(
      `${import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000"}/metrics`,
      {
        auth: { token: accountID },
      },
    );

    const updateMetrics = (metrics: MetricsData[]) => {
      const roomMetrics = metrics.find(
        (metric) => metric.roomId === data.room.id,
      );
      if (!roomMetrics) return;

      setData((currentData) => ({
        ...currentData,
        metrics: {
          ...currentData.metrics,
          smart_door_is_locked: roomMetrics.smartDoorIsLocked,
          smart_door_is_opened: roomMetrics.smartDoorIsOpened,
          electricity_output: roomMetrics.electricityOutput,
          water_output: roomMetrics.waterOutput,
          is_innkeeper_called: roomMetrics.isInnkeeperCalled,
        },
      }));
      setSocketError(false);
    };

    socket.on("metrics:initial", updateMetrics);
    socket.on("metrics:update", updateMetrics);

    socket.on("connect_error", () => {
      setSocketError(true);
    });

    socket.on("disconnect", () => {
      setSocketError(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [data.room.id]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // If status is checking_out, calculate grace period countdown
      if (data.booking.status === "checking_out") {
        if (!data.metrics.updated_at || !data.metrics.checkout_grace_time) {
          setGracePeriodLeft("--:--");
          return;
        }

        const checkoutTime = new Date(data.metrics.updated_at).getTime();
        const gracePeriodMs = data.metrics.checkout_grace_time * 60 * 1000; // grace period is in MINUTES
        const endTime = checkoutTime + gracePeriodMs;
        const now = Date.now();
        const diff = endTime - now;

        // Show warning modal when 2 minutes left (only once)
        if (diff <= 2 * 60 * 1000 && diff > 0 && !gracePeriodWarningShown) {
          setShowGracePeriodWarning(true);
          setGracePeriodWarningShown(true);
        }

        if (diff <= 0) {
          setGracePeriodLeft("00:00");
          // Grace period ended, logout user
          localStorage.removeItem("roomID");
          localStorage.removeItem("accountID");
          window.location.href = "/login/user";
          return;
        }

        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setGracePeriodLeft(
          `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
        );
        return;
      }

      // Otherwise, calculate normal booking time left
      if (!data.booking.checked_in_at) {
        setTimeLeft("--:--:--");
        return;
      }

      const checkedInTime = new Date(data.booking.checked_in_at).getTime();
      const durationMs = data.booking.duration * 24 * 60 * 60 * 1000; // duration is in DAYS
      const endTime = checkedInTime + durationMs;
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setIsLessThanHour(true);
        setIsLessThanDay(true);
        return;
      }

      // If less than 1 hour (3600000ms)
      if (diff < 60 * 60 * 1000) {
        setIsLessThanHour(true);
        setIsLessThanDay(true);
      } else if (diff < 24 * 60 * 60 * 1000) {
        // If less than 1 day (86400000ms) but more than 1 hour
        setIsLessThanHour(false);
        setIsLessThanDay(true);
      } else {
        setIsLessThanHour(false);
        setIsLessThanDay(false);
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
      );
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [
    data.booking.checked_in_at,
    data.booking.duration,
    data.booking.status,
    data.metrics.updated_at,
    data.metrics.checkout_grace_time,
    gracePeriodWarningShown,
  ]);

  // Poll dashboard data every 5 seconds to refresh notifications
  useEffect(() => {
    const roomID = parseInt(localStorage.getItem("roomID") ?? "0");
    const accountID = localStorage.getItem("accountID") ?? "0";

    const pollDashboard = async () => {
      try {
        const updatedData = await getDashboardData(roomID, accountID);
        setData(updatedData);
      } catch (error) {
        console.error("Failed to poll dashboard data:", error);
      }
    };

    const interval = setInterval(pollDashboard, 5000);

    return () => clearInterval(interval);
  }, []);

  const BOOKING_DETAIL_CARD = (
    <div className="bg-white flex px-5 py-3 rounded-md flex-1">
      <div className="flex-1">
        <p className="font-medium text-xl text-neutral-800">
          Welcome, {data.booking.name}
        </p>
        <p className="text-lg font-medium text-neutral-800">
          to {data.room.name}.
        </p>
        <p className="pt-3 font-semibold text-neutral-700">Extra Addons:</p>
        {data.addons.length === 0 && (
          <p className="font-base text-neutral-500">No addons</p>
        )}
        <ul>
          {data.addons.map((addon) => (
            <li
              key={addon.id}
              className="list-disc list-inside pl-2 font-medium text-neutral-600"
            >
              {addon.name} {addon.count}x - Rp{" "}
              {addon.price.toLocaleString("id-ID")}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 text-right">
        {data.booking.status === "checking_out" ? (
          <>
            <p className="font-semibold text-lg text-neutral-800">
              Checked Out
            </p>
            <p className="text-sm text-neutral-600 mt-1">
              Grace period remaining
            </p>
            <p className="text-2xl font-semibold text-orange-600 mb-2">
              {gracePeriodLeft}
            </p>
          </>
        ) : (
          <>
            <p className="font-medium text-neutral-500">Time left</p>
            <p className="text-2xl font-semibold mb-2">{timeLeft}</p>

            {!data.metrics.is_addon_served && (
              <p className="text-sm font-medium text-neutral-800">
                We are on our way to serve the addons to your room.
              </p>
            )}
            {isLessThanDay && !isLessThanHour && (
              <p className="text-sm font-medium text-orange-600">
                Your booking duration is less than a day.
              </p>
            )}
            {isLessThanHour && (
              <p className="text-sm font-medium text-red-600">
                Time to pack up! Please checkout soon.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );

  const ROOM_METRICS_UI = (
    <div className="bg-white flex flex-col px-5 py-3 gap-3 rounded-md flex-1">
      <p className="font-semibold text-xl text-neutral-800">Room Metrics</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="font-medium text-neutral-600">Smart Door</p>
          <p>locked: {data.metrics.smart_door_is_locked.toString()}</p>
          <p>opened: {data.metrics.smart_door_is_opened.toString()}</p>
        </div>
        <div>
          <p className="font-medium text-neutral-600">Electricity</p>
          <p>output: {data.metrics.electricity_output.toFixed(2)} Amps</p>
        </div>
        <div>
          <p className="font-medium text-neutral-600">Water</p>
          <p>output: {data.metrics.water_output.toFixed(2)} GPM</p>
        </div>
      </div>
    </div>
  );

  const BUTTONS_UI = (
    <div className="flex flex-col gap-1 w-full items-end">
      <div className="flex gap-3 w-full">
        <button
          onClick={() => setShowCheckoutModal(true)}
          disabled={data.booking.status === "checking_out"}
          className={`w-full bg-red-500 px-5 py-2 rounded-sm tracking-wide text-lg font-medium text-white h-fit transition-colors ${data.booking.status === "checking_out" ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600 cursor-pointer"}`}
        >
          Checkout
        </button>
        <button
          onClick={() =>
            data.metrics.is_innkeeper_called
              ? setShowCancelModal(true)
              : setShowCallModal(true)
          }
          disabled={data.booking.status === "checking_out"}
          className={`w-full bg-orange-500 px-5 py-1 rounded-sm tracking-wide text-lg font-medium text-white ${data.booking.status === "checking_out" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${data.metrics.is_innkeeper_called ? "opacity-50" : ""}`}
        >
          Call Innkeeper
        </button>
      </div>
      {data.metrics.is_innkeeper_called &&
        data.booking.status !== "checking_out" && (
          <div className="flex gap-2 items-center text-orange-500">
            <p className="text-right font-medium">Innkeeper is on their way</p>
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          </div>
        )}
    </div>
  );

  const NOTIFICATIONS_UI = (
    <div className="bg-white flex flex-col rounded-md flex-1 overflow-hidden min-h-0">
      <div className="px-5 pb-3 pt-3 shrink-0">
        <p className="font-semibold text-lg">
          Notifications {"("}
          {data.notificationsCount}
          {")"}
        </p>
      </div>
      <div className="overflow-y-auto flex-1 min-h-0">
        {data.notifications.map((notification) => (
          <div
            className={`flex px-8 py-2.5 border-t gap-3 items-center ${notification.type === "info" ? "bg-green-50 border-green-800/25" : notification.type === "warning" ? "bg-orange-50 border-orange-700/25" : "bg-red-50 border-red-700/25"}`}
          >
            <div
              className={`flex justify-center items-center w-15 h-15 shrink-0 rounded-lg border-2 ${notification.type === "info" ? "border-green-500/25 bg-green-50" : notification.type === "warning" ? "border-orange-500/25 bg-orange-50" : "border-red-500/25 bg-red-50"}`}
            >
              {notification.type === "info" && (
                <Bell className="text-green-500/75" size={30} />
              )}
              {notification.type === "warning" && (
                <CircleAlert className="text-orange-500/75" size={30} />
              )}
              {notification.type === "important" && (
                <TriangleAlert className="text-red-500/75" size={30} />
              )}
            </div>
            <div className="w-full min-w-0">
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm">{notification.description}</p>
              <p className="text-sm text-neutral-500 text-right">
                {new Date(notification.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleShowAllNotifications}
        className="px-5 pb-3 py-3 border-t border-neutral-600/25 flex justify-center items-center shrink-0 text-blue-500 hover:bg-neutral-50 transition-colors"
      >
        Show All
      </button>
    </div>
  );

  const CALL_INNKEEPER_MODAL = showCallModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setShowCallModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">
          Call Innkeeper Confirmation
        </h2>
        <p className="text-neutral-600 mb-6">
          Are you sure you want to call the innkeeper? They will be notified and
          come to your room shortly.
        </p>
        {callError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {callError}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowCallModal(false);
              setCallError(null);
            }}
            disabled={isCallLoading}
            className="flex-1 px-5 py-2 rounded-md font-semibold text-neutral-700 bg-neutral-200 hover:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
          <button
            onClick={handleCallInnkeeper}
            disabled={isCallLoading}
            className="flex-1 px-5 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCallLoading ? "Calling..." : "Call"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const CANCEL_INNKEEPER_MODAL = showCancelModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setShowCancelModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">
          Cancel Innkeeper Call
        </h2>
        <p className="text-neutral-600 mb-6">
          Do you want to cancel the innkeeper call? They will be notified that
          you no longer need assistance.
        </p>
        {cancelError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {cancelError}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowCancelModal(false);
              setCancelError(null);
            }}
            disabled={isCancelLoading}
            className="flex-1 px-5 py-2 rounded-md font-semibold text-neutral-700 bg-neutral-200 hover:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
          <button
            onClick={handleCancelInnkeeper}
            disabled={isCancelLoading}
            className="flex-1 px-5 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelLoading ? "Canceling..." : "Cancel Call"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const CHECKOUT_MODAL = showCheckoutModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setShowCheckoutModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-neutral-800 mb-4">
          Checkout Confirmation
        </h2>
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Checking out ends access to this room dashboard and your room
          credentials.
        </div>
        <p className="mt-4 text-neutral-600">
          Please ensure you have packed all belongings before continuing. You
          cannot undo this action.
        </p>
        <p className="mt-4 text-right text-sm font-medium text-neutral-500">
          Time left: {timeLeft}
        </p>
        {checkoutError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {checkoutError}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setShowCheckoutModal(false);
              setCheckoutError(null);
            }}
            disabled={isCheckoutLoading}
            className="flex-1 px-5 py-2 rounded-md font-semibold text-neutral-700 bg-neutral-200 hover:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
          <button
            onClick={handleCheckout}
            disabled={isCheckoutLoading}
            className="flex-1 px-5 py-2 rounded-md font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCheckoutLoading ? "Checking out..." : "Checkout"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const NOTIFICATIONS_MODAL = showNotificationsModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => setShowNotificationsModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 shadow-xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-neutral-800">
            Notifications
          </h2>
          <button
            onClick={() => setShowNotificationsModal(false)}
            className="text-neutral-500 hover:text-neutral-700 text-lg font-semibold"
          >
            Close
          </button>
        </div>

        {/* Filters and Sorting bar */}
        <div className="flex flex-wrap gap-4 items-center justify-between pb-4 border-b border-neutral-200 mb-4 text-sm">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-semibold text-neutral-600">Filter type:</span>
            {(["info", "important", "warning"] as NotificationType[]).map(
              (type) => {
                const active = notificationsFilter.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setNotificationsFilter((prev) =>
                        active
                          ? prev.filter((t) => t !== type)
                          : [...prev, type],
                      );
                      setNotificationsPage(1);
                    }}
                    className={`px-3 py-1 rounded-full border text-xs capitalize transition-colors ${
                      active
                        ? type === "info"
                          ? "bg-green-100 border-green-300 text-green-800"
                          : type === "warning"
                            ? "bg-orange-100 border-orange-300 text-orange-800"
                            : "bg-red-100 border-red-300 text-red-800"
                        : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {type}
                  </button>
                );
              },
            )}
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600">Sort by:</span>
              <select
                value={notificationsOrderBy}
                onChange={(e) => {
                  setNotificationsOrderBy(
                    e.target.value as "createdAt" | "title",
                  );
                  setNotificationsPage(1);
                }}
                className="border border-neutral-300 rounded px-2 py-1 bg-transparent cursor-pointer"
              >
                <option value="createdAt">Date Created</option>
                <option value="title">Title</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-600">Order:</span>
              <select
                value={notificationsOrder}
                onChange={(e) => {
                  setNotificationsOrder(e.target.value as "asc" | "desc");
                  setNotificationsPage(1);
                }}
                className="border border-neutral-300 rounded px-2 py-1 bg-transparent cursor-pointer"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 flex flex-col gap-2">
          {notificationsData?.notifications.length === 0 ? (
            <p className="text-center text-neutral-500 py-10">
              No notifications found.
            </p>
          ) : (
            notificationsData?.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex px-6 py-3 rounded-lg border gap-3 items-center ${
                  notification.type === "info"
                    ? "bg-green-50 border-green-100"
                    : notification.type === "warning"
                      ? "bg-orange-50 border-orange-100"
                      : "bg-red-50 border-red-100"
                }`}
              >
                <div
                  className={`flex justify-center items-center w-12 h-12 shrink-0 rounded-lg border ${
                    notification.type === "info"
                      ? "border-green-200 bg-green-100/50 text-green-600"
                      : notification.type === "warning"
                        ? "border-orange-200 bg-orange-100/50 text-orange-600"
                        : "border-red-200 bg-red-100/50 text-red-600"
                  }`}
                >
                  {notification.type === "info" && <Bell size={24} />}
                  {notification.type === "warning" && <CircleAlert size={24} />}
                  {notification.type === "important" && (
                    <TriangleAlert size={24} />
                  )}
                </div>
                <div className="w-full min-w-0">
                  <p className="font-semibold text-neutral-800">
                    {notification.title}
                  </p>
                  <p className="text-sm text-neutral-600 mt-0.5">
                    {notification.description}
                  </p>
                  <p className="text-xs text-neutral-400 text-right mt-1">
                    {new Date(notification.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination footer */}
        {notificationsData && notificationsData.meta.page_end > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-neutral-200 mt-4 text-sm font-medium text-neutral-600">
            <span>
              Showing Page {notificationsData.meta.page} of{" "}
              {notificationsData.meta.page_end} ({notificationsData.meta.total}{" "}
              total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setNotificationsPage((prev) => Math.max(1, prev - 1))
                }
                disabled={!notificationsData.meta.has_page_before}
                className="flex items-center gap-1 px-3 py-1.5 rounded border border-neutral-300 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Prev
              </button>
              <button
                onClick={() =>
                  setNotificationsPage((prev) =>
                    Math.min(notificationsData.meta.page_end, prev + 1),
                  )
                }
                disabled={!notificationsData.meta.has_page_after}
                className="flex items-center gap-1 px-3 py-1.5 rounded border border-neutral-300 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <section className="flex min-h-screen w-screen flex-col bg-neutral-100 pt-20">
      <motion.nav
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
        className="w-screen fixed top-0 flex justify-between items-center px-4 py-3 bg-white shadow-sm z-40"
      >
        <img src="/logo.svg" className="h-10" />
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 rounded-md border border-neutral-300 font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer text-sm"
        >
          Logout
        </button>
      </motion.nav>

      <div className="flex flex-1 items-start justify-center">
        {socketError && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-yellow-600">
                  <CircleAlert size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-yellow-800">
                    Real-time updates disconnected
                  </p>
                  <p className="text-sm text-yellow-700">
                    Metrics may be outdated. Reconnecting automatically...
                  </p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 text-sm font-medium text-yellow-700 hover:text-yellow-900 border border-yellow-300 rounded hover:bg-yellow-100 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
          className="mx-auto flex flex-1 flex-col gap-3 w-full max-w-screen-2xl px-5 items-stretch md:flex-row"
        >
          <div className="h-full w-full flex flex-col gap-3">
            {BOOKING_DETAIL_CARD}
            {ROOM_METRICS_UI}
          </div>
          <div className="h-full w-full flex flex-col gap-3">
            {BUTTONS_UI}
            {NOTIFICATIONS_UI}
          </div>
        </motion.div>
      </div>

      <div className="h-10 md:h-20" />

      <SiteFooter />

      <AnimatePresence>
        {CALL_INNKEEPER_MODAL}
        {CANCEL_INNKEEPER_MODAL}
        {CHECKOUT_MODAL}
        {NOTIFICATIONS_MODAL}
        {showGracePeriodWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-orange-600 mb-4">
                Grace Period Ending Soon
              </h2>
              <div className="rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700 mb-4">
                Your grace period will end in 2 minutes. Please complete your
                payment at the front desk.
              </div>
              <div className="bg-neutral-50 rounded-md p-4 mb-4">
                <p className="font-semibold text-neutral-800 mb-2">
                  Booking Summary
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Room:</span>
                    <span className="font-medium">{data.room.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Duration:</span>
                    <span className="font-medium">
                      {data.booking.duration} day(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Payment Method:</span>
                    <span className="font-medium capitalize">
                      {data.booking.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-200">
                    <span className="text-neutral-800 font-semibold">
                      Total:
                    </span>
                    <span className="font-semibold text-lg">
                      Rp {data.booking.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowGracePeriodWarning(false)}
                className="w-full px-5 py-2 rounded-md font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
