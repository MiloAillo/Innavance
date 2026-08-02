import { Socket } from "../socket/socket"
import QRCode from 'qrcode'
import type { Boom } from "@hapi/boom"
import { DisconnectReason } from "baileys"
import { Connect } from "./connect"

export const connectionUpdate = (socket: Socket) => {
    socket.getSocket().ev.on('connection.update', async (update) => {
        const {connection, lastDisconnect, qr } = update

        // if qr exist (isn't logged in)
        if (qr) console.log(await QRCode.toString(qr, {type: 'terminal'}))

        // if connection close
        if (connection == "close") {
            const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                Connect().catch(err => {
                    console.error("Reconnection failed:", err)
                });
            } else {
                console.log("Logged out. Please delete your auth folder and re-scan.");
            }
        }

        // if connection open
        if (connection == "open") {
            console.log("WhatsApp connection is ready!")
        }
    })
}