class _wrapped_socket {
    constructor (socket) {
        this.socket = socket
    }

    on (action, fun) {
        this.socket.on(action, fun)
    }

    send_message (message_data) {
        const message_str = JSON.stringify(message_data)

        this.socket.send(message_str)
    }

    send_ok () {
        const message_str = JSON.stringify({
            status: 'ok'
        })

        this.socket.send(message_str)
    }

    send_error(error_type) {
        const message_str = JSON.stringify(error_type.serialize())

        this.socket.send(message_str)
    }
}

export const wrapped_socket = _wrapped_socket