import fs from 'fs'

export type ColumnType = 'string' | 'number' | 'boolean' | 'string-array' | 'number-array'
export interface ColumnOptionMap extends Record<ColumnType, ColumnOption> {
    'string': StringOption
    'boolean': BooleanOption
}

function foo<T extends ColumnType>(x: T): ColumnOptionMap[T] {
    return {}
}

export interface ColumnOption {
    edit?: boolean
    display_width?: number
}

export interface StringOption extends ColumnOption {
    max_length?: number
}

export interface StringArrayOption extends ColumnOption {
    max_length?: number
}

export interface NumberOption extends ColumnOption {
    min?: number
    max?: number
}

export interface NumberArrayOption extends ColumnOption {
    max_length?: number
}

export interface DateOption extends ColumnOption {
    /**
     * Format that date is stored in
     */
    format?: string

    utc?: boolean
    
    /**
     * Format that date should be displayed in as text
     */
    display?: string
}

export interface BooleanOption extends ColumnOption {
    true_value?: any
    false_value?: any

    // Display values for true and false
    display_true?: any
    display_false?: any
}

export interface GeoPositionOption extends ColumnOption {

}

export const csvParseOption: ParseOption = {
	delimiter: ',',
	newLine: '\n',
	doubleQuote: true,
	escape: false
}

export interface ParseOption {
	delimiter?: string		// delimiter between columns
	newLine?: string		// line delimiter
	quote?: string			// quotation mark for enclosing column value
	doubleQuote?: boolean 	// double quote ("") is escaped value for single quotation mark
	escape?: boolean 		// allow \" for escaping quote
}

export interface ReadOption extends ParseOption {
	header?: Array<string> | boolean
	encoding?: BufferEncoding
}

export type ReadCallback = (line: Array<string>, header: Array<string>, stream: fs.ReadStream) => any

export interface ParsedLine {
	column: Array<string>
	end: number
}
