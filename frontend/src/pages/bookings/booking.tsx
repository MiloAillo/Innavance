import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import type { JSX } from "react/jsx-runtime";
import { getRoomDetail } from "../../API/bookings/rooms-api";
import type { RoomDetail } from "../../types/room-detail.type";
import { User } from "lucide-react";

export function Bookings(): JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    
    // UI STATE
    const [state, setState] = useState<'FETCH_ROOM' | 'NO_ROOM' | 'ROOM_OVERVIEW' | 'ROOM_RESERVATION' | 'ROOM_PAYMENT' | 'BOOKING_SUCCESS' | 'BOOKING_FAILED'>("FETCH_ROOM")
    // room data from GET /bookings/:id
    const [roomData, setRoomData] = useState<RoomDetail>()

    // get the dynamic param url
    const room_id = useParams().id

    useEffect(() => {
        console.log(roomData)

        // if there is no room id in the url
        if (!room_id) {
            setState("NO_ROOM")
            return
        }

        // fetch the room detail
        if (state === "FETCH_ROOM") {
            getRoomDetail(room_id).then((data) => {
                setRoomData(data.data)
                setState("ROOM_OVERVIEW")
            }).catch(() => setState("NO_ROOM"))
        }
    }, [state])

    const FETCH_ROOM_UI = state === "FETCH_ROOM" &&
    (
        <>
            <p>fetching room</p>
        </>
    )

    const ROOM_OVERVIEW_UI = state === "ROOM_OVERVIEW" &&
    (
        <>
            {/* middle card */}
            <div className="w-[75%] h-fit flex flex-row bg-white shadow-md rounded-xl">
                {/* left section */}
                <img src="https://thesmartlocal.com/indonesia/wp-content/uploads/2021/04/kost-room.jpeg" className="flex-1 object-cover overflow-hidden rounded-l-xl"/>
                {/* right section */}
                <div className="flex-1 flex flex-col gap-3 p-5">
                    {/* title and small cards */}
                    <div className="flex flex-col gap-3">
                        <p className="font-semibold text-2xl">{roomData?.name}</p>
                        <div className="flex flex-row justify-between">
                            <div className="border border-neutral-700 text-white bg-neutral-700 px-2 py-1 rounded-sm flex flex-row gap-1 justify-center items-center">
                                <p className="font-medium text-sm">{roomData?.capacity} person max</p>
                            </div>
                            <div className={`border px-2 py-1 gap-1.5 rounded-sm flex flex-row justify-center items-center ${roomData?.isAvailable ? "border-green-500 text-green-600 bg-green-100" : "border-red-500 text-red-600 bg-red-100" }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${roomData?.isAvailable ? "bg-green-500" : "bg-red-500" }`}/>
                                <p className="font-medium text-sm">{roomData?.isAvailable ? "available" : "not available"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-neutral-400" />

                    {/* description */}
                    <p className="font-medium text-base">{roomData?.description}</p>

                    {/* room features */}
                    <div className="flex flex-col">
                        <p className="font-semibold text-base">Room Features</p>
                        <ul className="list-disc list-inside">
                            {roomData?.features.map((data) => (
                                <li>{data}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Rooms Addons */}
                    <div>
                        <p className="font-semibold text-base">Room Addons</p>
                        <div className="grid grid-cols-2 gap-2 p-1">
                            {roomData?.addons.map((data) => (
                                <div>
                                    <p className="">{data.addon}</p>
                                    <p>Rp.{data.price.toLocaleString("ID")}/each</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* price */}
                    <div className="self-end">
                        <p className="text-right text-sm">Price start from</p>
                        <p className="font-bold text-xl text-right">Rp.{roomData?.price.toLocaleString("ID")}<span className="font-normal text-base">/day</span></p>
                    </div>
                    <button disabled={!roomData?.isAvailable} className={`font-semibold text-white py-2 rounded-md tracking-wide transition-all ${roomData?.isAvailable ? "bg-green-400 hover:bg-green-500 hover:scale-98" : "bg-red-400/50 hover:bg-red-500/50"}`}>Reserve Room</button>
                </div>
            </div>
        </>
    )

    return (
        <section className="font-[Inter] min-w-screen min-h-screen flex justify-center items-center bg-gray-100">
            {FETCH_ROOM_UI}
            {ROOM_OVERVIEW_UI}
        </section>
    )
}