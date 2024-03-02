import {
    DateFormat,
    DateParser,
    DateParserSequence,
    DateParserBuilder
} from './types'

import { dateParserRegex, dateFormatRegex } from './constant'


export function dateFormatParser(dateFormat: string, utc?: boolean): DateParser {
	const sequence: DateParserSequence = [ null ]
	const regex = new RegExp(dateFormat.split(dateFormatRegex)
					 .filter((part) => part.length > 0)
					 .map((part) => {
						 const parser = dateParserRegex[part]
						 sequence.push(parser ? dateParserFunction[part] : null)
						 return '(' + (parser || part.replace(/([^a-zA-Z0-9\s])/g, '\\$1')) + ')'
				 	 })
					 .join(''))

	return (dateString: string): Date => {
		// First use the generated regex to test the date string
		if (! regex.test(dateString))
			throw new TypeError('cannot parse date')

		// Split into matched parts and generate a date object
		const match = dateString.match(regex)
		const date = new Date(0)
		sequence.forEach((part, index) => {
			if (part != null)
				part(date, match[index], utc)
		})
		delete date['__hh']
		delete date['__HH']
		return date
	}
}

const ampmParser = (am: string, pm: string): DateParserBuilder => {
	return (date, match, utc) => {
		if (date['__hh'] != null) return
		const hour = date['__HH']
		if (hour == null || typeof hour !== 'number') return
		if (match == am && hour == 12)
			(utc ? date.setUTCHours : date.setHours).call(date, 0);
		if (match == pm && hour < 12)
			(utc ? date.setUTCHours : date.setHours).call(date, hour + 12)
	}
}

const hourParser = (flag: string): DateParserBuilder => {
	return (date, match, utc) => {
		const hour = parseInt(match);
		(utc ? date.setUTCHours : date.setHours).call(date, hour);
		date[flag] = hour
	}
}

const monthParser: DateParserBuilder = (date, match, utc) => (utc ? date.setUTCMonth : date.setMonth).call(date, parseInt(match) - 1)
const dateParser: DateParserBuilder = (date, match, utc) => (utc ? date.setUTCDate : date.setDate).call(date, parseInt(match))
const yearParser: DateParserBuilder = (date, match, utc) => (utc ? date.setUTCFullYear : date.setFullYear).call(date, parseInt(match) + (match.length == 2 ? 2000 : 0))

const dateParserFunction: Record<DateFormat, DateParserBuilder> = {
	'M': monthParser,
	'MM': monthParser,
	'D': dateParser,
	'DD': dateParser,
	'YY': yearParser,
	'YYYY': yearParser,
	'TT': ampmParser('AM', 'PM'),
	'tt': ampmParser('am', 'pm'),
	// Set date with flag to note that there is an absolute or AM/PM hour set
	'h': hourParser('__hh'),
	'hh': hourParser('__hh'),
	'HH': hourParser('__HH'),
	'mm': (date, match, utc) => (utc ? date.setUTCMinutes : date.setMinutes).call(date, parseInt(match)),
	'ss': (date, match, utc) => (utc ? date.setUTCSeconds : date.setSeconds).call(date, parseInt(match)),
	'Month': (date, match, utc) => (utc ? date.setUTCMonth : date.setMonth).call(date, MonthName.indexOf(match)),
	'Date': (date, match, utc) => (utc ? date.setUTCDate : date.setDate).call(date, parseInt(match.replace(/[^0-9]/g, ''))),
	'Year': yearParser,
	// Cannot use day of week to set date in any meaningful way
	'Day': () => {},
}
