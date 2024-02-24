
// Style bits
// bit 0 - bold
// bit 1 - dim/faint mode
// bit 2 - italic
// bit 3 -

export const BOLD = 1
export const DIM_FAINT = 2
export const ITALIC = 4
export const UNDERLINE = 8
export const BLINKING = 16
export const INVERSE = 32
export const HIDDEN = 64
export const STRIKETHROUGH = 128

export function resizeStyle(style: Buffer[] | null, width: number, height: number): Buffer[] {
	if (! style)
		style = new Array(height)

	// Iterate over all rows
	for (let y = 0 ; y < height ; y++) {
		const styleLine = style[y]
		// Resize buffer if already allocated, with a copy of the existing style state
		if (styleLine) {
			if (styleLine.length < width)
				styleLine.copy(style[y] = Buffer.alloc(width))
			else if (styleLine.length > width)
				style[y] = styleLine.subarray(0, width)
		}
		// Allocate new buffer with 1 byte per index for style bitmask
		else style[y] = Buffer.alloc(width)
	}
	// Remove extra rows if resizing down
	if (style.length > height)
		style.splice(height, style.length - height)

	return style
}

export function escapeStyle(value: number = 0) {
	// Standard escape sequence to reset all styles
	const sequence: number[] = [27, 0, 91, 0, 48, 0, 109, 0]

	// Iterate over each bit position
	if (value > 0) {
		let bitMask = 1
		// The bit flag for each style type aligns with the escape code sequence, so the
		// formula 49 + index (where index is the bit's index in the 8 bit style state)
		for (let i = 0 ; i < 8 ; i++) {
			if (value & bitMask)
				sequence.push(27, 0, 91, 0, 49 + i, 0, 109, 0)
			bitMask = bitMask << 1
		}
	}
	return Buffer.from(sequence)
}

// export function
console.log(escapeStyle(BOLD | ITALIC | UNDERLINE) + 'some bold ' + escapeStyle(BOLD) + 'shit' + escapeStyle())
console.log('▗▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\n▐\u001b[1m\u001b[3m\u001b[4m this is bold \u001b[0m this is not')
