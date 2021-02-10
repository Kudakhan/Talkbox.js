export class UserError extends Error {
    constructor(type, ...params) {
        super(...params)

        if (Error.captureStackTrace)
            Error.captureStackTrace(this, UserError)
        
        this.name = 'UserError'
        this.type = type
        this.date = new Date()
        this.xport = JSON.stringify({
            status: 'error',
            error: {
                type: type,
                message: this.message
            }
        })
    }
}

export class User {
    constructor (socket, registeredNames) {
        this.socket = socket
        this.username = this._genUsername(registeredNames)
    }

    send (data) {
        if (typeof data === 'string') {
            this.socket.send(data)
            return
        }

        throw new UserError(
            'bad-data',
            `Tried to send ${typeof data} when string was expected`
        )
    }

    _genUsername (registeredNames) {
        const username = Math.random()
            .toString(36)
            .substring(8)
        
        if (registeredNames.includes(username))
            return this._genUsername(registeredNames)
        
        return username
    }
}