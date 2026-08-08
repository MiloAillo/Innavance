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
        if (!phone_number || !message) return res.status(400).json({ message: "phone_number and message must be specified." })

        try {
            // build a parameter for Baileys sendMessage
            const targetJID = formatToJid(phone_number ?? "")
            const body = {
                text: message ?? ""
            }

            // add timeout to sendMessage
            const sendPromise = socket.getSocket().sendMessage(targetJID, body)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('WhatsApp send timeout')), 8000)
            )

            await Promise.race([sendPromise, timeoutPromise])

            return res.status(200).json({
                message: "Message has been sent."
            })
        } catch (error) {
            console.error('WhatsApp send error:', error)
            return res.status(500).json({
                message: "Failed to send message",
                error: error.message
            })
        }
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