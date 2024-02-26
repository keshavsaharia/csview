
// Style bits
export const BOLD = 1
export const DIM_FAINT = 2
export const ITALIC = 4
export const UNDERLINE = 8
export const BLINKING = 16
export const INVERSE = 32

// If first bit is set, then apply color stored in lower 4 bits of second byte
// If second bit is set, then apply background stored in upper 4 bits of second byte
export const FOREGROUND = 128
export const BACKGROUND = 64
export const COLOR = 128 | 64

// Standard color values encoded into a single byte for foreground/background
export const BLACK = 0
export const RED = 1
export const GREEN = 2
export const YELLOW = 3
export const BLUE = 4
export const MAGENTA = 5
export const CYAN = 6
export const LIGHT_GRAY = 7
export const GRAY = 8
export const BRIGHT_RED = 9
export const BRIGHT_GREEN = 10
export const BRIGHT_YELLOW = 11
export const BRIGHT_BLUE = 12
export const BRIGHT_MAGENTA = 13
export const BRIGHT_CYAN = 14
export const WHITE = 15

export function resizeStyle(style: Buffer[] | null, width: number, height: number): Buffer[] {
	if (! style)
		style = new Array(height)

	// Iterate over all rows and size/resize to expected width of 2 bytes per index
	const styleWidth = width * 2
	for (let y = 0 ; y < height ; y++) {
		const styleLine = style[y]
		// Resize buffer if already allocated, with a copy of the existing style state
		if (styleLine) {
			if (styleLine.length < styleWidth)
				styleLine.copy(style[y] = Buffer.alloc(styleWidth))
			else if (styleLine.length > styleWidth)
				style[y] = styleLine.subarray(0, styleWidth)
		}
		// Allocate new buffer with 2 bytes per index for style bitmask and color/background numbers
		else style[y] = Buffer.alloc(styleWidth)
	}
	// Remove extra rows if resizing down
	if (style.length > height)
		style.splice(height, style.length - height)

	return style
}

function colorValue(foreground: number, background: number = 0) {
	// Skip bit shift if background is 0
	if (background == 0)
		return foreground & 0x0f
	// Shift background value into upper 4 bits
	return ((background & 0x0f) << 4) | (foreground & 0x0f)
}

function setStyle(style: Buffer[], value: number, x: number, y: number) {
	const index = x * 2
	const line = style[y]
	if (line && index >= 0 && index < line.length) {
		line.writeUint8(value, index)
	}
}

function setColor(style: Buffer[], foreground: number, background: number, x: number, y: number) {
	const index = x * 2 + 1
	const line = style[y]
	if (line && index > 0 && index < line.length) {
		line.writeUint8( colorValue(foreground, background), index)

		const flag = line.readUint8(index - 1)
		if ((flag & FOREGROUND) == 0 || (flag & BACKGROUND) == 0)
			line.writeUint8(flag | FOREGROUND | BACKGROUND, index - 1)
	}
}

function setForeground(style: Buffer[], foreground: number, x: number, y: number) {
	const index = x * 2 + 1
	const line = style[y]

	if (line && index > 0 && index < line.length) {
		const value = (line.readUint8(index) & 0xf0) | (foreground & 0x0f)
		line.writeUint8(value, index)

		const flag = line.readUint8(index - 1)
		if ((flag & FOREGROUND) == 0)
			line.writeUint8(flag | FOREGROUND, index - 1)
	}
}

function setBackground(style: Buffer[], background: number, x: number, y: number) {
	const index = x * 2 + 1
	const line = style[y]

	if (line && index > 0 && index < line.length) {
		const value = (line.readUint8(index) & 0x0f) | ((background & 0x0f) << 4)
		line.writeUint8(value, index)

		const flag = line.readUint8(index - 1)
		if ((flag & BACKGROUND) == 0)
			line.writeUint8(flag | BACKGROUND, index - 1)
	}
}

export function escapeStyle(flag: number = 0, color: number = 0) {
	// Standard escape sequence to reset all styles and colors ( ESC[0 )
	const sequence: number[] = [27, 0, 91, 0, 48, 0]

	// Add color and background to initial specification
	if (flag & FOREGROUND) {
		const foreground = color & 0x0f
		sequence.push(59, 0, (foreground >= 8) ? 57 : 51, 0)	// ;3 or ;9
		sequence.push(48 + (foreground & 7), 0)			// digit 0 - 7
	}
	// default with ;39
	else sequence.push(59, 0, 51, 0, 57, 0)

	if (flag & BACKGROUND) {
		const background = (color & 0xf0) >> 4
		if (background >= 8)
			sequence.push(59, 0, 49, 0, 48, 0)	// ;10
		else
			sequence.push(59, 0, 52, 0)	// ;4
		sequence.push(48 + (background & 7), 0)	// digit 0 - 7
	}
	// default with ;49
	else sequence.push(59, 0, 52, 0, 57, 0)

	// Terminate initial sequence with m
	sequence.push(109, 0)

	// Iterate over each bit position controlling a style set
	if ((flag & 0x3f) > 0) {
		let bitMask = 1
		// The bit flag for each style type aligns with the escape code sequence, so the
		// formula 49 + index (where index is the bit's index in the 8 bit style state)
		// gives the ASCII number, with the exception of inverse (which is '7' instead of '6')
		for (let i = 0 ; i < 6 ; i++) {
			if (flag & bitMask)
				sequence.push(27, 0, 91, 0, i == 5 ? 55 : 49 + i, 0, 109, 0)
			bitMask = bitMask << 1
		}
	}
	return Buffer.from(sequence)
}

// export function
console.log(
	escapeStyle(FOREGROUND | BACKGROUND | BOLD, colorValue(WHITE, RED)) + ' some bold ' + escapeStyle(FOREGROUND | BOLD | INVERSE, GREEN) + ' shit' + escapeStyle())
console.log('▗▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\n▐\u001b[1m\u001b[3m\u001b[4m this is bold \u001b[0m this is not')
console.log(' ')
console.log(escapeStyle(BACKGROUND, colorValue(0, GREEN)) + '        ' + escapeStyle())
console.log(
	escapeStyle(FOREGROUND | BACKGROUND, colorValue(GREEN, RED)) +
	'▛▀▀▀▀▀▀▀▀▀▀▀▜▀▀▀▀▀▀▀▀▀▀▀▀'+ escapeStyle())
console.log(
	escapeStyle(FOREGROUND | BACKGROUND, colorValue(GREEN, RED)) +
	'▌           ▐' + escapeStyle())
console.log('▙▄▄▄▄▄▄▄▄▄▄▄▟')
console.log(escapeStyle().toString())
console.log(' ▗▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▖ ')
console.log(' ▐ Small input    ▌ ')
console.log(' ▝▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▘')
console.log(' ')
console.log(' ▛▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▜ ')
console.log(' ▌ Big input area        ▐ ')
console.log(' ▙▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▟\n')
console.log(' ▛▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▜ ')
console.log(' ▌ Big input area        ▐ ')
console.log(' ▙▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▟')
console.log(' ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁')
console.log('▕' +
			escapeStyle(COLOR | BOLD | UNDERLINE, colorValue(WHITE, GRAY)) +
			' compact input       ' + escapeStyle() + '▏')
console.log(' ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁')
console.log('▕' +
			escapeStyle(COLOR | BOLD | UNDERLINE, colorValue(WHITE, GRAY)) +
			' compact input       ' + escapeStyle() + '▏')
console.log(' ')
