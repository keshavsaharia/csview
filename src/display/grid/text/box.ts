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
