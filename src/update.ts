

export function resizeUpdate(update: Buffer[] | null, width: number, height: number): Buffer[] {
	// Initialize update array if first update sizing
	if (! update)
		update = new Array(height)
	// Remove extra rows if resizing down from current height
	else if (height < update.length)
		update.splice(height, update.length - height)

	// Last update byte is padded on the right with zeroes if width is not
	// divisible by 8, by shifting 1's into a byte for the modulus 8 space
	const updateWidth = Math.ceil(width / 8)

	// Initialize each row with a new buffer in each 2D space array
	// Update buffer is always reset to all 1's (i.e. re-render entire output) during a resize operation
	// or during the initial render, so it is always set to an initial new buffer
	for (let y = 0 ; y < height ; y++)
		update[y] = Buffer.alloc(updateWidth).fill(255)

	// Last byte in the update array has zeroes set for out-of-bound indexes, so the final byte in
	// each row may need a binary value like 0b11111000 (to signify the final 3 indexes as out-of-bounds)
	// This is required due to the way update span parsing is implemented.
	const lastUpdateByte = ((0xff00 >> (width % 8)) & 0xff)
	if (lastUpdateByte != 255)
		for (let y = 0 ; y < height ; y++)
			update[y].writeUint8(lastUpdateByte, updateWidth - 1)

	return update
}

export function eachUpdate(
	update: Buffer,
	width: number,
	handler: (start: number, end: number) => any) {

	// Iterate over all bytes in the update bitmask
	let byte = 0, offset = 0
	while (byte < update.length) {
		let bitmask = update.readUint8(byte)
		// Offset from a previous incomplete update byte shifts
		// lower bits out of bitmask
		if (offset > 0)
			bitmask = (bitmask << offset) & 0xff
		// Reset and move to next byte if no bitmask
		if (bitmask == 0) {
			offset = 0
			byte++
			continue
		}

		// Clear the bitmask if there is an update from this byte
		update.writeUint8(0, byte)

		// Get start and end index of the updated sequence of characters
		let start = byte * 8 + offset,
			startBit = 128,
			end = Math.min(start + 8 - offset, width - 1),
			endBit = 1 << offset,
			extend = true

		// Advance start index and end index to the update frame
		while ((bitmask & startBit) == 0) {
			start++
			startBit = startBit >> 1
		}
		while (start < end && ((bitmask & endBit) == 0)) {
			extend = false
			end--
			endBit = endBit << 1
		}

		// If the end bit was not shifted, can possibly be joined with next byte.
		// Otherwise, reset the offset to start reading at the next byte
		if (! extend)
			offset = 0
		else while (byte + 1 < update.length) {
			// Get the next update mask
			const next = update.readUint8(byte + 1)
			// If the next mask does not start with an update bit, don't
			// advance to the next byte and leave the end position as-is
			if ((next & 128) == 0) {
				offset = 0
				break
			}
			// Advance to the end of the next byte
			startBit = 128
			endBit = 0
			while ((next & startBit) != 0) {
				end++
				endBit++
				startBit = startBit >> 1
			}
			// Clear the update byte if all bits were 1, and advance to the next
			// available update byte
			if (startBit == 0) {
				update.writeUint8(0, byte + 1)
				byte++
				offset = 0
			}
			// If there was an end bit found, remove these found bits and continue from
			// the remaining update byte in the next iteration with an updated offset
			// Advance previously-zeroed offset to first zero index and clear read bits
			else {
				offset = endBit + 1
				update.writeUint8(next & (0xff >> endBit), byte + 1)
				break
			}
		}
		// When end index has been reached
		handler(start, Math.min(end + 1, width))
		// Move to next byte
		byte++
	}
}
