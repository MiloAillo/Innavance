import { Connect } from "./baileys/connection/connect";
import express from 'express'
import { formatToJid } from "./helper/format-to-jid";

// initialize whatsapp connection
Connect()
.then((socket) => {
    // create a lightweight server
    const app = express()

    // Built-in middleware to parse incoming JSON payloads
    app.use(express.json())

    // POST /send       =>      send message to the number specified
    app.post('/send', async (req, res) => {
        const phone_number: string | null = req.body.phone_number ?? null
        const message: string | null = req.body.message ?? null

        // throw 400 error if phone_number or message is not specified
        if (!phone_number || !message) res.status(400).json({ message: "phone_number and message must be specified." })

        // build a parameter for Baileys sendMessage
        const targetJID = formatToJid(phone_number ?? "")
        const body = {
            text: message ?? ""
        }

        await socket.getSocket().sendMessage(targetJID, body)

        return res.status(200).json({
            message: "Message has been sent."
        })
    })

    // open the server to a port speicified
    app.listen(3001, () => {
        console.log("whatsapp service is running in 3001")
    })
})
.catch(err => {
    console.error("Failed to connect:", err)
    process.exit(1)
})