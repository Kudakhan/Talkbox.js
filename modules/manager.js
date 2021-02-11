import { User, UserError } from './user.js'
import { Endpoint, EndpointError } from './endpoint.js'

export class SessionError extends Error {
    constructor (type, ...params) {
        super(...params)

        if (Error.captureStackTrace)
            Error.captureStackTrace(this, SessionError)

        this.name = 'SessionError'
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

export class SessionManager {
    constructor (http, logger) {
        this.http = http
        this.log = logger
        this.users = new Map()
        this.endpoints = new Map()
    }

    addEndpoint (endpoint) {
        try {
            const end = new Endpoint(endpoint)

            if (this.endpoints.has(endpoint))
                throw new EndpointError(
                    'already-exists',
                    `Could not create endpoint '${endpoint}' because it already exists`
                )
        
            this.endpoints.set(endpoint, end)
        } catch (e) {
            // pass it up
            throw e
        }
    }

    removeEndpoint (endpoint) {
        if (this.endpoints.has(endpoint)) {
            this.endpoints.delete(endpoint)
            return
        }

        throw new EndpointError(
            'no-exists',
            `Could not remove endpoint '${endpoint}' because it does not exist`
        )
    }

    collectEndpoints () {
        this.endpoints.forEach((val, key) => {
            if (val.subscribers.length === 0)
                this.endpoints.delete(key)
        })
    }

    getUsername (socket) {
        let username = null

        this.users.forEach((val, key) => {
            if (val.socket === socket)
                username = val.username
        })

        return username
    }

    addUser (socket) {
        const user = new User(socket, this.users)

        if (!this.users.has(user.username)) {
            this.log.info(`Created new user: ${user.username}`)
            this.users.set(user.username, user)
        } else {
            this.log.info(`Found existing user: ${user.username}`)
        }

        return user.username
    }

    removeUser (username) {
        if (this.users.has(username)) {
            this.users.delete(username)
            this.log.info(`Removed user: ${username}`)
            return
        }

        throw new UserError(
            'no-exist', 
            `user '${username}' does not exist.`
        )
    }

    removeSocket (socket) {
        const username = this.getUsername(socket)

        if (username) {
            this.log.info(`Found user for socket: ${username}`)
            this.removeUser(username)
        } else {
            this.log.info(`Could not find user for socket`)
            throw new SessionError(
                'no-user',
                'Could not find a username associated with the socket'
            )
        }
    }
}
