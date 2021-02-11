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
    constructor (socket, registeredUsers) {
        if (this._userExists(socket, registeredUsers))
            return this._getUser(socket, registeredUsers)

        this.socket = socket
        this.username = this._genUsername(registeredUsers)
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

    _userExists (socket, registeredUsers) {
        let result = false

        registeredUsers.forEach((val, key) => {
            if (val.socket === socket)
                result = true
        })

        return result
    }

    _genUser (socket, registeredUsers) {
        let user = null

        registeredUsers.forEach((val, key) => {
            if (val.socket === socket)
                user = registeredUsers.get(key)
        })

        return user
    }

    _genUsername (registeredUsers) {
        const username = Math.random()
            .toString(36)
            .substring(8)
        
        if (Array.from(registeredUsers.keys()).includes(username))
            return this._genUsername(registeredUsers)
        
        return username
    }
}
