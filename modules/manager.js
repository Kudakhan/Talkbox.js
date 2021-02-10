import { User, UserError } from './user.js'
import { Endpoint, EndpointError } from './endpoint.js'

export class SessionManager {
    constructor () {
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

    addUser (socket) {
        const user = new User(socket, this.users.keys())
        this.users.set(user.username, user)

        return user.username
    }

    removeUser (username) {
        if (this.users.has(username)) {
            this.users.delete(username)
        }

        throw new UserError(
            'no-exist', 
            `user '${username}' does not exist.`
        )
    }

    removeSocket (socket) {
        this.users.forEach((val, key) => {
            if (val.socket === socket)
                this.user.delete(key)
        })
    }
}