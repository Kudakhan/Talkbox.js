export class EndpointError extends Error {
    constructor (type, ...params) {
        super(...params)

        if (Error.captureStackTrace)
            Error.captureStackTrace(this, EndpointError)

        this.name = 'EndpointError'
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

export class Endpoint {
    constructor (endpoint) {
        if (!this._validFormat(endpoint))
            throw new EndpointError(
                'no-create', 
                `Could not create endpoint with invalid syntax: '${endpoint}'`
            )

        const chunks = endpoint.split('-')

        this.endpoint = endpoint
        this.lang = chunks.slice(0, 1)
        this.wiki = chunks.slice(1).join('-')
        this.baseURL = `https://${this.wiki}.fandom.com/${this.lang}`
        this.apiURL = `${this.baseURL}/api.php`
        this.subscribers = new Set()
    }

    subscribe (user) {
        if (this.subscribers.has(user))
            throw new EndpointError(
                'already-subscribed',
                `Cannot subscribe to ${this.endpoint} more than once`
            )
        
        this.subscribers.add(user)
    }
    
    unsubscribe (user) {
        if (!this.subscribers.has(user))
            throw new EndpointError(
                'not-subscribed',
                `Cannot unsubscribed from ${this.endpoint} as you are not subscribed`
            )
        
        this.subscribers.delete(user)
    }

    _validFormat (endpoint) {
        return endpoint.match(/[a-z]{2,3}-.*/)
    }
}
