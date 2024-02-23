import {
	Area
} from '..'

/**
 * @func 	updateStringArea
 * @desc 	Sets all text values in the grid to the given value
 */
export function updateStringArea(
	text: Array<Buffer>,	// The full grid to update in
	update: Array<Buffer>,	// The grid of update bits
	area: Area,				// Assumes has been cropped to the size of the array already
	value: number,			// Value to write into the area
	utf16: boolean = true	// Whether 2 bytes or 1 byte per character
) {
	// Validate array and get byte width (normally 1 byte for color/background)
	if (text.length == 0) return
	const space = utf16 ? 2 : 1

	// Parse position
	const startX = area.x * space,
		  startY = area.y,
		  endX = startX + area.width * space,
		  endY = startY + area.height

	// Iterate over each target row
	for (let y = startY ; y < endY ; y++) {
		const line = text[y]
		if (! line) continue

		// Update bitmask and starting bit index for first byte
		let updateByte = 0
		let startBit = area.x % 8

		// Iterate over row in groups of 8 bytes
		for (let byte = startX ; byte < endX ; byte += 8 * space) {
			for (let bit = startBit ; bit < 8 ; bit++) {

				// Use bit index and initial offset to calculate iterated index
				const index = byte + (bit - startBit) * space
				if (index >= endX) {
					updateByte = updateByte << (8 - bit)
					break
				}

				// If the array value is changing, set the update bit
				const current = utf16 ? line.readUint16LE(index) : line.readUint8(index)
				if (current != value) {
					if (utf16)
						line.writeUint16LE(value, index)
					else
						line.writeUint8(value, index)
					updateByte = updateByte | 1
				}

				// Make a space for the next bit
				if (bit != 7)
					updateByte = updateByte << 1
			}

			// Insert the update byte into the buffer and clear the bit offset
			if (updateByte > 0) {
				const updateIndex = Math.floor(byte / 8 / space)
				update[y].writeUint8(update[y].readUint8(updateIndex) | updateByte, updateIndex)
			}

			// Stop offsetting bits after first iteration and compensate for missed bytes
			if (startBit > 0) {
				byte -= startBit
				startBit = 0
			}
			updateByte = 0
		}
	}
}


export function updateString(
	buffer: Buffer, update: Buffer,			// The target buffer to write to, and the update bitmask for this buffer
	sequence: Buffer,						// The sequence of bytes to write into the buffer
	x: number = 0,							// The position to write at into the sequence
	length: number,							// Number of characters to write
	utf16: boolean = true					// Whether the string is in 2 byte or 1 byte characters
): number {
	const charSize = utf16 ? 2 : 1

	// Iterate over sequence and set update bits into a full byte before updating
	let updateByte = 0
	let startBit = x % 8
	const startIndex = x * charSize

	// Iterate over characters in groups of 8, and iterate over characters within the group
	// with the bit index to write into the update byte
	for (let char = 0 ; char < length ; char += 8) {
		// Start first iteration with a bit shift which is set to 0 for subsequent iterations
		for (let bit = startBit ; bit < 8 ; bit++) {

			// Get indexes to compare sequence against buffer
			const index = (char + bit - startBit) * charSize
			const bufferIndex = startIndex + index

			// Terminate loop and set update byte
			if (index >= sequence.length || bufferIndex >= buffer.length) {
				// Shift update byte by remaining bits to align properly
				updateByte = updateByte << (7 - bit)
				break
			}

			// If there is a new byte to write into the buffer, add it
			// and set the update bit for this byte
			const newChar = sequence.readUint16LE(index)
			if (buffer.readUint16LE(bufferIndex) != newChar) {
				buffer.writeUint16LE(newChar, bufferIndex)
				updateByte = updateByte | 1
			}

			// If not last bit, shift the update byte to make space for the next bit
			if (bit != 7)
				updateByte = updateByte << 1
		}

		// Write the update byte into the buffer if there was an update
		if (updateByte > 0) {
			const updateIndex = Math.floor((x + char - startBit) / 8)
			update.writeUint8(update.readUint8(updateIndex) | updateByte, updateIndex)
		}

		// Stop offsetting bits after first iteration and compensate for missed bytes
		if (startBit > 0) {
			char -= startBit
			startBit = 0
		}
		// Reset update byte
		updateByte = 0
	}

	// Return total characters written
	return length
}

export function updateChar(
	buffer: Array<Buffer>, update: Array<Buffer>,
	x: number, y: number,
	value: number, utf16: boolean = false
) {
	const line = buffer[y]
	if (! line || x < 0 || x * (utf16 ? 2 : 1) >= line.length)
		return

	const current = utf16 ? line.readUInt16LE(x * 2) : line.readUint8(x)
	if (current != value) {
		if (utf16)
			line.writeUInt16LE(value, x * 2)
		else
			line.writeUint8(value, x)

		const index = Math.floor(x / 8)
		const updateBit = (128 >> (x % 8))
		const updateByte = update[y].readUint8(index)
		update[y].writeUint8(updateByte | updateBit, index)
	}
}
