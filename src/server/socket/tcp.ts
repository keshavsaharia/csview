import * as stream from 'stream'

import { Server, Socket } from '..'

export class TcpSocket extends Socket {

	constructor(server: Server, socket: stream.Duplex) {
		super(server, socket)

		// Execute stop when the socket closes
		socket.on('close', () => {
			this.stop()
		})
	}

}
