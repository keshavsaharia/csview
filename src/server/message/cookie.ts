import crypto from 'crypto'

import { Cookie, CookieOption } from '../types'

import {
	SIGNED_PREFIX,
	defaultCookieOption
} from '../constant'

export function parseCookie(cookieString: string, secret?: string): Cookie {
	const cookie: Cookie = {}

	cookieString.split(/;\s*/).forEach((keyValue) => {
		const equal = keyValue.indexOf('=')
		if (equal < 0) return

		// Get key and value (without quotation marks if quoted)
		const key = keyValue.substring(0, equal).trim()
		let value = keyValue.substring(equal).trim()
		if (value.startsWith('"') && value.endsWith('"'))
			value = value.substring(1, value.length - 1)

		if (key.startsWith(SIGNED_PREFIX) && secret != null)
			value = parseSignedCookie(value, secret)

		// Prevent duplicate assignments of cookie key
		if (cookie[key] == null)
			cookie[key] = value
	})

	return cookie
}

/**
 * Parse a signed cookie string, return the decoded value.
 *
 * @param {String} str signed cookie string
 * @param {string|array} secret
 * @return {String} decoded value
 * @public
 */

export function parseSignedCookie(cookie: string, secret: string): string | null {
	const value = cookie.slice(0, cookie.lastIndexOf('.'))
	if (! value.startsWith(SIGNED_PREFIX))
		return value

    const mac = signCookie(value, secret)

    if (sha1(mac) == sha1(value))
		return value

	return null
}


export function createSignedCookie(key: string, value: string, secret: string, option?: Partial<CookieOption>): string {
	return signCookie(createCookie(key, value, {
		...option,
		secure: true
	}), secret)
}


/**
 * @func    createCookie
 * @desc	Serialize a cookie key-value pair to a string
 */
export function createCookie(key: string, value: string, cookieOption?: Partial<CookieOption>): string {
	const option: CookieOption = {
		maxAge: 31536000000,	// 1 year in ms
		path: '/',				// default path
		secure: true,			// default secure
		...cookieOption
	}

	const cookie: Array<string | number> = []
	if (option.secure)
		cookie.push(SIGNED_PREFIX)
	cookie.push(key, '=', encodeURIComponent(value))

	const expires = Date.now() + option.maxAge
	cookie.push('; Max-Age=', Math.floor(option.maxAge / 1000))

	if (option.domain)
		cookie.push('; Domain=', option.domain)
	cookie.push('; Path=', option.path)
	cookie.push('; Expires=', option.expires || new Date(expires).toUTCString())

	// Flags if setting a cookie
	if (option.maxAge > 0) {
		if (option.httpOnly)
			cookie.push('; HttpOnly')
		if (option.secure)
			cookie.push('; Secure')
		if (option.sameSite)
			cookie.push('; SameSite=', option.sameSite)
	}

	return cookie.join('')
}


export function clearCookie(key: string, option?: Partial<CookieOption>) {
	return createCookie(key, '', {
		...option,
		maxAge: 0,
		expires: 'Thu, 01 Jan 1970 00:00:00 GMT'
	})
}

export function signCookie(cookie: string, secret: string) {
	return cookie + '.' + sha256(cookie, secret)
}

function sha1(value: string) {
  return crypto.createHash('sha1')
  			   .update(value)
			   .digest('hex')
}

function sha256(value: string, key: string) {
  return crypto.createHmac('sha256', key)
  			   .update(value)
  			   .digest('base64')
			   .replace(/\=+$/, '')
}
