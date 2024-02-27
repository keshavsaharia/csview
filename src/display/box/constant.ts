import { Grid } from '..'
import { Area, Size } from '../types'

// If box flag is set, uses next 3 bits to choose between 8 values for the
// horizontal or vertical amplitude of the box (bottom or left justified)
export const BOX = 128
export const SHADE = 64

export const VERTICAL_BOX = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
export const HORIZONTAL_BOX = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█']
export const SHADING = ['░','▒','▓','█']
export const LINE_BOX = [
	' ', '▘', '▝', '▀',
	'▖', '▌', '▞', '▛',
	'▗', '▚', '▐', '▜',
	'▄', '▙', '▟', '█'
]

// Direction
export const TOP = 3
export const BOTTOM = 12
export const RIGHT = 10
export const LEFT = 5
export const SE = 8
export const SW = 4
export const NE = 2
export const NW = 1
export const ALL_DIR = 15

// 1 2
// 3 4

// 0 - space


export class OutlineGrid extends Grid {

	constructor(size: Size) {
		super(size, 1)
	}

	drawOutline(area: Area) {
		const end_x = area.x + area.width
		const end_y = area.y + area.height

		// Draw horizontal lines and corners
		this.setUpdate(area.x, area.y, TOP | LEFT)
		this.setUpdate(area.x, end_y, BOTTOM | LEFT)
		for (let x = area.x + 1 ; x < end_x - 1 ; x++) {
			this.setUpdate(x, area.y, TOP)
			this.setUpdate(x, end_y, BOTTOM)
		}
		for (let y = area.y + 1 ; y < end_y - 1 ; y++) {
			this.setUpdate(area.x, y, LEFT)
			this.setUpdate(end_x, y, RIGHT)
		}
		this.setUpdate(end_x, area.y, TOP | RIGHT)
		this.setUpdate(end_x, end_y, BOTTOM | RIGHT)
	}

	drawInline() {

	}

	private setUpdate(x: number, y: number, direction: number) {
		this.setByte(x, y, 0, direction | this.getByte(x, y))
	}

}
