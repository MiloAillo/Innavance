import { isAxiosError } from "axios"
import { getDashboardData } from "../dashboard-api"

export const userDashboardLoader = async () => {
    const roomID = parseInt(localStorage.getItem("roomID") ?? "0")
    const accountID = localStorage.getItem("accountID") ?? "0"

    try {
        return await getDashboardData(roomID, accountID)
    } catch (err) {
        console.log(err)

        if (isAxiosError(err)) {
            if (err.status === 401) {
                localStorage.removeItem("roomID")
                localStorage.removeItem("accountID")
            }
        }

        window.location.href = "/login/user"
    }
}