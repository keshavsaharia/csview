import {
	OutputColor,
	Point
} from '..'

const UTF16_EOL = Buffer.from([ 0x0a, 0x00 ])
const UTF8_EOL = Buffer.from([ 0x0a ])
const ESCAPE_UTF16 = new Uint8Array([ 0x1b, 0x00, 0x5b, 0x00 ])
const ESCAPE_UTF8 = new Uint8Array([ 0x1b, 0x5b ])

const ESCAPE_RESET = new Uint8Array([ 0x1b, 0x5b, 0x30, 0x6d ])
// const ESCAPE_RESET = new Uint8Array([ 0x1b, 0x5b, 0x33, 0x38, 0x3b, 0x35, 0x3b, 0x30, 0x6d ])
// const ESCAPE_RESET_256 = new Uint8Array([])

const SEMICOLON = new Uint8Array([ 0x3b ])
const ESCAPE_COLOR_RGB = new Uint8Array([ 0x1b, 0x5b, 0x33, 0x38, 0x3b, 0x32, 0x3b ])
const ESCAPE_COLOR_256 = new Uint8Array([ 0x1b, 0x5b, 0x33, 0x38, 0x3b, 0x35, 0x3b ])
const ESCAPE_BACKGROUND_RGB = new Uint8Array([ 0x1b, 0x5b, 0x34, 0x38, 0x3b, 0x32, 0x3b ])
const ESCAPE_COLOR_COMMAND = new Uint8Array([ 0x6d ])
const ESCAPE_CURSOR_COMMAND = new Uint8Array([ 0x66 ])

interface OutputOption {
	utf16: boolean
}

interface OutputColorState {
	color: number | null
	background: number | null
	bold?: boolean
	italic?: boolean
	underline?: boolean
}

export function outputLine(
	text: Buffer,			// output text buffer
	color: Buffer,			// output color buffer
	background: Buffer,		// output background
	style: Buffer,			// output style

	start: number,
	end: number,
	line: number,
	utf16: boolean,
	charWidth: number,
	colorDepth: number,
	colorWidth: number,
	cursor: Point
) {
	// Validate indexes
	if (start >= end) return
	// Move to start of output
	outputCursorMove(start + cursor.x, line + cursor.y)
	// process.stdout.write(Buffer.from('\u001b[0m', 'utf16le'))
	// process.stdout.write(ESCAPE_RESET, 'utf8')

	// Output segments that have the same styling/color
	let index = start
	const state: OutputColorState = { color: null, background: null }
	const { before, after, count } = outputLineEscape(state, color, background, style, index, end, colorDepth, colorWidth)

	process.stdout.cork()
	if (before) {
		process.stdout.write(before)
	}

	while (index < end) {
		const { before, after, count } = outputLineEscape(state, color, background, style, index, end, colorDepth, colorWidth)

		// If there was text up to the color escape, output it
		if (count > 0 && start < index) {
			process.stdout.write(text.subarray(start * charWidth, index * charWidth).toString(utf16 ? 'utf16le' : 'utf8'))
			start = index
		}

		if (before)
			process.stdout.write(before)
		index++
	}
	// Output final slice
	// console.log(text.subarray(start * charWidth, end * charWidth).toString('utf16le'))
	if (start <= index) {
		process.stdout.write(text.subarray(start * charWidth, (index + 1) * charWidth).toString(utf16 ? 'utf16le' : 'utf8'))
	}
	if (state.color || index >= text.length / charWidth)
		process.stdout.write(Buffer.from('\u001b[39m'))
	if (state.background || index >= text.length / charWidth)
		process.stdout.write(Buffer.from('\u001b[49m'))

	process.stdout.uncork()
	// escapes++

	// process.stdout.write(Buffer.from('\u001b[50G ' + start + ' -> ' + index + '    ', 'utf16le'))

	// if (state.color != null) {
	// 	process.stdout.write(Buffer.from('\u001b[39m', 'utf16le'))
	// 	escapes++
	// }

	// if (escapes > 0) {
	// 	outputLine(text, color, background, style, index + 1, index + escapes + 1, line, utf16, charWidth, colorDepth, colorWidth)
	// }
	// process.stdout.write(Buffer.from('\n', 'utf16le'))
	// console.log(' ' + line + ': ' + start + ' -> ' + end)
}

