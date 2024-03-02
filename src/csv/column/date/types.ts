
export type DateParser = (dateString: string) => Date
export type DateParserBuilder = (date: Date, match: string, utc?: boolean) => any
export type DateParserSequence = Array<DateParserBuilder | null>

export type DateFormatter = (date: Date) => string
export type DateFormatFunction = (date: Date, utc?: boolean) => string | number

export type DateFormat = 'MM' | 'DD' | 'YY' | 'YYYY' |
  			  	  		 'HH' | 'h' | 'hh' | 'mm' | 'ss' |
				  		 'M' | 'Month' | 'D' | 'Day' | 'Date' | 'Year' | 'TT' | 'tt'
