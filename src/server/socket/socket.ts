import crypto from 'crypto'
import * as stream from 'stream'

import { Server } from '..'

export class Socket {
    private server: Server
	private id: string
	protected stopping: boolean = false
	protected stopped: boolean = false

	socket: stream.Duplex

	constructor(server: Server, socket: stream.Duplex) {
        this.server = server
        this.socket = socket

        // Generate a random ID for this socket
		this.id = crypto.randomBytes(16).toString('hex')
	}

	async stop(error?: any) {
		if (this.stopped || this.stopping)
			return true
		this.stopping = true

		if (error)
			console.log('stop socket error', error)
		// if (this.ended())
		// 	return true

		return new Promise((resolve: (stopped: boolean) => any, reject: (error: any) => any) => {
			this.socket.end(error ? error.toString() : undefined, () => {
				console.log('ended socket')
				this.destroy()
				if (error)
					reject(error)
				else
					resolve(true)
			})
		})
	}

	destroy() {
		if (! this.stopped) {
			console.log('destroy socket')
			this.stopped = true
			this.socket.destroy()
			// this.router.removeSocket(this)
		}
		return this
	}

	getId() {
		return this.id
	}

	ended(): boolean {
		return this.socket.readableEnded
	}

}
