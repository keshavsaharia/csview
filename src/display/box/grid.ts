import { ByteGrid } from '..'
import { Area, Size } from '../types'

import {
	BOX, SHADE,
	TOP, LEFT, BOTTOM, RIGHT,
	NE, NW, SE, SW, SHADING,
	VERTICAL_BOX, HORIZONTAL_BOX, LINE_BOX
} from './constant'

export class BoxGrid extends ByteGrid {

	constructor(size: Size) {
		super(size)
	}

	render1(): string {
		const output: string[][] = []
		for (let y = 0 ; y < this.getHeight() ; y++) {
			output[y] = []
			for (let x = 0 ; x < this.getWidth() ; x++) {
				output[y][x] = BoxGrid.boxCharacter(this.read(x, y))
			}
		}
		return output.map((line) => line.join('')).join('\n')
	}

	static boxCharacter(value: number) {
		if (value & BOX) {
			const size = (value & 0x70) >> 4
			if (value & 1)
				return HORIZONTAL_BOX[size]
			else
				return VERTICAL_BOX[size]
		}
		else if (value & SHADE) {
			const shade = (value & 0x30) >> 4
			return SHADING[shade]
		}
		// Outline character
		else {
			const outline = value & 15
			return LINE_BOX[outline]
		}
	}

	drawHorizontalLine(x: number, y: number, width: number) {
		const intWidth = Math.floor(width)
		const size = Math.max(0, Math.min(8, Math.floor(8 * (width - intWidth))))
		for (let bx = x ; bx < x + intWidth ; bx++) {
			this.setBox(bx, y, 7, true)
		}
		if (size > 0)
			this.setBox(x + intWidth, y, size - 1, true)
	}

	drawVerticalLine(x: number, y: number, height: number) {
		const intHeight = Math.floor(height)
		const size = Math.max(0, Math.min(8, Math.floor(8 * (height - intHeight))))
		for (let by = y ; by > y - intHeight && by >= 0 ; by--) {
			this.setBox(x, by, 7, false)
		}
		if (size > 0 && y - intHeight >= 0)
			this.setBox(x, y - intHeight, size - 1, false)
	}

	drawOutline(area: Area) {
		const end_x = area.x + area.width - 1
		const end_y = area.y + area.height - 1

		// Draw horizontal lines and corners
		this.update(area.x, area.y, TOP | LEFT)
		this.update(area.x, end_y, BOTTOM | LEFT)
		for (let x = area.x + 1 ; x < end_x ; x++) {
			this.update(x, area.y, TOP)
			this.update(x, end_y, BOTTOM)
		}
		for (let y = area.y + 1 ; y < end_y ; y++) {
			this.update(area.x, y, LEFT)
			this.update(end_x, y, RIGHT)
		}
		this.update(end_x, area.y, TOP | RIGHT)
		this.update(end_x, end_y, BOTTOM | RIGHT)
	}

	drawInline(area: Area) {
		const end_x = area.x + area.width - 1
		const end_y = area.y + area.height - 1

		// Draw horizontal lines and corners
		this.update(area.x, area.y, SE)
		this.update(area.x, end_y, NE)
		for (let x = area.x + 1 ; x < end_x ; x++) {
			this.update(x, area.y, BOTTOM)
			this.update(x, end_y, TOP)
		}
		for (let y = area.y + 1 ; y < end_y ; y++) {
			this.update(area.x, y, RIGHT)
			this.update(end_x, y, LEFT)
		}
		this.update(end_x, area.y, SW)
		this.update(end_x, end_y, NW)
	}

	private setBox(x: number, y: number, value: number, horizontal: boolean) {
		this.write(x, y, BOX | (value << 4) | (horizontal ? 1 : 0))
	}

}

function test() {
	const grid = new BoxGrid({ width: 50, height: 20 })

	grid.drawVerticalLine(2, 10, 5)
	grid.drawVerticalLine(3, 10, 5.1)
	grid.drawVerticalLine(4, 10, 5.2)
	grid.drawVerticalLine(5, 10, 5.3)
	grid.drawVerticalLine(6, 10, 5.4)
	grid.drawVerticalLine(7, 10, 5.5)
	grid.drawVerticalLine(8, 10, 5.6)
	grid.drawVerticalLine(9, 10, 5.7)
	grid.drawVerticalLine(10, 10, 5.8)
	grid.drawVerticalLine(11, 10, 5.9)
	grid.drawVerticalLine(12, 10, 6.0)
	grid.drawVerticalLine(13, 10, 6.0)

	// grid.drawHorizontalLine(2, 1, 5)
	// grid.drawHorizontalLine(2, 2, 5.1)
	// grid.drawHorizontalLine(2, 3, 5.2)
	// grid.drawHorizontalLine(2, 4, 5.3)
	// grid.drawHorizontalLine(2, 5, 5.4)
	// grid.drawHorizontalLine(2, 6, 5.5)
	// grid.drawHorizontalLine(2, 7, 5.6)
	// grid.drawHorizontalLine(2, 8, 5.7)
	// grid.drawHorizontalLine(2, 9, 5.8)
	// grid.drawHorizontalLine(2, 10, 5.9)
	// grid.drawHorizontalLine(2, 11, 6)
	// grid.drawHorizontalLine(2, 12, 5.5)
	grid.drawOutline({ x: 0, y: 0, width: 50, height: 20 })
	grid.drawOutline({ x: 0, y: 0, width: 10, height: 20 })
	// grid.drawOutline({ x: 5, y: 2, width: 20, height: 8 })
	// grid.drawOutline({ x: 9, y: 0, width: 41, height: 20 })
	// grid.drawOutline({ x: 10, y: 1, width: 39, height: 18 })
	// grid.drawInline({ x: 10, y: 1, width: 39, height: 18 })
	console.log(grid.render1())
}

test()
