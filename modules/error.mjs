const error_table = {
    'already-subscribed': 'Already subscribed to this endpoint.',
    'invalid-action': 'The action specified was not recognized.',
    'invalid-endpoint': 'Endpoint does not exist, cannot unsubscribe.',
    'invalid-format': 'Endpoint is not in a valid format.',
    'invalid-json': 'JSON data send was corrupt.',
    'invalid-wiki': 'The wiki you requested does not exist.',
    'no-from': 'Action did not specify a from parameter.',
    'no-to': 'Action did not specify a to parameter.',
    'not-subscribed': 'Not subscribed to endpoint, cannot unsubscribe.'
}

class _socket_error {
    constructor (error_type) {
        const error = this.lookup_error(error_type)
        this.error_type = error.type
        this.error_message = error.message
    }

    lookup_error (error_type) {
        const has_error = Object.keys(error_table).includes(error_type)

        if (has_error) {
            return {
                type: error_type,
                message: error_table[error_type]
            }
        }

        return {
            type: 'system-error',
            message: 'A system error has occurred.'
        }
    }

    serialize () {
        return {
            status: 'error',
            error: {
                type: this.error_type,
                message: this.error_message
            }
        }
    }
}

export const socket_error = _socket_error