import fs from 'fs'
import { parseLine } from './parse'
import { ReadOption, ReadCallback } from './types'

export async function readStream(filePath: string, callback: ReadCallback, option: ReadOption = {}): Promise<number> {
	return new Promise((resolve: (count: number) => any, reject) => {
		let input = '', 	// input buffer
			start = 0, 		// index in the buffer
			lines = 0		// number of lines read

		// Optional header
		let header: Array<string> = Array.isArray(option.header) ? option.header : []

		const stream = fs.createReadStream(filePath, option.encoding)
		    .on('data', async (obj) => {
		        input += obj.toString()
				const end = input.lastIndexOf('\n')
				while (start < end) {
					const line = parseLine(input, start)
					// If first line, and header is not disabled
					if (lines == 0 && option.header !== false) {
						header = line.column
					}
					// Otherwise trigger callback with header and line
					else await callback(line.column, header, stream)

					lines++
					start = line.end
				}
				// Remove all consumed characters from the input buffer and reset start index
				input = input.substring(start)
				start = 0
			})
			.on('error', function(error) {
				// TODO: error handling
		        // console.log('error', error.message)
				reject(error)
		    })
		    .on('close', function() {
				// subtract 1 for header if not disabled
				resolve(lines - (option.header === false ? 0 : 1))
		    })
	})
}
