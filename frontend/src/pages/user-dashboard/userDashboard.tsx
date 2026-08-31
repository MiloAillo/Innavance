import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import type { JSX } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import type { DashboardResponse } from "../../types/dashboard.type";
import { Bell, CircleAlert, TriangleAlert } from "lucide-react";

export function UserDashboard(): JSX.Element {
    const [ data, setData ] = useState<DashboardResponse>(useLoaderData())
    const [timeLeft, setTimeLeft] = useState<string>("--:--:--")

    useEffect(() => {
        console.log(data)
    }, [])

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!data.booking.checked_in_at) {
                setTimeLeft("--:--:--")
                return
            }

            const checkedInTime = new Date(data.booking.checked_in_at).getTime()
            const durationMs = data.booking.duration * 60 * 60 * 1000
            const endTime = checkedInTime + durationMs
            const now = Date.now()
            const diff = endTime - now

            if (diff <= 0) {
                setTimeLeft("00:00:00")
                return
            }

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
        }

        calculateTimeLeft()
        const interval = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(interval)
    }, [data.booking.checked_in_at, data.booking.duration])

    const BOOKING_DETAIL_CARD = (
        <div className="bg-white flex px-5 py-3 rounded-md flex-1">
            <div className="flex-1">
                <p className="font-medium text-xl text-neutral-800">Welcome, {data.booking.name}</p>
                <p className="text-lg font-medium text-neutral-800">to {data.room.name}.</p>
                <p className="pt-3 font-semibold text-neutral-700">Extra Addons:</p>
                <ul>
                    {data.addons.map((data) => (
                        <li className="list-disc list-inside pl-2 font-medium text-neutral-600">{data.name} {data.count}x</li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 text-right">
                <p className="font-medium text-neutral-500">Time left</p>
                <p className="text-2xl font-semibold mb-2">{timeLeft}</p>

                {!data.metrics.is_addon_served &&
                    <p className="text-sm font-medium text-neutral-800">We are on our way to serve the addons to your room.</p>
                }
            </div>
        </div>
    )

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
                    <p>output: {data.metrics.electricity_output.toPrecision(3)} Amps</p>
                </div>
                <div>
                    <p className="font-medium text-neutral-600">Water</p>
                    <p>output: {data.metrics.water_output.toPrecision(3)} GPM</p>
                </div> 
            </div>      
        </div>
    )

    const BUTTONS_UI = (
        <div className="flex flex-col gap-1 w-full items-end">
            <div className="flex gap-3 w-full">
                <button className="w-full bg-red-500 px-5 py-2 rounded-sm tracking-wide text-lg font-medium text-white h-fit">Checkout</button>
                <button className={`w-full bg-orange-500 px-5 py-1 rounded-sm tracking-wide text-lg font-medium text-white ${data.metrics.is_innkeeper_called ? "opacity-50" : ""}`}>Call Innkeeper</button>
            </div>
            {data.metrics.is_innkeeper_called &&
                <div className="flex gap-2 items-center text-orange-500">
                    <p className="text-right font-medium">Innkeeper is on their way</p>
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                </div>
            }
        </div>
    )

    const NOTIFICATIONS_UI = (
        <div className="relative bg-white flex flex-col justify-between rounded-md flex-1 shrink">
            <div className="flex flex-col">
                <div className="px-5 pb-3 pt-3">
                    <p className="font-semibold text-lg">Notifications {"("}{data.notificationsCount}{")"}</p>
                </div>
                <div className="overflow-y-scroll w-full">
                    {data.notifications.map((notification) => (
                        <div className={`flex px-8 py-2.5 border-t gap-3 items-center ${notification.type === "info" ? "bg-green-50 border-green-800/25" : notification.type === "warning" ? "bg-orange-50 border-orange-700/25" : "bg-red-50 border-red-700/25"}`}>
                            <div className={`flex justify-center items-center w-15 h-15 shrink-0 rounded-lg border-2 ${notification.type === "info" ? "border-green-500/25 bg-green-50" : notification.type === "warning" ? "border-orange-500/25 bg-orange-50" : "border-red-500/25 bg-red-50"}`}>
                                {notification.type === "info" &&
                                    <Bell className="text-green-500/75" size={30} />
                                }
                                {notification.type === "warning" &&
                                    <CircleAlert className="text-orange-500/75" size={30} />
                                }
                                {notification.type === "important" &&
                                    <TriangleAlert className="text-red-500/75" size={30} />
                                }
                            </div>
                            <div className="w-full min-w-0">
                                <p className="font-medium">{notification.title}</p>
                                <p className="text-sm">{notification.description}</p>
                                <p className="text-sm text-neutral-500 text-right">18:09</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="px-5 pb-3 py-3 border-t border-neutral-600/25 flex justify-center items-center">
                <p className="text-blue-500 ">Show All</p>
            </div>
        </div>  
    )

    return (
        <section className="bg-neutral-100 flex justify-center items-center w-screen h-screen flex-col gap-5 mb-10 py-20">
            <motion.nav 
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                className="w-screen fixed top-0"
            >
                <img src="/logo.svg" className="h-16 px-4 pt-3" />
            </motion.nav>

            <div className="flex flex-row gap-3 h-full w-full max-w-screen-2xl px-5">
                <div className="h-full w-full flex flex-col gap-3">
                    {BOOKING_DETAIL_CARD}
                    {ROOM_METRICS_UI}
                </div>
                <div className="h-full w-full flex flex-col gap-3">
                    {BUTTONS_UI}
                    {NOTIFICATIONS_UI}
                </div>
            </div>

            <footer className="fixed bottom-0 w-full bg-neutral-600 flex justify-around py-3 text-white underline text-sm font-light">
                <a>Admin contact</a>
                <a>Room rules</a>
                <a>Another notice</a>
            </footer>
        </section>
    )
}