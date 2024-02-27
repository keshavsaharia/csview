import { ByteGrid } from '.'
import { Area } from './types'

/**
 *
 */
export class ColorGrid extends ByteGrid {

	/**
	 * Fill the area with the given foreground and background color
	 */
	fillColor(area: Area, foreground: number, background: number) {
		const value = ColorGrid.colorValue(foreground, background)
		this.fillArea(area, value)
	}

	fillForeground(area: Area, foreground: number) {
		this.fillAreaUpdate(area, foreground, 0x0f)
	}

	fillBackground(area: Area, background: number) {
		this.fillAreaUpdate(area, background << 4, 0xf0)
	}

	/**
	 *
	 */
	setColor(x: number, y: number, foreground: number, background: number) {
		if (! this.has(x, y)) return
		this.write(x, y, ColorGrid.colorValue(foreground, background))
	}

	/**
	 * Get the foreground and background value for the given x, y position
	 */
	getColor(x: number, y: number): [ number, number ] {
		const color = this.read(x, y)
		return [ color & 0x0f, (color & 0xf0) >> 4 ]
	}

	getForeground(x: number, y: number): number {
		return this.read(x, y) & 0x0f
	}

	getBackground(x: number, y: number): number {
		return (this.read(x, y) & 0xf0) >> 4
	}

	/**
	 * Create a single byte color specification.
	 */
	static colorValue(foreground: number, background: number = 0) {
		// Skip bit shift if background is 0
		if (background == 0)
			return foreground & 0x0f
		// Shift background value into upper 4 bits
		return ((background & 0x0f) << 4) | (foreground & 0x0f)
	}

}
