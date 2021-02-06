import { wrapped_socket } from './modules/socket.mjs'
import { subscription_manager } from './modules/manager.mjs'
import { socket_error } from './modules/error.mjs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const WebSocket = require('ws')

const action_p = (data) => Object.keys(data).includes('action')
const to_p = (data) => Object.keys(data).includes('to')
const from_p = (data) => Object.keys(data).includes('from')

const handle_subscribe = async (socket, mdata, manager) => {
    if (to_p(mdata)) {
        let promises = []

        mdata.to.forEach((endpoint) => {
            promises.push(manager.subscribe(socket, endpoint))
        })

        let results = await Promise.all(promises)

        console.log(manager)

        results.forEach((result) => {
            const {ok, data} = result

            if (ok) {
                socket.send_ok()
            } else {
                socket.send_error(data)
            }
        })
    } else {
        const error = new socket_error('no-to')

        socket.send_error(error)
    }
}

const handle_unsubscribe = async (socket, mdata, manager) => {
    if (from_p(mdata)) {
        mdata.from.forEach((endpoint) => {
            const {ok, data} = manager.unsubscribe(socket, endpoint)

            console.log(manager)

            if (ok) {
                socket.send_ok()
            } else {
                socket.send_error(data)
            }
        })
    } else {
        const error = new socket_error('no-from')

        socket.send_error(error)
    }
}

const handle = async (socket, data, manager) => {
    if (action_p(data)) {
        switch (data.action) {
            case 'subscribe':
                handle_subscribe(socket, data, manager)
                break
            case 'unsubscribe':
                handle_unsubscribe(socket, data, manager)
                break
        }
    } else {
        const error = new socket_error('invalid-action')

        socket.send_error(error)
    }
}

(async () => {
    const sub_manager = new subscription_manager()
    const wss = new WebSocket.Server({
        port: 8080
    })

    wss.on('connection', (socket) => {
        const wrapped = new wrapped_socket(socket)

        wrapped.on('message', (message) => {
            try {
                const data = JSON.parse(message)

                handle(wrapped, data, sub_manager)
            } catch (e) {
                const error = new socket_error('invalid-json')

                wrapped.send_error(error)
            }
        })
    })
})()