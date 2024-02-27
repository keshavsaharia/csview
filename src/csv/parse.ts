
import { ParseOption, ParsedLine } from './types'

export function parseLine(input: string, start: number = 0, {
	delimiter = ',',
	quote = '"',
	newLine = '\n',
	doubleQuote = true,
	escape = false
}: ParseOption = {
	delimiter: ',',
	newLine: '\n',
	doubleQuote: true,
	escape: false
}): ParsedLine {

	const column: Array<string> = []
	let end = start
	// Keep iterating until newline or end of input string
	while (end < input.length && input.charAt(end) != newLine) {

		// Quotation enclosed item
		if (start == end && input.charAt(start) == quote) {
			end = ++start

			// Keep consuming characters until an end quote (allows newlines and any other characters within string)
			while (input.charAt(end) != quote && end < input.length) {
				// If escaping \" is allowed, adds 2 to the end index
				if (escape && input.charAt(end) == '\\' && input.charAt(end + 1) == '"')
					end++
				end++
				// If escaping double quotes "" is allowed, skip 2 characters
				if (doubleQuote && input.charAt(end) == '"' && input.charAt(end + 1) == '"')
					end += 2
			}

			// Get value and convert escaped quotation marks
			let value = input.substring(start, end)
			if (escape)
				value = value.replace(/\\\"/g, '"')
			if (doubleQuote)
				value = value.replace(/\"\"/g, '"')
			column.push(value)

			// Consume quotation mark and possible delimiter, and continue from next character
			if (input.charAt(end + 1) == delimiter)
				end++
			start = ++end
		}

		// If at a delimiter for an unescaped string
		else if (input.charAt(end) == delimiter) {
			column.push(input.substring(start, end))
			start = ++end
		}
		// Otherwise push the end index forward
		else end++
	}
	// If there is a final column
	if (start < end) {
		column.push(input.substring(start, end))
	}
	// Consume newline character
	if (input.charAt(end) == newLine)
		end++

	return {
		column,
		end
	}
}