export function outputCursorMove(x: number, y: number) {
	process.stdout.write(Buffer.from(['\u001b[', y + 1, ';', x + 1, 'f\u001b[', x + 1, 'G'].join(''), 'utf16le'))
	// process.stdout.write(ESCAPE_UTF8, 'utf8')
	// process.stdout.write((y + 1).toString(), 'utf8')
	// process.stdout.write(SEMICOLON, 'utf8')
	// process.stdout.write((x + 1).toString(), 'utf8')
	// process.stdout.write(ESCAPE_CURSOR_COMMAND, 'utf8')
}


export function outputLineEscape(
	current: OutputColorState,
	color: Buffer,
	background: Buffer,
	style: Buffer,
	x: number,
	end: number,
	depth: number,
	width: number
): { before?: Buffer, after?: Buffer, count: number } {
	if (x >= end)
		return { count: 0 }

	// return false
	const before: Array<string> = []
	const styleByte = style.readUint8(x)
	const hasColor = ((styleByte & 128) != 0)
	const hasBackground = ((styleByte & 64) != 0)

	let colorValue = hasColor ? color.readUintLE(x * width, width) : null
	let backgroundValue = hasBackground ? background.readUintLE(x * width, width) : null

	// Ignore same as current output color
	if (colorValue != null) {
		if (colorValue == current.color)
			colorValue = null
		else {
			current.color = colorValue
			if (depth == 8)
				before.push('38;5;' + colorValue)
		}
	}
	// Unset current color
	else if (current.color != null) {
		before.push('39')
		current.color = null
	}
	if (backgroundValue != null) {
		if (backgroundValue == current.background)
			backgroundValue = null
		else {
			current.background = backgroundValue
			if (depth == 8)
				before.push('48;5;' + backgroundValue)
		}
	}
	else if (current.background != null) {
		before.push('49')
		current.background = null
	}

	// // Handle each color depth
	// if (depth == 4) {
	// 	if (colorValue != null && backgroundValue != null)
	// 		escape.push([colorValue, backgroundValue].join(';'))
	// 	else if (colorValue != null)
	// 		escape.push(colorValue.toString())
	// 	else if (backgroundValue != null)
	// 		escape.push(backgroundValue.toString())
	// }
	// else if (depth == 8) {
	// 	if (colorValue != null)
	// 	   escape.push('38;5;' + colorValue)
	//    else if (backgroundValue != null)
	// 	   escape.push('48;5;' + backgroundValue)
	// }
	// else if (depth == 24) {
	// 	if (colorValue != null)
	// 		escape.push(['38;2;',
	// 			((colorValue >> 16) & 0xff).toString(), ';',
	// 			((colorValue >> 8) & 0xff).toString(), ';',
	// 			(colorValue & 0xff).toString()
	// 		].join(''))
	// }


	if (before.length > 0)
		return {
			before: Buffer.concat(before.map((e) => Buffer.from('\u001b[' + e + 'm', 'utf16le'))),
			count: before.length
		}
	return { count: 0 }
}

export function outputColorReset(state: OutputColorState, depth: number) {
	if (state.color != null || state.background != null) {
		// process.stdout.write(ESCAPE_RESET, 'utf8')
		process.stdout.write(Buffer.from('\u001b[0m', 'utf16le'))
	}
}

export function renderLineTextColor(x: number, y: number): boolean {
	return (this.style[y].readUint8(x) & 128) != 0
}

export function renderLineBackground(x: number, y: number): boolean {
	return (this.style[y].readUint8(x) & 64) != 0
}

export function outputBuffer(text: Array<Buffer>, option: OutputOption): Buffer {
	const eol = option.utf16 ? UTF16_EOL : UTF8_EOL

	const array: Array<Buffer> = []
	for (let i = 0 ; i < text.length ; i++) {
		array.push(text[i])
		if (i + 1 < text.length)
			array.push(eol)
	}
	return Buffer.concat(array)
}
