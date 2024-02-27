import { ByteGrid } from '..'
import { Area } from '../types'
import { BOLD, NORMAL, DOUBLE, LINE_CHAR } from './constant'

export class LineGrid extends ByteGrid {

	static NORMAL = NORMAL
	static BOLD = BOLD
	static DOUBLE = DOUBLE

	render(byte: number): Buffer {
		// The index of the table character is pre-mapped to the output symbol encoded
		// as utf16le
		const index = byte * 2
		return LINE_CHAR.subarray(index, index + 2)
	}

	private writeHorizontalLine(y: number, x1: number, x2: number, line: number) {
		if (x1 > x2)
			return this.writeHorizontalLine(y, x2, x1, line)

		// Write each coordinate with the corresponding right/left markers
		this.writeRight(x1, y, line)
		for (let x = x1 + 1 ; x < x2 ; x++)
			this.writeHorizontal(x, y, line)
		this.writeLeft(x2, y, line)
	}

	private writeVerticalLine(x: number, y1: number, y2: number, line: number) {
		// Swap parameters so y1 < y2
		if (y1 > y2)
			return this.writeVerticalLine(x, y2, y1, line)

		// Write each coordinate with the corresponding right/left markers
		this.writeBottom(x, y1, line)
		for (let y = y1 + 1 ; y < y2 ; y++)
			this.writeVertical(x, y, line)
		this.writeTop(x, y2, line)
	}

	writeRectangle(area: Area, line: number) {
		const end_x = area.x + area.width
		const end_y = area.y + area.height
		this.writeHorizontalLine(area.y, area.x, end_x, line)
		this.writeHorizontalLine(end_y, area.x, end_x, line)
		this.writeVerticalLine(area.x, area.y, end_y, line)
		this.writeVerticalLine(end_x, area.y, end_y, line)
	}

	private writeTop(x: number, y: number, line: number) {
		this.update(x, y, line << 6, 0b00111111)
	}

	private writeBottom(x: number, y: number, line: number) {
		this.update(x, y, line << 2, 0b11110011)
	}

	private writeRight(x: number, y: number, line: number) {
		this.update(x, y, line << 4, 0b11001111)
	}

	private writeLeft(x: number, y: number, line: number) {
		this.update(x, y, line, 0b11111100)
	}

	private writeVertical(x: number, y: number, line: number) {
		this.update(x, y, (line << 6) | (line << 2), 0b00110011)
	}

	private writeHorizontal(x: number, y: number, line: number) {
		this.update(x, y, (line << 4) | line, 0b11001100)
	}

}
