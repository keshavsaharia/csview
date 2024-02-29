import { Request, Response, Redirect } from '.'
import { 
    RouteMethod, RequestHandler, 
    RouteOption, ErrorOption
} from './types'

import { RouteError, InvalidRoute } from './error'

/**
 * @class 	Route
 * @desc 	A route handler
 */
export class Route {
    // HTTP method (if not set, all methods match)
    method?: RouteMethod
    // Path prefix (if not set, all child routes are checked)
    // Array of route parts, and a mapping of parameter names to index values
    path?: string
    route?: Array<string>

    // Parameter names and mapping to indexes
	param?: { [name: string]: number }

    // If this is a parent to multiple child routes, stores the hierarchy
    child?: Route[]

    handler?: RequestHandler
    
    // Options
	option?: RouteOption
	error?: ErrorOption	

	// Authentication scope and content type filtering
	scope?: Set<string>
	contentType?: Set<string>

    constructor(config: {
        method?: RouteMethod
        path?: string
        child?: Route[]
        handler?: RequestHandler
    } = {}) {
        this.method = config.method
        if (config.path != null)
            this.setPath(config.path)
        if (config.handler)
            this.setHandler(config.handler)
    }

    setHandler(handler: RequestHandler): this {
        this.handler = handler
        return this
    }

	/**
	 * @func 	setPath
	 * @desc 	Sets the URL path that this route should match.
	 */
	setPath(path: string) {
		// Set the path and tokenize into an array
		this.path = path
		this.route = path.split('/').filter((p) => p.length > 0)

		// Create mapping from named parameters to route index. For example, the path
		// /user/:user/comment/:comment would generate the parameter object signature
		// of { user: 1, comment: 3 }. Similarly a wildcard path like /:id would be
		// an object with { id: 0 }.
		if (this.route.some((p) => p.startsWith(':'))) {
			this.param = {}
            for (let index = 0 ; index < this.route.length ; index++) {
                const part = this.route[index]
                if (part.startsWith(':'))
					this.param[part.substring(1)] = index
            }
		}
		return this
	}

    /**
     * @func    canHandle
     * @param request 
     * @returns 
     */
	canHandle(request: Request) {
		return this.canHandleMethod(request) &&
			   this.canHandleScope(request) &&
			   this.canHandleContentType(request) &&
			   this.canHandlePath(request)
	}

	canHandleError(request: Request, status: number) {
		return this.canHandleErrorStatus(status) &&
			   this.canHandleMethod(request) &&
			   this.canHandleScope(request) &&
			   this.canHandleContentType(request)
	}

	/**
	 * @func 	handle
	 * @desc 	Assuming `canHandle` returned `true`, calls the associated route handler
	 * 			after producing all route parameters.
	 *
	 * @param router
	 * @param request
	 * @param response
	 * @returns
	 */
	async handle(request: Request, response: Response): Promise<any> {
		if (this.child) {
            for (const child of this.child) {
                if (child.canHandle(request)) {
                    try {
                        return await child.handle(request, response)
                    }
                    // Send a 500 internal server error if the route handler failed
                    catch (error) {
                        console.log('error', error)
                        return this.handleError(request, response, 500, error)
                    }
                }
            }
            return this.handleError(request, response, 404)
        }
        else if (this.handler) {
            // Write the result from the route handler
            let result = this.handler.call(this, request, response)
            if (result instanceof Promise)
                result = await result
            return this.writeResult(request, response, result)
        }
	}

    async handleRequest(request: Request, response: Response): Promise<any> {
        if (this.handler) {
            // Write the result from the route handler
            let result = this.handler.call(this, request, response)
            if (result instanceof Promise)
                result = await result
            return this.writeResult(request, response, result)
        }
        else throw RouteError
    }

    async handleError(request: Request, response: Response, status: number, error?: any) {
        // Pass error handling to child handler
        if (this.child) {
            for (const child of this.child) {
                if (child.canHandleError(request, status)) {
                    child.handleError(request, response, status, error)
                }
            }
        }
        // Default to this handler
    }

	private async writeResult(request: Request, response: Response, result: any) {
		// Pass result into response object
		if (result === null)
			response.setContentType('text/plain').write('null')
		else if (typeof result === 'string')
			response.setContentType('text/html').write(result)

		// Special built-in types
		else if (result instanceof Redirect)
			response.setRedirect(result)

		// Pass request to child router
		else if (result instanceof Route) {
            // TODO: take sub-array of route spec
            return result.handle(request, response)
        }
		// Stringify an object returned directly
		else if (typeof result === 'object')
			response.setContentType('application/json')
					.write(JSON.stringify(result))
		// Convert result object to string
		else response.setContentType('text/plain')
					 .write(result.toString())

		// Return result if not returning async handler
		return result
	}

	private canHandlePath(request: Request) {
		// If this is a catch-all route (i.e. no path specified)
		if (this.path == null)
			return true

        // If this is a router between a set of child routes
		return this.child ? request.prefixMatch(this.route) :
						    request.exactMatch(this.route)
	}

	/**
	 * @func 	canHandleMethod
	 * @desc 	Encapsulates the logic for testing whether a request HTTP method (GET, POST, PATCH, etc)
	 * 			matches this route's configured HTTP verb.
	 */
	private canHandleMethod(request: Request) {
		return this.method == null || this.method == 'all' || 	// 'all' and undefined imply route matches all HTTP verbs
			   request.method == this.method					// otherwise method must strict match request method, which is always lowercase
	}

	/**
	 * @func 	canHandleScope
	 * @desc 	If there are authentication scopes attached to this route, ensures the request matches the scope signature.
	 * 			If there are no auth scopes defined for this route, returns true, otherwise calls the request method to check for
	 * 			an overlap of the JWT `scope` array with this route.
	 */
	private canHandleScope(request: Request) {
		return this.scope == null || request.hasScope(this.scope)
	}

	/**
	 * @func 	canHandleContentType
	 * @desc 	Used to differentiate multiple routes by content-type, i.e. if a POST request is made with JSON data it is handled
	 * 			separately from if a request is made to the same endpoint with binary data.
	 */
	private canHandleContentType(request: Request) {
		return this.contentType == null || request.hasContentType(this.contentType)
	}

	/**
	 * @func 	canHandleErrorStatus
	 * @desc 	If this route is configured as an error handler, checks whether the given HTTP response status code matches the
	 * 			configured status code or code range for this route.
	 */
	private canHandleErrorStatus(status: number) {
		if (! this.error)
			return false
		if (Array.isArray(this.error.status))
			return this.error.status[0] <= status && status <= this.error.status[1]
		if (this.error.status != null)
			return status == this.error.status
		return false
	}

    /**
     * @func    setMethod
     * @desc    
     * 
     * @param   {RouteMethod} method 
     * @returns {this}
     */
	setMethod(method?: RouteMethod): this {
		this.method = method
		return this
	}

    /**
     * @func    setOption
     * @desc    Sets the option
     * 
     * @param   {RouteOption} option 
     * @returns 
     */
	setOption(option?: RouteOption): this {
		if (option)
			this.option = option
		return this
	}

    /**
     * @func    setErrorOption
     * @desc    Sets the error option
     * 
     * @param   {number | ErrorOption} option 
     * @returns {this}
     */
	setErrorOption(option?: number | ErrorOption): this {
		if (typeof option === 'number')
			this.error = { status: option }
		else if (option)
			this.error = option
		return this
	}

	tokenLength() {
		return this.route ? this.route.length : 0
	}

	getTokens() {
		return this.route || []
	}

	getToken(index: number) {
		return this.route ? this.route[index] : undefined
	}
}
