import { socket_error } from './error.mjs'
import { wiki_endpoint } from './endpoint.mjs'

class _subscription_manager {
    constructor () {
        this.endpoints = []
    }

    async subscribe (socket, endpoint_str) {
        if (this.registered_endpoint_p(endpoint_str)) {
            const endpoint = this.get_endpoint(endpoint_str).data
            const {ok, data} = endpoint.subscribe(socket)

            if (ok) {
                return {
                    ok: ok
                }
            } else {
                return {
                    ok: ok,
                    data: data
                }
            }
        } else {
            const endpoint = new wiki_endpoint(endpoint_str)
            const valid = await endpoint.validate()

            if (valid) {
                endpoint.subscribe(socket)
                this.endpoints.push(endpoint)

                return {
                    ok: true
                }
            } else {
                return {
                    ok: false,
                    data: new socket_error('invalid-wiki')
                }
            }
        }
    }

    unsubscribe (socket, endpoint_str) {
        if (this.registered_endpoint_p(endpoint_str)) {
            const endpoint = this.get_endpoint(endpoint_str).data
            const {ok, data} = endpoint.unsubscribe(socket)

            if (ok) {
                this.clean_endpoints()

                return {
                    ok: ok
                }
            } else {
                return {
                    ok: ok,
                    data: data
                }
            }
        } else {
            return {
                ok: false,
                data: new socket_error('invalid-endpoint')
            }
        }
    }

    clean_endpoints () {
        let dead_endpoints = []

        this.endpoints.forEach((endpoint) => {
            if (this.zero_subscribers_p(endpoint)) {
                dead_endpoints.push(endpoint)
            }
        })

        this.endpoints = this.endpoints.filter((endpoint) => !dead_endpoints.includes(endpoint))
    }

    get_endpoint (endpoint_str) {
        const endpoints = this.endpoints.filter((endpoint) => endpoint.endpoint === endpoint_str)

        if (endpoints.length > 0) {
            return {
                ok: true,
                data: endpoints[0]
            }
        } else {
            return {
                ok: false
            }
        }
    }

    zero_subscribers_p (endpoint) {
        return endpoint.subscribers.length === 0
    }

    registered_endpoint_p (endpoint_str) {
        const {ok} = this.get_endpoint(endpoint_str)

        return ok
    }
}

export const subscription_manager = _subscription_manager