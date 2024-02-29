import http from 'http'

import { 
    Request, Response, Route,
    Socket, TcpSocket, WebSocket
} from '.'

import {
    WebsocketMessage
} from './types'

// TODO: view one or more CSV files from a web interface
// - websocket for streaming rows, filter, sorting, state
export class Server {

    port: number = 5000
    alive: boolean = false

    router: Route
    socket: Map<string, Socket> = new Map()

    constructor() {
        this.router = new Route({})
    }

    /**
	 * Start a local server for this router.
	 *
	 * @param router
	 * @returns
	 */
	async start(): Promise<this> {
		// The app router should handle all errors and always produce a response,
		// so just adds one error handler to the top-level Promise to ensure
		// a response is always sent to every incoming request
		const server = http.createServer((req, res) => {

			// Handle CORS requests
			if (req.method != null && req.method.toLowerCase() === 'options') {
				// TODO: read CORS settings from object if provied
				res.writeHead(200, {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Headers': '*',
					'Access-Control-Allow-Methods': 'GET, PUT, POST, PATCH, DELETE, OPTIONS',
					'Access-Control-Allow-Credentials': 'true'
					// TODO -Allow-Credentials
				}).end()
				return
			}

			// Log the native http incoming request
			// TODO

			// Create a Router and Response object for serving the HTTP response. The
			// Router is populated with details of the incoming request, along with
			// any authentication and details of the incoming request.
			const response = new Response().forHTTP(req, res)

			// Request has to be generated asynchronously since there may be a body that
			// needs to be read in chunks from the socket
			Request.fromHTTP(req).then((request) => {
				response.setRequest(request)
				return this.router.handle(request, response)
			})
			.then((result) => {
				// this.onResult(result)
				return response.toHTTP()	// Ensure response was sent
			})
			// Internal server error, router should have handled all errors
			.catch((error) => {
				// this.onRequestError(error)
			   	return response.httpError(500, error)
			})

		})

		// Initial socket mapping to TCP socket
		server.on('connect', (_, socket) => {
			const tcp = new TcpSocket(this, socket)
			this.addSocket(tcp)
		})

		// Upgrade request to WebSocket
		server.on('upgrade', (request, socket) => {
			const ws = new WebSocket(this, request, socket)
			ws.start().then(() => {
				this.addSocket(ws)
				this.routeWebsocketConnect(ws)
			})
		})

		// Listen on the configured port and maintain active socket mapping
		server.listen(this.port, () => {
			this.onStart()
		})

		// Listen to shutdown signals and close the socket
		process.on('SIGTERM', () => this.stop())
        process.on('SIGINT', () => this.stop())

		return this
	}

    /**
	 * @func 	{routeRequest}
	 * @desc 	Route the incoming request to a route handler
	 */
	async routeRequest(request: Request, response: Response): Promise<any> {
		// Check all available routes and prevent infinite recursion if this router
		// re-handles the request by ensuring each route handler can only handle the
		// request one time
		for (const route of this.methods(Route))
			if (route.canHandle(request)) {
				try {
					return await route.handle(request, response)
				}
				// Send a 500 internal server error if the route handler failed
				catch (error) {
					console.log('error', error)
					return this.routeError(request, response, 500, error)
				}
			}

		// Create a 404 error if no matching route found
		await this.routeError(request, response, 404)
	}

    private async routeError(request: Request, response: Response, status: number, error?: any) {
		// for (const route of this.methods(Route))
		// 	if (route.canHandleError(request, status, error)) {
		// 		try {
		// 			return await route.handleError(router, request, response, error, status)
		// 		}
		// 		catch (error) {}
		// 	}

		throw new Error('no error handler')
	}

    /**
	 * @func 	{addSocket}
	 * @desc 	Adds a socket to the mapping of managed sockets with the given random ID.
	 */
	private addSocket(socket: Socket) {
		this.socket.set(socket.getId(), socket)
	}

	/**
	 * @func 	{removeSocket}
	 * @desc 	Remove the given socket from the server mapping.
	 */
	removeSocket(socket: Socket) {
		this.socket.delete(socket.getId())
	}

    /**
	 * @func 	{routeWebsocket}
	 * @desc 	Route the incoming websocket message to any route listener
	 */
	async routeWebsocket(message: WebsocketMessage) {
		return message
	}

    async routeWebsocketConnect(socket: WebSocket) {
		// TODO: add to socket map
		// TODO: display logging
	}

	async routeWebsocketDisconnect(socket: WebSocket) {
		// TODO: remove from socket map
		// TODO: display logging
	}

    private onStart() {
        this.alive = true
    }

    stop() {

    }

    private onIncoming() {

    }

}