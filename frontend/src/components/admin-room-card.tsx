import { motion } from "framer-motion";
import { DoorOpen, Droplets, Lock, Unlock, Zap, Key } from "lucide-react";
import type { AdminRoom } from "../types/admin-dashboard.type";

export function RoomCard({ room }: { room: AdminRoom }) {
    const booking = room.bookings[0];
    const statusLabel = booking
        ? booking.status
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : null;

    return (
        <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-lg font-bold text-neutral-800">{room.name}</p>
                    <p className="mt-1 text-sm text-neutral-500">{room.capacity} guests · Rp {room.price.toLocaleString("id-ID")}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${room.isAvailable ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {room.isAvailable ? "Available" : "Occupied"}
                </span>
            </div>
            {booking ? (
                <div className="mt-5 rounded-lg bg-neutral-50 p-3 text-sm space-y-1">
                    <p className="font-semibold text-neutral-800">{booking.name}</p>
                    <p className="text-neutral-600">{booking.phoneNumber}</p>
                    <p className="capitalize text-neutral-500">{statusLabel}</p>
                    <p className="text-xs text-neutral-500">{booking.duration} days · Rp {booking.price.toLocaleString("id-ID")}</p>
                </div>
            ) : (
                <p className="mt-5 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-500">No active booking</p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-neutral-600">
                <span className="flex items-center gap-2">
                    <DoorOpen size={15} />
                    {room.smartDoorIsOpened ? "Door open" : "Door closed"}
                </span>
                <span className="flex items-center gap-2">
                    {room.smartDoorIsLocked ? <Lock size={15} /> : <Unlock size={15} />}
                    {room.smartDoorIsLocked ? "Locked" : "Unlocked"}
                </span>
                <span className="flex items-center gap-2">
                    <Zap size={15} />
                    {room.electricityOutput.toFixed(2)} Amps
                </span>
                <span className="flex items-center gap-2">
                    <Droplets size={15} />
                    {room.waterOutput.toFixed(2)} GPM
                </span>
                <span className="flex items-center gap-2 col-span-2 font-semibold text-neutral-700">
                    <Key size={15} />
                    PIN: {room.smartDoorPin}
                </span>
            </div>
        </motion.article>
    );
}
