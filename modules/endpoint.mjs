import { socket_error } from './error.mjs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const axios = require('axios')

class _wiki_endpoint {
    constructor (endpoint_str) {
        if (!this.valid_format_p(endpoint_str)) {
            return {
                ok: false,
                data: new socket_error('invalid-format')
            }
        }

        const endpoint_uri = this.atom_to_uri(endpoint_str)
        this.endpoint = endpoint_str
        this.uri = endpoint_uri
        this.subscribers = []
    }

    subscribe (socket) {
        if (this.subscribed_to_p(socket)) {
            return {
                ok: false,
                data: new socket_error('already-subscribed')
            }
        } else {
            this.subscribers.push(socket)
            
            return {
                ok: true
            }
        }
    }

    unsubscribe (socket) {
        if (this.subscribed_to_p(socket)) {
            const index_of = this.subscribers.indexOf(socket)
            this.subscribers.splice(index_of, 1)

            return {
                ok: true
            }
        } else {
            return {
                ok: false,
                data: new socket_error('not-subscribed')
            }
        }
    }

    async validate () {
        const query = 'action=query&meta=siteinfo&siprop=variables&format=json'
        const url = `${this.uri}/api.php?${query}`

        try {
            const resp = await axios.get(url)

            if (this.query_data_p(resp)) {
                return true
            } else {
                return false
            }
        } catch (e) {
            return false
        }
    }

    atom_to_uri (endpoint_str) {
        const chunks = endpoint_str.split('-')
        const lang = chunks[0]
        const wiki = chunks.slice(1).join('-')

        return `https://${wiki}.fandom.com/${lang}`
    }

    query_data_p (resp) {
        const has_data = Object.keys(resp).includes('data')

        if (has_data) {
            const has_query = Object.keys(resp.data).includes('query')

            if (has_query) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    subscribed_to_p (socket) {
        return this.subscribers.includes(socket)
    }

    valid_format_p (endpoint_str) {
        return !!endpoint_str.match(/[a-z]{2,3}-.*/)
    }
}

export const wiki_endpoint = _wiki_endpoint