interface ServerError {
	status: number
	message?: string
	toString?: () => string
}

function error(status: number, message?: string): ServerError {
	const e: ServerError = { status, message }
	if (status === 400)
		e.toString = function() {
			return 'HTTP/1.1 400 Bad Request'
		}
	return e
}

export const ResourceNotFound = error(404)

export const InvalidRequest = error(401)
export const InvalidRoute = error(404, 'Route not found')
export const RouteError = error(500, 'The route threw an unhandled error')
export const InvalidRouter = error(500, 'Router configuration')
export const InvalidServer = error(500, 'Server configuration')
export const InvalidParameter = error(404, 'Invalid parameter')
export const RouterConfiguration = error(500)

export const WebsocketHandshake = error(401)
export const InvalidWebsocketMessage = error(500)

export const UnsupportedWebsocketMessage = error(500)
