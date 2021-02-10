import { SessionManager } from './modules/manager.js'
import { User, UserError } from './modules/user.js'
import { EndpointError } from './modules/endpoint.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const winston = require('winston')
const axios = require('axios')
const WebSocket = require('ws')

const Logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'talkbox' },
    transports: [
        new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: './log/combined.log' })
    ]
})
const Manager = new SessionManager(axios, Logger)
const Server = new WebSocket.Server({ port: 8080 })

(async () => {
    const Heartbeat = setInterval(() => {
        Server.clients.forEach((socket) => {
            if (!socket.isAlive) {
                const username = Manager.getUsername(socket)
                Logger.error(`Heartbeat timeout for ${username}`)

                return socket.terminate()
            }

            socket.isAlive = false
            socket.ping(() => {})
        })
    }, 30000)

    Server.on('connection', (socket) => {
        try {
            Manager.addUser(socket)

            // heartbeat status
            socket.isAlive = true

            socket.on('pong', () => { socket.isAlive = true })
            socket.on('close', () => {
                Manager.removeSocket(socket)
            })
        } catch (e) {
            if (e instanceof UserError)
                Logger.error(e.xport)
            else if (e instanceof EndpointError)
                Logger.error(e.xport)
            else
                Logger.error(JSON.stringify({
                    type: e.type,
                    message: e.message
                }))
        }
    })

    Server.on('close', () => {
        Logger.error('Server shutdown')
    })
})()
