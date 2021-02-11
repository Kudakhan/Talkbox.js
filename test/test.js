/**
 * NOTE: this script is not part of a unit testing framework but exists to automate the testing
 * of some behavior. 
 */
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const WebSocket = require('ws')
const log = (msg) => console.log(msg)

const testconn = async (id) => {
    const ws = new WebSocket('ws://localhost:8080')

    ws.on('open', () => {
        const data = {
            action: 'subscribe',
            endpoints: [
                'en-community',
                'en-dev',
                'en-creepypasta'
            ]
        }

        ws.send(JSON.stringify(data))
    })

    ws.on('ping', () => ws.pong())
    ws.on('close', () => log(`${id}: closed connection to the socket.`))
    ws.on('error', () => log(`${id}: socket error encountered.`))
    ws.on('unexpected-response', () => log(`${id}: unexpected response received.`))

    setTimeout(() => ws.terminate(), (id * 10000))
}

for (let i = 0; i < 10; i++) {
    testconn(i)
}