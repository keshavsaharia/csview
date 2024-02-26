/**
 * Get cursor position
 */
export async function getCursorPosition() {
	return new Promise((resolve: (cursor: { x: number, y: number }) => any, reject) => {
		process.stdin.once('readable', () => {
			if (! process.stdin.setRawMode)
				return resolve({ x: -1, y: -1 })

			const buffer = process.stdin.read()
			process.stdin.setRawMode(false)
			if (! Buffer.isBuffer(buffer))
				reject(new Error('Invalid input response for getting cursor position'))

			// Receive an escape sequence with the cursor position
			else if (buffer.readUint8(0) == 0x1b && buffer.readUint8(1) == 0x5b) {
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
		if (process.stdin.setRawMode) {
			process.stdin.setRawMode(true)
			process.stdout.write(Buffer.from([0x1b, 0x5b, 0x36, 0x6e ]), 'utf8')
		}
		else resolve({ x: -1, y: -1 })
	})
}
