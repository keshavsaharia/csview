import http from 'http'

import { Request, Redirect } from '..'
import { ProxyResponse } from '../lambda'
import { RequestHeaders } from '../types'

import { createCookie } from './cookie'
import { CookieOption } from '../types'

export class Response {
	private request: Request
	private req?: http.IncomingMessage
	private res?: http.ServerResponse
	private lambda?: boolean
	private header: RequestHeaders = {}
	private sent: boolean = false

	body?: string
	statusCode: number = 200
	redirectUrl?: string

	constructor(request?: Request) {
		this.request = request

		this.header = {}
		// this.setHeader('Connection', 'close')
	}

	setRequest(request: Request) {
		this.request = request
		return this
	}

	forHTTP(req: http.IncomingMessage, res: http.ServerResponse): this {
		this.req = req
		this.res = res
		return this
	}

	async toHTTP(): Promise<this> {
		if (! this.sent && this.res) {
			this.sent = true

			return new Promise((resolve) => {
				// If a redirect was specified
				if (this.redirectUrl != null)
					this.res.writeHead(this.statusCode, {
						'Location': this.redirectUrl
					})
				// Otherwise produce the response body
				else {
					this.res.writeHead(this.statusCode, {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Headers': '*',
						'Access-Control-Allow-Methods': '*',
						'Access-Control-Allow-Credentials': 'true',
						...this.header
					})

					if (Buffer.isBuffer(this.body) || typeof this.body === 'string')
						this.res.write(this.body)
				}

				// Resolve after response fully sent
				this.res.end(() => {
					resolve(this)
				})
			})
		}
		return this
	}

	forLambda(): ProxyResponse {
		return {
			statusCode: this.statusCode,
			body: this.body || '',
			isBase64Encoded: false,
			cookies: [],
			headers: {}
		}
	}

	write(result: any): this {
		this.body = result.toString()
		return this
    }

	cookieFunction() {
		return (key: string, value: string, option?: CookieOption) => {
			this.setCookie(key, value, option)
		}
	}

	/**
	 * Sets response cookie headers
	 * @param key
	 * @param value
	 * @returns
	 */
	setCookie(key: string, value: string, option?: CookieOption) {
		this.setHeader('set-cookie', createCookie(key, value, option))
		return this
	}

	setHeader(header: string, value: string): this {
		this.header[header] = value
		return this
	}

	setContentType(contentType: string): this {
		this.header['content-type'] = contentType
		return this
	}

	headerFunction() {
		return (key: string, value: string) => {
			this.setHeader(key, value)
		}
	}

	redirect(url: string) {
		this.statusCode = 301
		this.redirectUrl = url
		return this
	}

	setRedirect(redirect: Redirect) {
		this.statusCode = redirect.getStatus()
		this.redirectUrl = redirect.getUrl()
		return this
	}

	redirectFunction() {
		return (url: string, status?: 301 | 302 | 303 | 304 | 307) => {
			return new Redirect(url, status)
		}
	}

	status(code: number): this {
		this.statusCode = code
        return this
    }

	/**
	 * @func 	{httpError}
	 * @desc  	Called on a Response instance if a Router instance had an unhandled internal error
	 */
	httpError(status: number = 500, error?: any): this {
		if (! this.sent && this.res) {
			this.sent = true
			// Safely try to write the error status
			try {
				this.res.writeHead(status)
				if (error)
					this.res.write(error.toString())
				this.res.end()
			}
			catch (error) {}
		}
		return this
	}

	/**
	 * @func 	{lambdaError}
	 * @desc 	For producing internal errors that are reported to AWS Lambda, if there was an
	 * 			unhandled error in a Router instance that caused the response to not be properly
	 * 			handled.
	 */
	static lambdaError(status: number = 500, error?: any): ProxyResponse {
		return {
			statusCode: status,
			body: error ? error.toString() : '',
			isBase64Encoded: false
		}
	}

	// proxy(): ProxyResponse {
	// 	return {
	// 		statusCode: this.statusCode,
	// 		body: this.body,
	// 		cookies: [],
	// 		headers: {},
	// 		isBase64Encoded: false
	// 	}
	// }
}
