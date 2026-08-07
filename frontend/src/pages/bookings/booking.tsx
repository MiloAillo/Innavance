import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import type { JSX } from "react/jsx-runtime";
import { getRoomDetail } from "../../API/bookings/rooms-api";
import type { RoomDetail } from "../../types/room-detail.type";
import { Check, Coins, Loader2Icon, User, WalletCards } from "lucide-react";
import { AddonCounter } from "../../components/addon-counter";

export function Bookings(): JSX.Element {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // temporary
    const imageURL = "/image1.webp"
    const image = new Image()
    image.src = "/image1.webp"
    
    // UI STATE
    const [state, setState] = useState<'FETCH_ROOM' | 'NO_ROOM' | 'ROOM_OVERVIEW' | 'ROOM_RESERVATION' | 'ROOM_PAYMENT' | 'PAYMENT_LOADING' | 'BOOKING_SUCCESS' | 'BOOKING_FAILED'>("FETCH_ROOM")
    // room data from GET /bookings/:id
    const [roomData, setRoomData] = useState<RoomDetail>()
    // stay duration counter
    const [duration, setDuration] = useState(1)
    const [addonCounts, setAddonCounts] = useState<{ [key: number]: number }>({})
    const [fullName, setFullName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [transition, setTransition] = useState(100)

    const calculateTotalPrice = () => {
        if (!roomData) return 0
        
        let total = roomData.price * duration
        
        roomData.addons.forEach((addon) => {
            const count = addonCounts[addon.id] || 0
            total += addon.price * count
        })
        
        return total
    }
    
    // get the dynamic param url
    const room_id = useParams().id
    
    // image simulation
    let time = 0
    
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight

        const ctx = canvas.getContext("2d") 
        if (!ctx) return

        function drawRotatedImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number, degrees: number) {
            // 1. Convert degrees to radians
            const radians = degrees * Math.PI / 180;

            // 2. Save the unrotated canvas state
            ctx.save();

            // 3. Move origin to the target center point of the image
            ctx.translate(x + width / 2, y + height / 2);

            // 4. Rotate the canvas grid
            ctx.rotate(radians);

            // 5. Draw image centered on the new (0, 0) origin
            ctx.drawImage(image, -width / 2, -height / 2, width, height);

            // 6. Restore the canvas to its original orientation
            ctx.restore();
        }

        let animationFrameId: number

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (state === "PAYMENT_LOADING" && transition > 0) {
                setTransition(prev => Math.max(0, prev - 0.80))
            }
            if (state === "BOOKING_SUCCESS" && transition < 100) {
                setTransition(prev => Math.min(100, prev + 0.50))
            }
            ctx.globalAlpha = Math.max(0, Math.min(1, transition / 100))
            
            ctx.filter = "blur(100px)"

            const scaledWidth = canvas.width * 1.25
            const scaledHeight = (image.height / image.width) * scaledWidth

            // third image
            drawRotatedImage(ctx, image, 0 - canvas.width / 1.5, 0 - canvas.height / 1.5, scaledWidth, scaledHeight, 0 + time)

            drawRotatedImage(ctx, image, -200, -100, scaledWidth, scaledHeight, 0 + time)

            drawRotatedImage(ctx, image, 200, -100, scaledWidth, scaledHeight, 0 + time)

            time += 0.1
            animationFrameId = requestAnimationFrame(render)
        }

        render()

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
        
    }, [state, transition])

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

        // temp
        if (state === "PAYMENT_LOADING") setTimeout(() => setState("BOOKING_SUCCESS"), 3000)
    }, [state])

    const FETCH_ROOM_UI = state === "FETCH_ROOM" &&
    (
        <>
            <p>fetching room</p>
        </>
    )

    const IMAGE_CARD = (
        <>
            <img src={imageURL} className="overflow-hidden flex-1 object-cover rounded-t-xl md:rounded-t-none md:rounded-l-xl"/>
        </>
    )

    const FIRST_CARD = (
        <>
            <div className="flex-1 flex flex-col justify-between gap-3 p-5">
                <div className="flex flex-col gap-3">
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
                </div>

                {/* price */}
                {state === "ROOM_OVERVIEW" && <div className="flex flex-col gap-3">
                    <div className="self-end">
                        <p className="text-right text-sm">Price start from</p>
                        <p className="font-bold text-xl text-right">Rp.{roomData?.price.toLocaleString("ID")}<span className="font-normal text-base">/day</span></p>
                    </div>
                    <button onClick={() => setState("ROOM_RESERVATION")} disabled={!roomData?.isAvailable} className={`font-semibold text-white py-2 rounded-md tracking-wide transition-all ${roomData?.isAvailable ? "bg-green-400 hover:bg-green-500 hover:scale-98" : "bg-red-400/50 hover:bg-red-500/50"}`}>Reserve Room</button>
                </div>}
            </div>
        </>
    )

    const THIRD_CARD = (
        <>
            <div className="flex-1 flex flex-col gap-3 p-5">
                {/* Full Name Input */}
                <fieldset className="relative w-full h-14 border border-neutral-600 rounded-xl flex items-center px-2 ">
                    <legend className="px-2">Full Name</legend>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="focus:outline-0 w-full h-full bg-transparent" />
                </fieldset>

                {/* Phone Number Input */}
                <fieldset className="relative w-full h-14 border border-neutral-600 rounded-xl flex items-center px-2">
                    <legend className="px-2">Phone Number</legend>
                    <input 
                        type="tel" 
                        value={phoneNumber} 
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            setPhoneNumber(value)
                        }} 
                        className="focus:outline-0 w-full h-full bg-transparent" 
                    />
                </fieldset>

                {/* Duration Counter */}
                <div className="flex flex-col gap-2">
                    <p>Stay Duration</p>
                    <div className="flex flex-col md:flex-row gap-5 items-center">
                        <div>
                            <div className="flex flex-row items-center gap-2">
                                <div onClick={() => setDuration(Math.max(1, duration - 1))} className="w-8 h-8 rounded-full bg-neutral-800 text-xl flex justify-center items-center text-white cursor-pointer hover:bg-neutral-700">{"-"}</div>
                                <div className="min-w-14 h-14 px-2 rounded-full border border-neutral-800 text-2xl pb-0.5 flex justify-center items-center text-neutral-800 bg-neutral-50/50">{duration}</div>
                                <div onClick={() => setDuration(duration + 1)} className="w-8 h-8 rounded-full bg-neutral-800 text-xl flex justify-center items-center text-white pb-0.5 cursor-pointer hover:bg-neutral-700">{"+"}</div>
                            </div>
                        </div>
                        <div className="h-fit grid grid-cols-3 gap-2 w-fit">
                            <div onClick={() => setDuration(duration + 7)} className="h-7 w-20 border text-neutral-800 border-neutral-500 bg-neutral-50/50 px-2 rounded-sm text-center flex items-center justify-center cursor-pointer hover:bg-neutral-100">
                                <p className="text-sm">+1 Week</p>
                            </div>
                            <div onClick={() => setDuration(duration + 30)} className="h-7 w-20 border text-neutral-800 border-neutral-500 bg-neutral-50/50 px-2 rounded-sm text-center flex items-center justify-center cursor-pointer hover:bg-neutral-100">
                                <p className="text-sm">+1 Month</p>
                            </div>
                            <div onClick={() => setDuration(duration + 365)} className="h-7 w-20 border text-neutral-800 border-neutral-500 bg-neutral-50/50 px-2 rounded-sm text-center flex items-center justify-center cursor-pointer hover:bg-neutral-100">
                                <p className="text-sm">+1 Year</p>
                            </div>
                            <div onClick={() => setDuration(Math.max(1, duration - 7))} className="h-7 w-20 border text-neutral-800 border-neutral-500 bg-neutral-50/50 px-2 rounded-sm text-center flex items-center justify-center cursor-pointer hover:bg-neutral-100">
                                <p className="text-sm">-1 Week</p>
                            </div>
                            <div onClick={() => setDuration(Math.max(1, duration - 30))} className="h-7 w-20 border text-neutral-800 border-neutral-500 bg-neutral-50/50 px-2 rounded-sm text-center flex items-center justify-center cursor-pointer hover:bg-neutral-100">
                                <p className="text-sm">-1 Month</p>
                            </div>
                            <div onClick={() => setDuration(Math.max(1, duration - 365))} className="h-7 w-20 border text-neutral-800 border-neutral-500 bg-neutral-50/50 px-2 rounded-sm text-center flex items-center justify-center cursor-pointer hover:bg-neutral-100">
                                <p className="text-sm">-1 Year</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* addons */}
                <div className="flex flex-col gap-2">
                    <p>Extra Addons</p>
                    <div className="grid grid-cols-2 gap-1 ">
                        {roomData?.addons.map((data) => (
                            <AddonCounter 
                                key={data.id}
                                id={data.id}
                                name={data.addon} 
                                maximum={data.borrowMaximum} 
                                price={data.price}
                                onCountChange={(id, count) => setAddonCounts({...addonCounts, [id]: count})}
                            />
                        ))}
                    </div>
                </div>

                {/* total price and agreement */}
                <div className="flex flex-col gap-3 pt-5">
                    <div className="flex flex-row justify-between items-center gap-8">
                        <div className="">
                            <p className="text-base">Final price</p>
                            <p className="font-bold text-xl">Rp.{calculateTotalPrice().toLocaleString("ID")}<span className="font-normal text-base"></span></p>
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={agreedToTerms} 
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <span className="text-sm">I agree to the terms and conditions</span>
                            </label>
                            <button 
                                onClick={() => setState("ROOM_PAYMENT")} 
                                disabled={!roomData?.isAvailable || !fullName || !phoneNumber || !agreedToTerms}
                                className={`font-semibold text-white py-2 rounded-md tracking-wide transition-all ${
                                    roomData?.isAvailable && fullName && phoneNumber && agreedToTerms 
                                        ? "bg-green-400 hover:bg-green-500 hover:scale-98" 
                                        : "bg-gray-400 cursor-not-allowed"
                                } ${state === "ROOM_RESERVATION" ? "block" : "hidden"}`}
                            >
                                Reserve Room
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

    const FOURTH_CARD = (
        <>
            <div className="flex-1 flex flex-col gap-6 p-5">
                <p className="font-semibold text-xl">{roomData?.name}</p>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="font-semibold text-base text-neutral-700 mb-2">Full Name</p>
                        <p className="text-base">{fullName}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-base text-neutral-700 mb-2">Phone Number</p>
                        <p className="text-base">{phoneNumber}</p>
                    </div>

                    <div>
                        <p className="font-semibold text-base text-neutral-700 mb-2">Booking Duration</p>
                        <p className="text-base">{duration} {duration === 1 ? 'day' : 'days'}</p>
                    </div>
                </div>

                {Object.keys(addonCounts).filter(id => addonCounts[Number(id)] > 0).length > 0 && (
                    <div>
                        <p className="font-semibold text-base text-neutral-700 mb-2">Extra Addons</p>
                        <div className="space-y-1 ml-2">
                            {roomData?.addons.map((addon) => {
                                const count = addonCounts[addon.id] ?? 0
                                if (count === 0) return null
                                return (
                                    <div key={addon.id} className="flex items-center gap-2">
                                        <p className="text-base text-neutral-700">{addon.addon}</p>
                                        <p className="text-base font-medium">×{count}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-6 border-t border-neutral-300">
                    <p className="text-sm text-neutral-600 mb-1">Final Price</p>
                    <p className="font-bold text-3xl">Rp.{calculateTotalPrice().toLocaleString("ID")}</p>
                </div>
            </div>
        </>
    )

    const FIFTH_CARD = (
        <>
            <div className="flex-1 flex flex-col gap-3 p-5">
                <p className="text-xl font-semibold text-center">Choose Payment Method</p>
                <div className="flex flex-col justify-between gap-10">
                    <div className="flex flex-col gap-3">
                        <div className="relative w-full h-20 bg-neutral-50/20 border border-neutral-800/50 rounded-xl flex justify-center items-center gap-2 opacity-50">
                            <WalletCards />
                            <p className="text-base font-semibold">Cards</p>
                            <p className="absolute bottom-1 left-2 font-light text-xs text-red-600">Unavailable</p>
                        </div>
                        <div className="relative w-full h-20 bg-neutral-50/20 border border-neutral-800/50 rounded-xl flex justify-center items-center gap-2 opacity-50">
                            <WalletCards />
                            <p className="text-base font-semibold">E-Money</p>
                            <p className="absolute bottom-1 left-2 font-light text-xs text-red-600">Unavailable</p>
                        </div>
                    </div>
                    <div onClick={() => setState("PAYMENT_LOADING")} className="relative w-full h-20 bg-neutral-50/20 border border-neutral-800/50 rounded-xl flex justify-center items-center gap-2 opacity-100 overflow-hidden hover:scale-102 transition-all">
                        <div className="absolute top-0 left-0 -translate-12 blur-3xl w-40 h-20 rounded-full bg-indigo-600 animate-pulse" />
                        <div className="absolute top-0 left-100 -translate-y-20 -translate-x-20 blur-3xl w-40 h-20 rounded-full bg-pink-600 animate-pulse" />
                        <div className="absolute blur-3xl translate-y-15 w-40 h-20 rounded-full bg-blue-300 animate-pulse" />
                        <Coins />
                        <p className="text-base font-semibold">Cash</p>
                    </div>
                </div>
            </div>
        </>
    )

    const PAYMENT_LOADING_UI = state === "PAYMENT_LOADING" &&
    (
        <>
            <div className="absolute text-neutral-50 flex justify-center items-center gap-3">
                <Loader2Icon className="animate-spin" />
                <p>Reserving the room...</p>
            </div>
        </>
    )

    const ROOM_OVERVIEW_UI = state === "ROOM_OVERVIEW" &&
    (
        <>
            {IMAGE_CARD}
            {FIRST_CARD}
        </>
    )

    const ROOM_RESERVATION_UI = state === "ROOM_RESERVATION" &&
    (
        <>
            {FIRST_CARD}
            {THIRD_CARD}
        </>
    )

    const ROOM_PAYMENT_UI = state === "ROOM_PAYMENT" && 
    (
        <>
            {FOURTH_CARD}
            {FIFTH_CARD}
        </>
    )

    const BOOKING_SUCCESS_UI = state === "BOOKING_SUCCESS" &&
    (
        <>
            <div className="flex flex-col items-center w-full py-8">
                <div>
                    <Check size={85} />
                </div>
                <div className="flex flex-col justify-center items-center gap-3">
                    <p className="font-semibold text-xl">Room Reserved</p>
                    <div className="text-center flex flex-col gap-8">
                        <p className="font-medium">Your booking has been sent to our staff and is waiting for approval</p>
                        <p>Go to <a className="text-blue-500 underline">approval page</a></p>
                    </div>

                </div>
            </div>
        </>
    )

    const BOOKING_FAILED_UI = state === "BOOKING_FAILED" &&
    (
        <>
            <div className="absolute z-10 text-neutral-50 flex flex-col justify-center items-center gap-2 bg-white/30 px-10 py-5 rounded-lg">
                <div>
                    <Check size={85} />
                </div>
                <div className="flex flex-col justify-center items-center gap-3">
                    <p className="font-semibold text-xl">Failed to Reserve</p>
                    <div className="text-center flex flex-col gap-8">
                        <p className="font-medium">Your booking can't be sent to our staff, try again in a moment</p>
                        <p>Retry</p>
                    </div>

                </div>
            </div>
        </>
    )

    return (
        <section className="font-[Inter] min-w-screen min-h-screen flex justify-center md:items-center bg-neutral-900">
            <canvas ref={canvasRef} className="fixed z-0 w-screen h-screen"></canvas>

            {/* middle card */}
            <div className={`relative z-1 h-fit flex flex-col md:flex-row bg-white/75 shadow-md rounded-xl w-[90%] md:w-[75%] my-10`}>
                {PAYMENT_LOADING_UI}
                {BOOKING_SUCCESS_UI}
                {FETCH_ROOM_UI}
                {ROOM_OVERVIEW_UI}
                {ROOM_RESERVATION_UI}
                {ROOM_PAYMENT_UI}
            </div>
        </section>
    )
}