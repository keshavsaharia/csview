import { Size, Area } from './types'

/**
 * A 2D array of bytes, with each row represented by a Buffer instance
 */
export class Grid {
	private grid: Buffer[]
	private fill?: number[]
	private bytes: number

	private size: Size
	private area: Area

	constructor(size: Size, bytes: number = 2, fill?: number[]) {
		this.bytes = bytes
		this.fill = fill
		this.resize(size)
	}

	resize(size: Size, preserve: boolean = true): this {
		if (! this.grid)
			this.grid = new Array(size.height)

		// Initialize or resize each row buffer
		for (let y = 0 ; y < size.height ; y++) {
			const row = this.grid[y]
			// Initialize a new row buffer, or overwrite an existing one if the preserve flag
			// is explicitly set to false
			if (row == null || ! preserve)
				this.grid[y] = this.createRow(size.width)
			// Resize to a larger/smaller buffer and copy the existing contents
			else this.grid[y] = this.resizeRow(row, size.width)
		}
		// Remove extra rows
		if (size.height < this.grid.length)
			this.grid.splice(size.height, this.grid.length - size.height)

		// Cache new height and full area
		this.size = size
		this.area = { x: 0, y: 0, ...size }
		return this
	}

	private createRow(width: number): Buffer {
		const byteWidth = width * this.bytes
		const row = Buffer.alloc(byteWidth)

		// If no fill, return empty 0-filled buffer
		if (this.fill == null)
			return row
		// Simple array fill with a byte value
		else if (this.fill.length == 1)
			row.fill(this.fill[0])
		// Fill repeating sequence
		else {
			for (let x = 0 ; x < byteWidth ; x += this.bytes) {
				for (let i = 0 ; i < this.fill.length ; i++) {
					row.writeUint8(this.fill[i], x + i)
				}
			}
		}
		return row
	}

	private resizeRow(row: Buffer, width: number) {
		const byteWidth = width * this.bytes
		if (row.length < byteWidth) {
			const newRow = Buffer.alloc(byteWidth)
			row.copy(newRow)

			// Fill new row elements if default specified
			if (this.fill)
				for (let x = row.length ; x < newRow.length ; x += this.bytes) {
					for (let i = 0 ; i < this.fill.length ; i++) {
						newRow.writeUint8(this.fill[i], x + i)
					}
				}
			return newRow
		}
		else if (row.length > byteWidth) {
			return row.subarray(0, byteWidth)
		}
		else return row
	}

	/**
	 * Returns true if the given x, y position is a valid coordinate on this grid.
	 * Can provide an optional index of the byte to check validity for, but it should
	 * be assumed that if the 0 byte is present, the subsequent ones are also present.
	 */
	has(x: number, y: number, index: number = 0) {
		// Check lower bounds and upper row limit
		if (x < 0 || y < 0 || y >= this.grid.length || index >= this.bytes || ! this.grid[0])
			return false
		// Use first row to check upper column limit
		return x * this.bytes + index < this.grid[0].length
	}

	/**
	 * Get the byte sequence at the given x, y position
	 */
	getValue(x: number, y: number): number[] {
		if (x < 0 || y < 0) return []

		// Validate row in bounds
		const row = this.grid[y]
		const dx = x * this.bytes
		if (! row || dx + this.bytes >= row.length)
			return []

		// Extract byte sequence from buffers
		const value: number[] = new Array(this.bytes)
		for (let i = 0 ; i < this.bytes ; i++)
			value[i] = row.readUint8(dx + i)
		return value
	}

	setValue(x: number, y: number, sequence: Array<number | null>) {
		const row = this.grid[y]
		if (! row || x < 0) return

		const dx = x * this.bytes
		for (let i = 0 ; i < sequence.length && dx + i < row.length ; i++) {
			if (sequence[i] != null)
				row.writeUint8(sequence[i], dx + i)
		}
	}

	getRow(y: number): Buffer {
		if (y < 0 || y >= this.grid.length)
			throw new Error('invalid row ' + y)
		return this.grid[y]
	}

	getByte(x: number, y: number, index: number = 0): number {
		const row = this.grid[y]
		const dx = x * this.bytes + index
		if (! row || dx >= row.length || index >= this.bytes)
			return 0
		return row.readUint8(dx)
	}

	setByte(x: number, y: number, index: number, value: number): number {
		const row = this.grid[y]
		const dx = x * this.bytes + index
		if (! row || dx >= row.length || index >= this.bytes)
			return 0
		return row.writeUint8(value, dx)
	}

	setStringValue(x: number, y: number, value: string) {
		this.setValue(x, y, Array.from(Buffer.from(value, 'utf16le')))
	}

	setFill(first: number, ...last: number[]) {
		this.fill = [ first, ...last ]
		return this.fillAll(first, ...last)
	}

	/**
	 * Fill entire grid area
	 */
	fillAll(first: number, ...last: number[]) {
		return this.fillArea(this.area, [first, ...last ])
	}

	/**
	 * Fill each
	 */
	private fillArea(area: Area, sequence: number[]): this {

		const end_y = area.y + area.height
		for (let y = area.y ; y < end_y ; y++) {
			const row = this.grid[y]

			// Single byte areas
			if (sequence.length == 1)
				row.fill(sequence[0])

			// Write the byte sequence into the area
			else {
				const end_x = area.x + area.width
				for (let x = area.x ; x < end_x ; x++) {
					let dx = x * this.bytes
					for (let i = 0 ; i < sequence.length && dx + i < row.length ; i++)
						row.writeUint8(sequence[i], dx + i)
				}
			}
		}
		return this
	}



	getSize() {
		return this.size
	}

	getArea() {
		return this.area
	}

	getWidth() {
		return this.size.width
	}

	getHeight() {
		return this.size.height
	}
}

export class ByteGrid {
	size: Size
	grid: Buffer

	constructor(size: Size) {
		this.size = size
		this.grid = Buffer.alloc(size.width * size.height)
	}

	resize(size: Size, preserve: boolean = true) {
		const newGrid = Buffer.alloc(size.width * size.height)
		if (this.grid && this.size && preserve) {
			for (let y = 0 ; y < size.height ; y++) {
				const targetStart = y * size.height
				const sourceStart = y * this.size.height
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

	read(x: number, y: number): number {
		return this.grid.readUint8(this.index(x, y))
	}

	write(x: number, y: number, value: number) {
		return this.grid.writeUint8(value, this.index(x, y))
	}

}
