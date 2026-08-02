import makeWASocket, { useMultiFileAuthState, type WAVersion } from 'baileys'
import P from 'pino'
import NodeCache from 'node-cache'
import { fetchLatestWaWebVersion } from 'baileys'

// Baileys built-in simple auth save & load
const { state, saveCreds } = await useMultiFileAuthState('auth_info')

// group cache for cachedGroupMetadata
const groupCache = new NodeCache({ stdTTL: 3600 })

export class Socket {
    socket: ReturnType<typeof makeWASocket>

    // automatically create a Baileys WhatsApp socket
    constructor(version: WAVersion) {
        this.socket = makeWASocket({
            version: version,       
            auth: state,                                    // grab the auth_info if exist
            logger: P({                                     // logger
                level: "error",                             // logger level
                transport: {                                  
                    target: 'pino-pretty',                  // logger prettier
                    options: {
                        colorize: true,
                        translateTime: "SYS:standard",
                        ignore: "hostname,pid"
                    }
                },
            }),
            browser: ['Windows', 'Chrome', '11.0.0'],                   // emulate real browser
            markOnlineOnConnect: false,                                 // don't mark online when connected
            cachedGroupMetadata: async (jid) => groupCache.get(jid),    // cache every group participant so it doesnt constantly ask to whatsapp to avoid ban
            shouldSyncHistoryMessage: () => false                       // don't sync history or message for performance
        })

        this.socket.ev.on('creds.update', saveCreds)                    // whatsapp rotate auth every so often, this will save the auth when so
    }

    getSocket() {               // function to give the socket                  
        return this.socket
    }

    getUserId() {               // aditional function to grab the user LID
        const lid = this.socket.user?.lid
        if (!lid) console.error("lid is not found, make sure to get the lid only after the app has fully started!")
        return this.socket.user?.lid || ""
    }
}

