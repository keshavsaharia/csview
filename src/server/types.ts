import { Request, Response } from '.'

export type RequestData = { [key: string]: any }
export type RequestParam = { [key: string]: string }
export type RequestQuery = { [key: string]: string | undefined }
export type RequestHeaders = { [key: string]: string }
export type Cookie = { [key: string]: string }
export type Data = { [key: string]: any }

export type RequestHandler = (request: Request, response: Response) => any

export interface ServerOption {
	name?: string
	port?: number
}

export interface RouterOption {
	name?: string

	// Directory for resources and associated modules
	dirname?: string
	level?: number 				// Default 2 (levels up to root)

	// Enable directory or default for server modules
	cdn?: boolean | string			// Whether to use /cdn or specified directory for static resources
	template?: boolean | string 	// Template directory

	// Auth scope required
    scope?: string[]

	// CORS configuration
	cors?: boolean | CorsOption
}

export type RouteMethod = 'get' | 'post' | 'patch' | 'put' | 'delete' | 'all'
export const RouteMethods: RouteMethod[] = [ 'get', 'post', 'patch', 'put', 'delete', 'all' ]

export type RequestKey = 'url' | 'query' | 'header' | 'data'
export const RequestKeys: RequestKey[] = ['url', 'query', 'header', 'data']

export type ResponseKey = 'header' | 'cookie'
export const ResponseKeys: ResponseKey[] = ['header', 'cookie']

export interface WebsocketMessage<Body extends Data = Data> {
	// Message identifier and body payload
	message?: string
	body?: Body

	// State flags
	connect?: boolean
	disconnect?: boolean

	// Whether the request came from API gateway or a local socket
	socket?: string
	gateway?: string
}

export interface CorsOption {
	origin?: string[]
	method?: string[]
	header?: string[]
	credential?: boolean
}

export interface RouteOption {
	scope?: string | Array<string>
	contentType?: string | Array<string>
}

// export interface RouteHandler extends RouteOption {
// 	handler: (request: Request) => any
// }

export interface ErrorOption {
	scope?: string | Array<string>
	status?: number | Array<number>
}

export interface CookieOption {
	expires?: string 	// set specific expiration string
	maxAge: number
	domain?: string
	path: string
	secure: boolean
	httpOnly?: boolean
	sameSite?: 'Strict' | 'Lax' | 'None'
}
