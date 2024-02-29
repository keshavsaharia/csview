export const defaultCookieOption = {
	maxAge: 31536000000,	// 1 year in ms
	path: '/',
	secure: true
}

// Prefix on cookie key to indicate signed value
export const SIGNED_PREFIX = 's:'


export const METHODS = new Set<string>(['get', 'post', 'patch', 'put', 'delete', 'head', 'options'])
export const BODY_METHODS = new Set<string>(['post', 'patch', 'put'])

export const DEFAULT_PORT = 8000
export const DEFAULT_CDN_PORT = 8080
export const SERVER_CLOSE_TIMEOUT = 3000
export const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

export const SCOPE_SEP = ':'


export const MIME_TYPE: { [ext: string]: string } = {
    html: 'text/html',
    css: 'text/css',
    ico: 'image/x-icon',
    js: 'application/javascript',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    json: 'application/json',
    xml: 'application/xml',
  };