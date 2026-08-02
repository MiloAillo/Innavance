import { fetchLatestWaWebVersion } from "baileys"
import { Socket } from "../socket/socket"
import { connectionUpdate } from "./connection-update"

export const Connect = async () => {
    // fetch the latest whatsapp version
    const { version } = await fetchLatestWaWebVersion()
    
    // create Baileys whatsapp socket
    const socket = new Socket(version)

    // create connectionUpdate socket event to handle missing auth or recconection
    connectionUpdate(socket)

    // give the socket to whoever execute this function
    return socket
}