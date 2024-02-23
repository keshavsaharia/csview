
export type AnyObject = { [key: string]: any }

export function isObject(obj: any): obj is { [key: string]: any } {
	return obj != null && typeof obj === 'object' && obj.constructor === Object
}

export function isString(str: any): str is string {
	return str != null && typeof str === 'string'
}
