import http from 'http'
import url from 'url'
import { parse as parseQuery } from 'querystring'

import {
	RequestParam,
	RequestQuery,
	RequestHeaders,
	Data
} from '../types'

import { ProxyRequest } from '../lambda'
import { BODY_METHODS } from '../constant'
import { InvalidRequest } from '../error'

/**
 * @class 		Request
 * @desc 		Represents an incoming HTTP request
 */
export class Request {
	method: string
	url: string
	query: RequestQuery
	param?: RequestParam
    body?: string
	data?: { [key: string]: any }

	// Set for HTTP requests
	header: RequestHeaders

	// Routing values
	private token: Array<string>

    /**
	 * Convert an incoming native HTTP request to a Request instance.
	 *
	 * @param req
	 * @returns
	 */
	static async fromHTTP(req: http.IncomingMessage): Promise<Request> {
		if (! req.method || ! req.url)
			throw InvalidRequest

        // Build request object with headers
        const request = new Request(req.method.toLowerCase(), req.url)

        // Parse headers
		Object.keys(req.headers).forEach((key) => {
			const value = req.headers[key]
			request.setHeader(key, Array.isArray(value) ? value[0] : value)
		})

		// Parse request body into data property
		if (BODY_METHODS.has(request.method))
            request.setBody(await Request.readBody(req))
		return request
	}
    
    

	/**
	 * @func 	{fromLambda}
	 * @desc 	Build a request from AWS Lambda
	 */
	static fromLambda({
        requestContext, headers, rawPath,
        queryStringParameters,
        isBase64Encoded, body
    }: ProxyRequest): Request {
		const request = new Request(
            requestContext.http.method.toLowerCase(), rawPath, queryStringParameters)
		request.setHeaders(headers)

		// Parse body
		if (isBase64Encoded)
			request.setBody(Buffer.from(body || '', 'base64').toString('utf8'))
        else if (body)
            request.setBody(body)

		return request
	}


	/**
	 * @constructor
	 * @desc 		At a minimum, an HTTP request requires a method and URL. The `query` parameter
	 * 				represents query-string parameters that are usually parsed by the networking layer
	 * 				(e.g. AWS) or by a networking library (i.e. url.parse for the native node server).
	 * 				The optional final `Data` type parameter is for post/patch/put requests, and may
	 * 				be loaded asynchronously in the fromHTTP constructor or parsed by Lambda from a string.
	 */
	constructor(method: string, url: string, query?: RequestQuery) {
		this.method = method
        if (query) {
            this.url = url
		    this.query = query
        }
        else {
            const target = new URL(url)
            this.url = target.pathname
            this.query = {}
		    for (const [key, value] of target.searchParams)
			    this.query[key] = value
        }
        this.header = {}

		this.token = this.url.split('/').filter((p) => p.length > 0)
	}

    /**
     * Set the request body
     * @param body 
     */
    setBody(body: string) {
        this.body = body

        const contentType = this.header['content-type']
        if (body.length > 0 && contentType) {
            try {
                switch (contentType) {
                case 'application/json': 
                    this.data = JSON.parse(body); break
                case 'application/x-www-form-urlencoded': 
                    this.data = parseQuery(body); break
                }
            }
            catch (e) {}
        }
    }

    static async readBody(req: http.IncomingMessage): Promise<string> {
        return new Promise((resolve: (body: string) => any) => {
            const chunks: string[] = []
            req.on('data', (chunk) => {
                chunks.push(chunk)
            })
            req.on('end', () => {
                resolve(chunks.join(''))
            })
        })
    }

	hasParam(paramName: string): boolean {
		return this.param != null && this.param[paramName] != null && this.param[paramName].length > 0
	}

	getParam(paramName: string): string {
		return this.param ? this.param[paramName] : undefined
	}

	/**
	 * Match a wildcard route
	 * @param route
	 * @returns
	 */
	rootMatch(route: Array<string>) {
		return this.token.length == 0 && (route.length == 0 || route[0] == '*')
	}

	prefixMatch(route: Array<string>) {
		if (this.rootMatch(route))
			return true
		// Route too specific for the routing tokens remaining in this request
		if (this.token.length < route.length)
			return false
		// Iterate over route components
		for (let i = 0 ; i < route.length ; i++) {
			if (route[i] == '*')
				continue
			else if (route[i].startsWith(':')) {
				const param = route[i].substring(1)
				// TODO: check if regexp on this parameter
			}
			else if (route[i] != this.token[i])
				return false
		}
		return true
	}

	exactMatch(route: Array<string>): boolean {
		if (this.rootMatch(route))
			return true
		// Route too short or specific
		if (route.length != this.token.length)
			return false
		// Iterate over route components
		for (let i = 0 ; i < route.length ; i++) {
			if (route[i] == '*')
				continue
			if (route[i].startsWith(':')) {
				const param = route[i].substring(1)
				// TODO: check if param valid/regex on this parameter
			}
			else if (route[i] != this.token[i])
				return false
		}
		return true
	}

	setHeaders(header: RequestHeaders) {
		this.header = header
		return this
	}

    setHeader(key: string, value: string) {
        this.header[key] = value
        return this
    }

	hasScope(scope: Set<string>) {
		// TODO: check request auth
		return true
	}

	hasContentType(contentType: Set<string>) {
		// TODO: check headers
		return true
	}

	
    
}
