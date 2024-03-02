import { DateFormat, DateFormatFunction } from './types'

export const ShortMonthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const MonthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export const ShortDayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const zeroPad = (num: number) => (num < 10 ? ('0' + num) : num)
export const dateFormatFunction: Record<DateFormat, DateFormatFunction> = {
	'M': (date, utc) => ((utc ? date.getUTCMonth : date.getMonth).call(date) + 1),
	'MM': (date, utc) => zeroPad((utc ? date.getUTCMonth : date.getMonth).call(date) + 1),
	'D': (date, utc) => (utc ? date.getUTCDate : date.getDate).call(date),
	'DD': (date, utc) => zeroPad((utc ? date.getUTCDate : date.getDate).call(date)),
	'YY': (date, utc) => (utc ? date.getUTCFullYear : date.getFullYear).call(date).toString().substring(2),
	'YYYY': (date, utc) => (utc ? date.getUTCFullYear : date.getFullYear).call(date),
	'HH': (date, utc) => {
		const hour = (utc ? date.getUTCHours : date.getHours).call(date)
		return (hour == 0) ? 12 : (hour <= 12 ? hour : (hour - 12))
	},
	'TT': (date, utc) => (((utc ? date.getUTCHours : date.getHours).call(date) < 12) ? 'AM' : 'PM'),
	'tt': (date, utc) => (((utc ? date.getUTCHours : date.getHours).call(date) < 12) ? 'am' : 'pm'),
	'h': (date, utc) => (utc ? date.getUTCHours : date.getHours).call(date),
	'hh': (date, utc) => zeroPad((utc ? date.getUTCHours : date.getHours).call(date)),
	'mm': (date, utc) => zeroPad((utc ? date.getUTCMinutes : date.getMinutes).call(date)),
	'ss': (date, utc) => zeroPad((utc ? date.getUTCSeconds : date.getSeconds).call(date)),
	// 'M': (date, utc) => ShortMonthName[(utc ? date.getUTCMonth : date.getMonth).call(date)],
	'Month': (date, utc) => MonthName[(utc ? date.getUTCMonth : date.getMonth).call(date)],
	// 'D': (date, utc) => ShortDayName[(utc ? date.getUTCDay : date.getDay).call(date)],
	'Day': (date, utc) => DayName[(utc ? date.getUTCDay : date.getDay).call(date)],
	'Date': (date, utc) => {
		const d = (utc ? date.getUTCDate : date.getDate).call(date)
		if (d % 10 == 1 && d != 11)
			return d + 'st'
		if (d % 10 == 2 && d != 12)
			return d + 'nd'
		if (d % 10 == 3 && d != 13)
			return d + 'rd'
		return d + 'th'
	},
	'Year': (date, utc) => (utc ? date.getUTCFullYear : date.getFullYear).call(date)
}

export const dateFormatRegex = /(MM|DD|YYYY|YY|HH|hh|mm|ss|TT|tt|Month|Day|Date|Year|D|M|h)/g

export const dateParserRegex: Record<DateFormat, string> = {
	'M': '0?[0-9]|1[012]',
	'MM': '[01][0-9]',
	'D': '0?[1-9]|[1-2][0-9]|3[01]',
	'DD': '0[1-9]|[1-2][0-9]|3[01]',
	'YY': '\\d\\d',
	'YYYY': '\\d\\d\\d\\d',
	'HH': '0?[0-9]|1[0-2]',
	'h': '0?[0-9]|1[0-9]|2[0-3]',
	'hh': '[01][0-9]|2[0-3]',
	'mm': '[0-6]\\d',
	'ss': '[0-6]\\d',
	'TT': 'AM|PM',
	'tt': 'am|pm',
	// 'M': 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec',
	'Month': 'January|February|March|April|May|June|July|August|September|October|November|December',
	// 'D': 'Sun|Mon|Tue|Wed|Thu|Fri|Sat',
	'Day': 'Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday',
	'Date': '[23]?1st|2?2nd|2?3rd|[4-9]th|1[0-9]th|2[4-9]th|30th',
	'Year': '\\d\\d\\d\\d'
}
