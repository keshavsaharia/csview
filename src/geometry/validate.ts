import {
	Display,
	Size
} from '.'

export function within(value: number, limit: number, end?: number): number {
	if (end == null)
		return Math.max(0, Math.min(value, limit))
	return Math.max(limit, Math.min(value, end))
}

export function isSize(size: any): size is Size {
	return size != null && typeof size === 'object' &&
		   isNumber(size.width) && isNumber(size.height)
}

export function isString(str: any): str is string {
	return str != null && typeof str === 'string'
}

export function isNumber(n: any): n is number {
	return n != null && typeof n === 'number'
}

export function isObject(obj: any): obj is { [key: string]: any } {
	return obj != null && typeof obj === 'object' && !Array.isArray(obj)
}
