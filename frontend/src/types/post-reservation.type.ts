export type AddonType = {
    id: number
    count: number
}

export type PostReservationType = {
    room_id: number | string
    full_name: string
    phone_number: string
    payment_method: string
    duration: number | string
    addons: AddonType[]
}