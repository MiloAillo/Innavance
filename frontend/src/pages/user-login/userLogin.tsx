import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { JSX } from "react/jsx-runtime";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2Icon } from "lucide-react";
import { getRoomList } from "../../API/rooms-api";
import { dashboardLogin } from "../../API/dashboard-api";
import type { RoomListResponse } from "../../types/room-list.type";

export function UserLogin(): JSX.Element {
    const [state, setState] = useState<"FETCH_ROOM_LIST" | "MAIN" | "SIGNING_IN" | "ERROR" | "LOGIN_ERROR">("FETCH_ROOM_LIST")
    const [roomList, setRoomList] = useState<RoomListResponse>()
    const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
    const [accountId, setAccountId] = useState<string>("")

    const handleSignIn = async () => {
        if (!selectedRoom || !accountId) return
        
        setState("SIGNING_IN")
        try {
            await dashboardLogin(selectedRoom, accountId)
            
            localStorage.setItem("accountID", accountId)
            localStorage.setItem("roomID", selectedRoom.toString())

            window.location.href = `/dashboard` 
        } catch (error) {
            console.error("Login failed:", error)
            setTimeout(() => setState("LOGIN_ERROR"), 300)
        }
    } 

    useEffect(() => {
        if (state === "FETCH_ROOM_LIST") {
            getRoomList()
                .then((data) => {
                    console.log("Room list:", data)
                    setRoomList(data)
                    setTimeout(() => setState("MAIN"), 300)
                })
                .catch((error) => {
                    console.error("Failed to fetch room list:", error)
                    setTimeout(() => setState("ERROR"), 300)
                })
        }
    }, [state])

    const FRAMER_ANIMATION = {
        initial: { x: 30, opacity: 0 },
        animate: { x: 0, opacity: 1, transition: { delay: 0.4 } },
        transition: { type: "spring", stiffness: 300, damping: 30, mass: 2 }
    } as const

    const FETCH_ROOM_UI = state === "FETCH_ROOM_LIST" &&
    (
        <motion.div 
            key="FETCH_STATUS_UI"
            className="flex flex-col items-center gap-2"
            {...FRAMER_ANIMATION}
        >
            <Loader2Icon className="animate-spin" size={30} />
            <p className="text-base font-semibold">Fetching rooms available...</p>
        </motion.div>
    )

    const ERROR_UI = state === "ERROR" &&
    (
        <motion.div 
            key="NO_STATUS_UI"
            {...FRAMER_ANIMATION}
        >
            <p className="font-semibold text-center">Hmm... something is wrong in our end. Please contact our staff for a solution.</p>
        </motion.div>
    )

    const SIGNING_IN_UI = state === "SIGNING_IN" &&
    (
        <motion.div 
            key="SIGNING_IN_UI"
            className="flex flex-col items-center gap-2"
            {...FRAMER_ANIMATION}
        >
            <Loader2Icon className="animate-spin" size={30} />
            <p className="text-base font-semibold">Signing in...</p>
        </motion.div>
    )

    const LOGIN_ERROR_UI = state === "LOGIN_ERROR" &&
    (
        <motion.div 
            key="LOGIN_ERROR_UI"
            className="flex flex-col gap-4"
            {...FRAMER_ANIMATION}
        >
            <div className="flex flex-col items-center gap-2">
                <p className="font-semibold text-xl text-red-600">Sign In Failed</p>
                <p className="text-center text-sm">Invalid room or account ID. Please check your credentials and try again.</p>
            </div>
            <motion.button 
                whileHover={{ scale: 0.98 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setState("MAIN")}
                className="w-full bg-red-500 hover:bg-red-400 py-3 rounded-xl font-semibold text-white transition-opacity"
            >
                Try Again
            </motion.button>
        </motion.div>
    )

    const MAIN_UI = state === "MAIN" &&
    (
        <motion.div 
            key="MAIN_UI"
            className="flex flex-col gap-5"
            {...FRAMER_ANIMATION}
        >
            <div className="flex flex-col items-center gap-1">
                <p className="font-semibold text-xl text-neutral-600">Room Dashboard Sign In</p>
                <p className="text-center text-sm">Have your reservation approved? Sign in to get the full experience at Innavance!</p>
            </div>
            <div className="flex flex-col gap-3">
                {/* room dropdown selection */}
                <fieldset className="relative w-full h-14 border border-neutral-600 rounded-xl flex items-center px-2 ">
                    <legend className="px-2">Room</legend>
                    <select
                        className="focus:outline-0 w-full h-full bg-transparent cursor-pointer text-base -translate-y-0.5"
                        value={selectedRoom ?? ""}
                        onChange={(e) => setSelectedRoom(Number(e.target.value))}
                    >
                        <option value="" disabled className="text-neutral-400">Select a room</option>
                        {roomList?.data.map((room) => (
                            <option key={room.id} value={room.id} className="py-2 text-base bg-white hover:bg-neutral-100">
                                {room.name}
                            </option>
                        ))}
                    </select>
                </fieldset>
                {/* account ID input */}
                <fieldset className="relative w-full h-14 border border-neutral-600 rounded-xl flex items-center px-2 ">
                    <legend className="px-2">Account ID</legend>
                    <input 
                        className="focus:outline-0 w-full h-full bg-transparent -translate-y-0.5" 
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                    />
                </fieldset>
            </div>
            <motion.button 
                whileHover={{ scale: 0.98 }}
                whileTap={{ scale: 0.96 }}
                disabled={!selectedRoom || !accountId}
                onClick={handleSignIn}
                className="w-full bg-green-500 hover:bg-green-400 py-3 rounded-xl font-semibold text-white mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
                Sign In
            </motion.button>            
        </motion.div>
    )

    return (
        <section className="bg-neutral-100 flex justify-center items-center w-screen min-h-screen flex-col gap-5 overflow-hidden">
            <motion.nav 
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 1 }}
                className="w-screen absolute top-0"
            >
                <img src="/logo.svg" className="h-16 px-4 pt-3" />
            </motion.nav>

            <motion.div 
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30, mass: 2 }}
                className="px-5 py-4 rounded-lg bg-white shadow flex justify-center items-center mx-10"
            >
                <AnimatePresence mode="popLayout">
                    {FETCH_ROOM_UI}
                    {ERROR_UI}
                    {SIGNING_IN_UI}
                    {LOGIN_ERROR_UI}
                    {MAIN_UI}
                </AnimatePresence>
            </motion.div>

            <footer className="absolute bottom-0 w-full bg-neutral-600 flex justify-around py-3 text-white underline text-sm font-light">
                <a>Admin contact</a>
                <a>Room rules</a>
                <a>Another notice</a>
            </footer>
        </section>
    )
}