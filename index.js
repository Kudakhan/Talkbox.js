import { SessionError, SessionManager } from './modules/manager.js'
import { UserError } from './modules/user.js'
import { EndpointError } from './modules/endpoint.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const winston = require('winston')
const axios = require('axios')
const WebSocket = require('ws')

const Logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: 'talkbox' },
    transports: [
        new winston.transports.File({ filename: './log/error.log', level: 'error' }),
        new winston.transports.File({ filename: './log/combined.log' })
    ]
})
const Manager = new SessionManager(axios, Logger)
const Server = new WebSocket.Server({ port: 8080 })

;(async () => {
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

    Server.on('connection', (socket, req) => {
        try {
            Logger.info(`New connection from ${req.socket.remoteAddress}`)
            Manager.addUser(socket)

            // heartbeat status
            socket.isAlive = true

            socket.on('pong', () => { socket.isAlive = true })
            socket.on('close', () => {
                Logger.info(`Closed connection from ${req.socket.remoteAddress}`)
                Manager.removeSocket(socket)
                
                const users = Array.from(Manager.users.keys())
                Logger.info(JSON.stringify(users))
            })
        } catch (e) {
            if (e instanceof UserError)
                Logger.error(e.xport)
            else if (e instanceof EndpointError)
                Logger.error(e.xport)
            else if (e instanceof SessionError)
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
