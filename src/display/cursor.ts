import {
	ESCAPE_START, SEMICOLON,
	CURSOR_HOME, CURSOR_VISIBLE, CURSOR_INVISIBLE
} from './constant'

export function moveCursor(x: number, y: number): Buffer {
	return Buffer.concat([
		ESCAPE_START,
		Buffer.from((y + 1).toString(), 'utf16le'),
		SEMICOLON,
		Buffer.from((x + 1).toString(), 'utf16le'),
		Buffer.from([72, 0])
	])
}

function cursorOperation(value: number, id: number): Buffer {
	return Buffer.concat([
		ESCAPE_START,
		Buffer.from(value.toString(), 'utf16le'),
		Buffer.from([id, 0])
	])
}

// moves cursor up/down/right/left
export const cursorUp = (lines: number = 1) => cursorOperation(lines, 65) // A
export const cursorDown = (lines: number = 1) => cursorOperation(lines, 66) // B
export const cursorRight = (columns: number = 1) => cursorOperation(columns, 67) // C
export const cursorLeft = (columns: number = 1) => cursorOperation(columns, 68) // D

// moves cursor to beginning of next/previous line
export const cursorNextLine = (lines: number = 1) => cursorOperation(lines, 69) // E
export const cursorPreviousLine = (lines: number = 1) => cursorOperation(lines, 70) // F

// moves cursor to beginning of next line, # lines down
export const cursorToColumn = (column: number) => cursorOperation(column, 71) // G
export const cursorToOrigin = () => CURSOR_HOME

export const showCursor = () => CURSOR_VISIBLE
export const hideCursor = () => CURSOR_INVISIBLE

/**
 * Get cursor position
 */
export async function cursorPosition(): Promise<{ x: number, y: number }> {
	return new Promise((resolve: (cursor: { x: number, y: number }) => any, reject) => {
		process.stdin.once('readable', () => {
			const buffer = process.stdin.read()
			process.stdin.setRawMode(false)
			if (! Buffer.isBuffer(buffer))
				reject(new Error('Invalid input response for getting cursor position'))

			// Receive an escape sequence with the cursor position
			if (buffer.readUint8(0) == 0x1b && buffer.readUint8(1) == 0x5b) {
				// Get the string position
				const pos = buffer.slice(2, buffer.length - 1).toString('utf8')
				const semicolon = pos.indexOf(';')
				if (semicolon < 0)
					reject(new Error('Invalid position "' + pos.toString() + '"'))

				// Parse position from string, where row;col -> y;x
				const x = parseInt(pos.substring(semicolon + 1)) - 1
				const y = parseInt(pos.substring(0, semicolon)) - 1
				if (isNaN(x) || isNaN(y))
					reject(new Error('Invalid position "' + pos.toString() + '"'))

				resolve({ x, y })
			}
			// TODO: reject error cases
			else reject(buffer)
		})

		process.stdout.setEncoding('utf16le')
		process.stdin.setRawMode(true)
		process.stdout.write(Buffer.from([0, 0x1b, 0, 0x5b, 0, 0x36, 0, 0x6e ]), 'utf16le')
	})
}

/**
 * Wait for a key press
 */
export async function getKeyPress(): Promise<string> {
	return new Promise((resolve: (key: string) => any) => {
		process.stdin.setRawMode(true)
		process.stdin.resume()
		process.stdin.setEncoding('utf8')

		process.stdin.once('data', (key: string) => {
			process.stdin.setRawMode(false)
			if (key === '\u0003')
				process.exit()
			resolve(key)
		})
	})
}

console.log('hello world' + cursorNextLine(2) + 'abcdefg')
