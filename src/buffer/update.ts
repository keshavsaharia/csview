import {
	Size
} from '..'

export function eachUpdate(
	update: Buffer,
	size: Size,
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
			end = Math.min(start + 8 - offset, size.width - 1),
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
		handler(start, Math.min(end + 1, size.width))
		// Move to next byte
		byte++
	}
}
