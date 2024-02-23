import { Area } from './geometry'

/**
 * Standard color dictionary.
 */
export class Color {

	static black = 			ansiColor(30,   0,   0,   0)
	static red = 			ansiColor(31, 194,  54,  33)
	static green = 			ansiColor(32,  37, 188,  36)
	static yellow = 		ansiColor(33, 173, 173,  39)
	static blue = 			ansiColor(34,  73,  46, 225)
	static magenta = 		ansiColor(35, 211,  56, 211)
	static cyan = 			ansiColor(36,  51, 187, 200)
	static lightGray = 		ansiColor(37, 203, 204, 205)
	static gray = 			ansiColor(90, 129, 131, 131)
	static brightRed = 		ansiColor(91, 252,  57,  31)
	static brightGreen = 	ansiColor(92,  49, 231,  34)
	static brightYellow = 	ansiColor(93, 234, 236,  35)
	static brightBlue = 	ansiColor(94,  88,  51, 255)
	static brightMagenta = 	ansiColor(95, 249,  53, 248)
	static brightCyan = 	ansiColor(96,  20, 240, 240)
	static white = 			ansiColor(97, 233, 235, 235)

}

/**
 * Base interface for a color object with multiple cached numeric representations
 * of the color for output at different depths based on terminal TTY configuration.
 */
export interface OutputColor {
	ansi?: number
	r?: number
	g?: number
	b?: number
	index?: number
}

/**
 * Convert
 */
function ansiColor(ansi: number, r: number, g: number, b: number): OutputColor {
	// Calculate color index
	const index = ((r * 6 / 256) * 36 + (g * 6 / 256) * 6 + (b * 6 / 256)) & 0xff
	return {
		ansi,
		index,
		r, g, b
	}
}

export function colorValue(color: OutputColor, background: boolean, depth: number, width: number): number | null {
	// If basic color support and an ANSI color was used
	if ((depth == 3 || depth == 4) && color.ansi != null)
		return color.ansi + (background ? 10 : 0)
	// If 256 color support
	else if (depth == 8) {
		if (color.ansi != null)
			return (color.ansi >= 90 ? (color.ansi - 90) : (color.ansi - 30))
		else if (color.index != null)
			return color.index
	}
	// 24 bit color (full RGB)
	else if (depth == 24) {
		if (color.r != null && color.g != null && color.b != null)
			return ((color.r & 0xff) << 16) | ((color.g & 0xff) << 8) | (color.b & 0xff)
	}
	return 0
}

export function updateColorArea(
	buffer: Array<Buffer>,	// Target buffer to write to
	style: Array<Buffer>,	// Style buffer
	update: Array<Buffer>,	// Update buffer
	color: OutputColor,		// output color object
	area: Area,				// Output area
	background: boolean,	// Whether this is a background color (changes ANSI styling)
	colorDepth: number,		// Color depth in bits
	colorWidth: number		// Color width in bytes
) {
	for (let y = area.y ; y < area.y + area.height ; y++) {
		const bufferLine = buffer[y],
			  styleLine = style[y],
			  updateLine = update[y]

		if (! bufferLine) continue

		updateColor(
			bufferLine, styleLine, updateLine,
			color, area.x, area.width,
			background,
			colorDepth, colorWidth
		)
	}
}

/**
 * Update the color
 */
export function updateColor(
	buffer: Buffer,			// Target buffer to write to
	style: Buffer,			// Style buffer
	update: Buffer,			// Update buffer
	color: OutputColor,		// output color object
	x: number,				// The position to write from
	length: number,			// Number of spaces to fill
	background: boolean,	// Whether this is a background color (changes ANSI styling)
	colorDepth: number,		// Color depth in bits
	colorWidth: number		// Color width in bytes
) {
	// Iterate over sequence and set update bits into a full byte before updating
	let updateByte = 0
	let startBit = x % 8
	const value = colorValue(color, background, colorDepth, colorWidth)
	if (value == null)
		return

	const styleBit = background ? 64 : 128
	const endX = x + length

	// Iterate over bytes in groups of 8, and iterate over bytes within the group
	// with the bit index to write into the update byte
	for (let byte = x ; byte < endX ; byte += 8) {
		// Start first iteration with a bit shift which is set to 0 for subsequent iterations
		for (let bit = startBit ; bit < 8 ; bit++) {

			// Get indexes to compare sequence against buffer
			const byteIndex = byte + bit - startBit
			const index = byteIndex * colorWidth

			// Terminate loop and set update byte
			if (byteIndex >= endX || index + colorWidth >= buffer.length) {
				// Shift update byte by remaining bits to align properly
				updateByte = updateByte << (7 - bit)
				break
			}

			// If there is a new byte to write into the buffer, add it
			// and set the update bit for this byte
			if (buffer.readUintLE(index, colorWidth) != value) {
				buffer.writeUintLE(value, index, colorWidth)
				updateByte = updateByte | 1

				// Update style buffer with flag to use color
				const styleByte = style.readUint8(byteIndex)
				if ((styleByte & styleBit) == 0)
					style.writeUint8(styleByte | styleBit, byteIndex)
			}

			// If not last bit, shift the update byte to make space for the next bit
			if (bit != 7)
				updateByte = updateByte << 1
		}

		// Write the update byte into the buffer if there was an update
		if (updateByte > 0) {
			const updateIndex = Math.floor((byte - startBit) / 8)
			update.writeUint8(update.readUint8(updateIndex) | updateByte, updateIndex)
		}

		// Stop offsetting bits after first iteration and compensate for missed bytes
		if (startBit > 0) {
			byte -= startBit
			startBit = 0
		}
		// Reset update byte
		updateByte = 0
	}
}
