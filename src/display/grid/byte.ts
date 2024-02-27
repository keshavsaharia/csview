
import { Size } from './types'

export class ByteGrid {
	size: Size
	grid: Buffer

	// renderText(text?: TextGrid): Buffer[] {
	// 	const grid: Buffer[] = []
	// 	for (let y = 0 ; y < this.size.height ; y++) {
	// 		const line: Buffer[] = []
	// 		for (let x = 0 ; x < this.size.width ; x++) {
	// 			const value = this.render(this.read(x, y))
	// 			if (value != null)
	// 				line.push(value)
	// 		}
	// 		grid.push(Buffer.concat(line))
	// 	}
	// 	return grid
	// }

	render(byte: number): Buffer | null {
		return null
	}

	constructor(size: Size) {
		this.resize(size)
	}

	resize(size: Size, preserve: boolean = true) {
		const newGrid = Buffer.alloc(size.width * size.height)

		if (this.grid && this.size && preserve) {
			for (let y = 0 ; y < size.height ; y++) {
				const targetStart = y * size.width
				const sourceStart = y * this.size.width
				const sourceEnd = sourceStart + Math.min(size.width, this.size.width)
				this.grid.copy(newGrid, targetStart, sourceStart, sourceEnd)
			}
		}
		this.grid = newGrid
		this.size = size
	}

	fill(byte: number) {
		this.grid.fill(byte)
	}

	has(x: number, y: number): boolean {
		return x >= 0 && y >= 0 && x < this.size.width && y < this.size.height
	}

	private index(x: number, y: number): number {
		return y * this.size.width + x
	}

	private validIndex(index: number) {
		return index >= 0 && index < this.grid.length
	}

	read(x: number, y: number): number {
		const index = this.index(x, y)
		if (this.validIndex(index))
			return this.grid.readUint8(index)
		else throw new Error('invalid position ' + x + ', ' + y)
	}

	write(x: number, y: number, value: number) {
		const index = this.index(x, y)
		if (this.validIndex(index))
			return this.grid.writeUint8(value, index)
		else throw new Error('invalid position ' + x + ', ' + y)
	}

	/**
	 * Update the given x, y position with an update byte, with the optional mask applied
	 */
	update(x: number, y: number, update: number, mask?: number): number {
		const index = this.index(x, y)
		if (! this.validIndex(index))
			throw new Error('invalid position')

		// Get the value and apply the optional bitmask for specific bits to be updated
		// E.g. providing a bitmask of 0b11000011 will always rewrite the middle 4 bits during
		// an update, while preserving the values of the first and last two bits.
		let value = this.grid.readUint8(index)
		if (mask != null)
			value = value & mask

		// Apply the update, write the new value, and return
		value = value | update
		this.grid.writeUint8(value, index)
		return value
	}

	getWidth() {
		return this.size.width
	}

	getHeight() {
		return this.size.height
	}

}
