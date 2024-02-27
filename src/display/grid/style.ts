import { ByteGrid } from '.'
import { Area, Size } from './types'

export class StyleGrid extends ByteGrid {

	private static FOREGROUND = 128
	private static BACKGROUND = 64
	private static COLOR = 128 | 64

	constructor(size: Size) {
		super(size)
	}

	setStyle(x: number, y: number, value: number): this {
		this.write(x, y, value)
		return this
	}

	getEscape(x: number, y: number, color?: number): Buffer {
		return StyleGrid.escape(this.read(x, y), color)
	}

	/**
	 * Fill the area with the given foreground and background color
	 */
	fillColor(area: Area) {
		this.fillAreaUpdate(area, StyleGrid.COLOR)
	}

	fillForeground(area: Area) {
		this.fillAreaUpdate(area, StyleGrid.FOREGROUND)
	}

	fillBackground(area: Area) {
		this.fillAreaUpdate(area, StyleGrid.BACKGROUND)
	}

	/**
	 * True if the given x, y position has a foreground and/or background
	 */
	hasColor(x: number, y: number): boolean {
		return (this.read(x, y) & StyleGrid.COLOR) > 0
	}

	/**
	 * True if the given x, y position has a foreground
	 */
	hasForeground(x: number, y: number): boolean {
		return (this.read(x, y) & StyleGrid.FOREGROUND) > 0
	}

	/**
	 * True if the given x, y position has a background
	 */
	hasBackground(x: number, y: number): boolean {
		return (this.read(x, y) & StyleGrid.BACKGROUND) > 0
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
