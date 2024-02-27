import fs from 'fs'

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
