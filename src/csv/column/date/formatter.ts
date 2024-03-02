import {
	DateFormatter,
	DateFormatFunction
} from './types'

import {
	dateFormatFunction,
    dateFormatRegex
} from './constant'

export function dateFormatter(dateFormat: string, utc?: boolean): DateFormatter {
	const format: Array<string | DateFormatFunction> = dateFormat.split(dateFormatRegex)
					 .filter((part) => part.length > 0)
					 .map((part) => dateFormatFunction[part] || part)

	return (date: Date) => {
		return format.map((formatPart) => ((typeof formatPart === 'function') ? formatPart(date, utc) : formatPart)).join('')
	}
}

