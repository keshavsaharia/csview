
export function resizeText(
	text: Buffer[] | null,
	width: number,
	height: number,
	charSize: number,
	charFill: number,
	utf16: boolean
) {
	// Initialize text array if first sizing
	if (! text)
		text = new Array(height)

	// Initialize each row with a text buffer sized to the configured width
	for (let y = 0 ; y < height ; y++)
		text[y] = resizeTextRow(text[y] || null, width, charSize, charFill, utf16)

	// If there is an existing size initialized that has more rows than the new
	// initialized height, remove the extra rows
	if (height < text.length)
		text.splice(height, text.length - height)

	return text
}

/**
 * Resize the text line buffer
 */
export function resizeTextRow(
	line: Buffer | null,
	width: number,
	charSize: number,
	charFill: number,
	utf16: boolean
): Buffer {
	const textWidth = width * charSize

	// Return new buffer with initial character fill
	if (line == null) {
		line = Buffer.alloc(textWidth)
		for (let x = 0 ; x < width ; x++)
			writeTextChar(line, charFill, x, utf16)
		return line
	}

	// If the text line needs to be resized down, take a subarray along with the color and style buffers
	if (line.length > textWidth)
		return line.subarray(0, textWidth)

	// If the text line needs to be resized up
	else if (line.length < textWidth) {
		const newLine = Buffer.alloc(textWidth)
		// Allocate larger buffer, copy earlier text buffer, and fill new spaces with fill character
		line.copy(newLine)
		for (let x = line.length / charSize ; x < width ; x++)
			writeTextChar(newLine, charFill, x, utf16)
		return newLine
	}

	// Width has not changed
	else return line
}

export function updateChar(
	line: Buffer,
	update: Buffer,
	char: number,
	x: number,
	charSize: number,
	utf16: boolean
): boolean {
	if (! line || x < 0 || x * charSize >= line.length)
		return

	const current = utf16 ? line.readUInt16LE(x * 2) : line.readUint8(x)
	if (current != char) {
		writeTextChar(line, char, x, utf16)

		// Set the update bit for this character's position
		const index = Math.floor(x / 8)
		const updateBit = (128 >> (x % 8))
		const updateByte = update.readUint8(index)
		update.writeUint8(updateByte | updateBit, index)
		return true
	}
	return false
}

export function writeTextChar(
	line: Buffer,
	char: number,
	x: number,
	utf16: boolean
) {
	if (utf16)
		line.writeUint16LE(char, x * 2)
	else
		line.writeUint8(char, x)
}
