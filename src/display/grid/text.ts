import { Size, Area } from './types'
import { OutOfBoundsError } from './error'

/**
 * @class 	TextGrid
 * @desc 	2D text grid implemented as an array of Buffers.
 */
export class TextGrid {
	// Standard text encoding format for unicode characters
	static encoding: BufferEncoding = 'utf16le'
	static bytes = 2

	// Internal state
	private size: Size
	private area: Area
	private grid: Buffer[]
	private fill?: number[]

	constructor(size: Size, fill?: number[] | string) {
		this.setFill(fill)
		this.resize(size)
	}

	setFill(fill?: number[] | string) {
		if (fill == null)
			this.fill = undefined
		else if (typeof fill === 'string')
			this.fill = Array.from(Buffer.from(fill, TextGrid.encoding))
		else
			this.fill = fill
	}

	/**
	 * @func 	has
	 * @desc 	Position is valid
	 * @param 	{number} x - x position
	 * @param 	{number} y - y position
	 * @returns {boolean}
	 */
	has(x: number, y: number): boolean {
		return 0 <= x && x < this.size.width &&
		 	   0 <= y && y < this.size.height
	}

	hasLine(y: number): boolean {
		return 0 <= y && y < this.grid.length
	}

	/**
	 * @func 	getLine
	 * @param 	{number} y - y position
	 * @returns {Buffer}
	 **/
	getLine(y: number): Buffer {
		if (! this.hasLine(y))
			throw OutOfBoundsError.forLine(y)
		return this.grid[y]
	}

	/**
	 * Expand this text grid by adding a line
	 * @returns {Buffer}
	 */
	addLine(): Buffer {
		const line = this.createRow(this.size.width)
		this.grid.push(line)
		this.size.height++
		return line
	}

	getSpan(x: number, y: number, length: number): Buffer {
		if (! this.has(x, y))
			return Buffer.alloc(0)

		const start = x * TextGrid.bytes
		const end = start + length * TextGrid.bytes
		this.grid[y].subarray(start, end)
	}

	/**
	 * @desc Get the byte sequence at the given x, y position
	 *
	 * @param {number} x - x position
	 * @param {number} y - y position
	 * @returns {Buffer}
	 */
	getValue(x: number, y: number): Buffer {
		if (x < 0 || y < 0)
			return Buffer.alloc(0)

		// Validate row in bounds
		const row = this.grid[y]
		const dx = x * TextGrid.bytes
		if (! row || dx >= row.length)
			return Buffer.alloc(0)

		// Extract byte sequence from buffers
		return row.subarray(dx, dx + TextGrid.bytes)
	}

	/**
	 * @func 	getChar
	 * @desc 	Get the string character
	 *
	 * @param {number} x - x position
	 * @param {number} y - y position
	 * @returns {string}
	 */
	getChar(x: number, y: number): string {
		return this.getValue(x, y).toString(TextGrid.encoding)
	}

	/**
	 * @desc 	Resize the text area
	 *
	 * @param {Size} size
	 * @param {boolean} preserve - preserve text contents
	 */
	resize(size: Size, preserve: boolean = true): this {
		if (! this.grid)
			this.grid = new Array(size.height)

		// Initialize a new row buffer, or overwrite an existing one if the preserve flag is explicitly set to false
		for (let y = 0 ; y < size.height ; y++) {
			const row = this.grid[y]

			// Resize to a larger/smaller buffer and copy the existing contents
			if (row == null || ! preserve)
				this.grid[y] = this.createRow(size.width)
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

	/**
	 * Create a new text row with the given character width.
	 * @param {number} width - number of characters in the row (scaled by byte size)
	 */
	private createRow(width: number): Buffer {
		const byteWidth = width * TextGrid.bytes
		const row = Buffer.alloc(byteWidth)

		// If no fill, return empty 0-filled buffer
		if (this.fill == null)
			return row
		// Simple array fill with a byte value
		else if (this.fill.length == 1)
			row.fill(this.fill[0])
		// Fill repeating sequence
		else this.fillBuffer(row)
		return row
	}

	/**
	 * Resize the existing row to the given width
	 */
	private resizeRow(row: Buffer, width: number): Buffer {
		const byteWidth = width * TextGrid.bytes
		if (row.length < byteWidth) {
			const newRow = Buffer.alloc(byteWidth)
			row.copy(newRow)

			// Fill new row elements if default specified
			if (this.fill)
				this.fillBuffer(newRow, row.length)
			return newRow
		}
		// Resize down
		else if (row.length > byteWidth)
			return row.subarray(0, byteWidth)

		else return row
	}

	private fillBuffer(buffer: Buffer, offset: number = 0): Buffer {
		if (! this.fill)
			return buffer
		for (let x = offset ; x < buffer.length ; x += TextGrid.bytes) {
			for (let i = 0 ; i < this.fill.length ; i++)
				buffer.writeUint8(this.fill[i], x + i)
		}
		return buffer
	}

	/**
	 * @desc 	Write the output string
	 */
	writeString(x: number, y: number, output: string) {
		return this.writeBuffer(x, y, Buffer.from(output, TextGrid.encoding))
	}

	writeBuffer(x: number, y: number, buffer: Buffer) {
		if (y < 0 || y > this.grid.length)
			return

		const line = this.grid[y]
		const targetStart = x * TextGrid.bytes
		const space = (this.size.width - x) * TextGrid.bytes
		if (x < 0 || space <= 0)
			return

		// Safe copy from buffer to target output
		buffer.copy(line, targetStart, 0) //, Math.min(space, buffer.length))
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
