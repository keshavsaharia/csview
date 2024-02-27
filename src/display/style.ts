import { Grid } from '.'
import { Area, Size } from './types'

export class StyleGrid extends Grid {

	private static FOREGROUND = 128
	private static BACKGROUND = 64
	private static COLOR = 128 | 64

	constructor(size: Size) {
		super(size, 2)
	}

	setStyle(x: number, y: number, value: number): this {
		this.setByte(x, y, 0, value)
		return this
	}

	/**
	 * Fill the area with the given foreground and background color
	 */
	fillColor(area: Area, foreground: number, background: number) {
		const value = StyleGrid.colorValue(foreground, background)
		for (let y = Math.max(area.y, 0) ; y < area.y + area.height && y < this.getHeight() ; y++) {
			for (let x = Math.max(area.x, 0) ; x < area.x + area.width && x < this.getWidth() ; x++) {
				this.setByte(x, y, 1, value)

				const flag = this.getByte(x, y, 0)
				if ((flag & StyleGrid.COLOR) == 0)
					this.setByte(x, y, 0, flag | StyleGrid.COLOR)
			}
		}
	}

	/**
	 *
	 */
	setColor(x: number, y: number, foreground: number, background: number) {
		if (! this.has(x, y)) return

		const flag = this.getByte(x, y, 0)
		this.setByte(x, y, 1, StyleGrid.colorValue(foreground, background))

		if ((flag & StyleGrid.COLOR) == 0)
			this.setByte(x, y, 0, flag | StyleGrid.COLOR)
	}

	/**
	 * Get the foreground and background value for the given x, y position
	 */
	getColor(x: number, y: number): [ number, number ] {
		const color = this.getByte(x, y, 1)
		return [ color & 0x0f, (color & 0xf0) >> 4 ]
	}

	getEscape(x: number, y: number): Buffer {
		const [ flag, color ] = this.getValue(x, y)
		return StyleGrid.escape(flag, color)
	}

	sameColor(x: number, y: number, x2: number, y2: number) {
		if (x == x2 && y == y2)
			return true

		const v1 = this.getValue(x, y)
		const v2 = this.getValue(x2, y2)
		return v1[0] == v2[0] && v1[1] == v2[1]
	}

	getForeground(x: number, y: number): number {
		return this.getByte(x, y, 1) & 0x0f
	}

	getBackground(x: number, y: number): number {
		return (this.getByte(x, y, 1) & 0xf0) >> 4
	}

	/**
	 * True if the given x, y position has a foreground and/or background
	 */
	hasColor(x: number, y: number): boolean {
		return (this.getByte(x, y, 0) & StyleGrid.COLOR) > 0
	}

	/**
	 * True if the given x, y position has a foreground
	 */
	hasForeground(x: number, y: number): boolean {
		return (this.getByte(x, y, 0) & StyleGrid.FOREGROUND) > 0
	}

	/**
	 * True if the given x, y position has a background
	 */
	hasBackground(x: number, y: number): boolean {
		return (this.getByte(x, y, 0) & StyleGrid.BACKGROUND) > 0
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

	/**
	 * Produces the ANSI escape sequence for applying the given style (encapsulated in two
 	 * bytes) to the current output cursor position.
	 */
	static escape(flag: number = 0, color: number = 0): Buffer {
		// Standard escape sequence to reset all styles and colors ( ESC[0 )
		const sequence: number[] = [27, 0, 91, 0, 48, 0]

		// Add color and background to initial specification
		if (flag & StyleGrid.FOREGROUND) {
			const foreground = color & 0x0f
			sequence.push(59, 0, (foreground >= 8) ? 57 : 51, 0)	// ;3 or ;9
			sequence.push(48 + (foreground & 7), 0)			// digit 0 - 7
		}
		// default with ;39
		else sequence.push(59, 0, 51, 0, 57, 0)

		if (flag & StyleGrid.BACKGROUND) {
			const background = (color & 0xf0) >> 4
			if (background >= 8)
				sequence.push(59, 0, 49, 0, 48, 0)	// ;10
			else
				sequence.push(59, 0, 52, 0)	// ;4
			sequence.push(48 + (background & 7), 0)	// digit 0 - 7
		}
		// default with ;49
		else sequence.push(59, 0, 52, 0, 57, 0)

		// Terminate initial sequence with m
		sequence.push(109, 0)

		// Iterate over each bit position controlling a style set
		if ((flag & 0x3f) > 0) {
			let bitMask = 1
			// The bit flag for each style type aligns with the escape code sequence, so the
			// formula 49 + index (where index is the bit's index in the 8 bit style state)
			// gives the ASCII number, with the exception of inverse (which is '7' instead of '6')
			for (let i = 0 ; i < 6 ; i++) {
				if (flag & bitMask)
					sequence.push(27, 0, 91, 0, i == 5 ? 55 : 49 + i, 0, 109, 0)
				bitMask = bitMask << 1
			}
		}
		return Buffer.from(sequence)
	}

}
