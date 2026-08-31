import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Phone, AlertCircle, Sparkles, Package, Wallet, Users, Calendar } from "lucide-react";
import type { AdminBooking } from "../types/admin-dashboard.type";

interface BookingCardProps {
    booking: AdminBooking;
    onApprove: (id: number) => void;
    onReject?: (id: number) => void;
    onServeAddon: (id: number) => void;
    onDismissCall: (id: number) => void;
    onForceCheckout: (id: number) => void;
    canApprove: boolean;
    canDismiss: boolean;
    canForceCheckout: boolean;
    isApproving?: boolean;
    isRejecting?: boolean;
    isServingAddon?: boolean;
    isDismissing?: boolean;
    isForcingCheckout?: boolean;
}

function useCountdown(deadline: Date | null) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (!deadline) return;
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, [deadline]);
    if (!deadline) return null;
    const diff = deadline.getTime() - now;
    if (diff <= 0) return "0s";
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}m ${s}s`;
}

export function BookingCard({ booking, onApprove, onReject, onServeAddon, onDismissCall, onForceCheckout, canApprove, canDismiss, canForceCheckout, isApproving, isRejecting, isServingAddon, isDismissing, isForcingCheckout }: BookingCardProps) {
    const formattedDate = new Date(booking.createdAt).toLocaleDateString();
    const checkinDate = new Date(booking.createdAt);
    const checkoutDate = new Date(checkinDate.getTime() + booking.duration * 24 * 60 * 60 * 1000);
    const formattedCheckin = checkinDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const formattedCheckout = checkoutDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const autoApproveDeadline = useMemo(() => {
        if (booking.status !== "on_hold" || !booking.isAutoApprove || !booking.autoApproveTime) return null;
        const created = new Date(booking.createdAt).getTime();
        return new Date(created + booking.autoApproveTime * 60000);
    }, [booking]);

    const gracePeriodDeadline = useMemo(() => {
        if (booking.status !== "checking_out" || !booking.checkoutGraceTime || !booking.updatedAt) return null;
        const updatedTime = new Date(booking.updatedAt).getTime();
        const gracePeriodMs = booking.checkoutGraceTime * 60 * 1000; // convert minutes to milliseconds
        return new Date(updatedTime + gracePeriodMs);
    }, [booking]);

    const countdown = useCountdown(autoApproveDeadline);
    const gracePeriodCountdown = useCountdown(gracePeriodDeadline);

    const addonList = booking.bookingsAddons.length
        ? booking.bookingsAddons.map((a) => `${a.addonAddon.addon} x${a.count}`).join(", ")
        : "None";

    const statusLabel = booking.status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    const whatsappLink = `https://wa.me/${booking.phoneNumber.replace(/\D/g, "")}`;

    return (
        <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-neutral-800">{booking.bookingRoom?.name || `Room #${booking.room_id}`}</h3>
                    <p className="mt-1 text-sm font-medium text-neutral-600">{booking.name}</p>
                </div>
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        booking.status === "on_hold"
                            ? "bg-yellow-100 text-yellow-800"
                            : booking.status === "checked_in"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "checking_out"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-neutral-100 text-neutral-800"
                    }`}
                >
                    {statusLabel}
                </span>
            </div>

            {/* Info rows */}
            <div className="flex flex-col gap-2 text-xs text-neutral-600">
                <span className="flex items-center gap-2 font-semibold text-neutral-800">
                    <Wallet size={15} />
                    Rp {booking.price.toLocaleString("id-ID")} · {booking.paymentMethod}
                </span>
                <a 
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline"
                >
                    <Phone size={15} />{booking.phoneNumber}
                </a>
                <span className="flex items-center gap-2">
                    <Calendar size={15} />
                    {booking.duration} days ({formattedCheckin} - {formattedCheckout})
                </span>
                {booking.status === "checked_out" && booking.checkedOutAt && (
                    <span className="flex items-center gap-2 font-semibold text-blue-700">
                        <Clock size={15} />
                        Checked out: {new Date(booking.checkedOutAt).toLocaleString("en-US", { 
                            month: "short", 
                            day: "numeric", 
                            hour: "2-digit", 
                            minute: "2-digit" 
                        })}
                    </span>
                )}
                <span className="flex items-center gap-2">
                    <Users size={15} />
                    Room capacity: {booking.bookingRoom?.capacity || "N/A"} people
                </span>
                <span className="flex items-center gap-2"><Package size={15} />Addons: {addonList}</span>
                {gracePeriodCountdown && (
                    <span className="flex items-center gap-2 font-semibold text-orange-700">
                        <Clock size={15} />
                        Grace period: {gracePeriodCountdown} remaining
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                {/* Innkeeper call */}
                {booking.isInnkeeperCalled && (
                    <button
                        disabled={!canDismiss || isDismissing}
                        onClick={() => onDismissCall(booking.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                        <AlertCircle size={16} /> {isDismissing ? "Dismissing..." : "Dismiss Innkeeper Call"}
                    </button>
                )}

                {/* Addon served */}
                {!booking.isAddonServed && booking.bookingsAddons.length > 0 && (
                    <button
                        disabled={isServingAddon}
                        onClick={() => onServeAddon(booking.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors"
                    >
                        <Sparkles size={16} /> {isServingAddon ? "Serving..." : "Serve Addons"}
                    </button>
                )}

                {/* Approval */}
                {booking.status === "on_hold" && (
                    <div className="flex w-full flex-col gap-2">
                        <div className="flex w-full gap-2">
                            <button
                                disabled={!canApprove || isRejecting || isApproving}
                                onClick={() => onReject?.(booking.id)}
                                className="flex-1 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                            >
                                {isRejecting ? "Rejecting..." : "Reject"}
                            </button>
                            <button
                                disabled={!canApprove || isApproving || isRejecting}
                                onClick={() => onApprove(booking.id)}
                                className="flex-1 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                            >
                                {isApproving ? "Approving..." : countdown ? `Accept (${countdown})` : "Accept"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Force checkout */}
                {booking.status === "checked_in" && (
                    <button
                        disabled={!canForceCheckout || isForcingCheckout}
                        onClick={() => onForceCheckout(booking.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-900 disabled:opacity-50 transition-colors"
                    >
                        {isForcingCheckout ? "Processing..." : "Force Checkout"}
                    </button>
                )}
            </div>
        </motion.article>
    );
}
