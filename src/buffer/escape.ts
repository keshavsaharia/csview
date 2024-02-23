import {
	ESCAPE_UTF8,
	ESCAPE_UTF16,
	SEMICOLON,
	END_CURSOR_MOVE
} from './constant'

export function escapeMoveCursor(x: number, y: number) {
	process.stdout.write(Buffer.from('\u001b[' + (y + 1) + ';' + (x + 1) + 'f', 'utf16le'))
	// process.stdout.write(ESCAPE_UTF16, 'utf16le')
	// process.stdout.write(Buffer.from((y + 1).toString(), 'utf16le'), 'utf16le')
	// process.stdout.write(SEMICOLON, 'utf16le')
	// process.stdout.write(Buffer.from((x + 1).toString(), 'utf16le'), 'utf16le')
	// process.stdout.write(END_CURSOR_MOVE, 'utf16le')
}

export function escapeStartBytes(utf16: boolean = true) {
	return utf16 ? ESCAPE_UTF16 : ESCAPE_UTF8
}

export function cursorEscapeBytes(x: number, y: number, utf16: boolean = true) {
	const escape = escapeStartBytes(utf16)

	return escape
}

export function cursorEscape(x: number, y: number, utf16: boolean = true) {
	return cursorEscapeBytes(x, y, utf16)
}

// Simple function for calculating numeric string lengths for x, y positions, where
// expectation is normally position will be within a terminal screen (< 1000)
function numberLength(n: number): number {
	if (n < 10) return 1
	else if (n < 100) return 2
	else if (n < 1000) return 3
	else return 3 + numberLength(Math.floor(n / 1000))
}
