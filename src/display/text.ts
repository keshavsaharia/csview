import { Grid } from '.'
import { Size, Point } from './types'

export class TextGrid extends Grid {

	static SPACE = Buffer.from([32, 0])

	constructor(size: Size) {
		super(size, 2, [ 32, 0 ])
	}

	getChar(x: number, y: number): Buffer {
		if (! this.has(x, y))
			return TextGrid.SPACE
		return Buffer.from(this.getValue(x, y))
	}

	writeString(point: Point, value: string): this {
		const row = this.getRow(point.y)
		Buffer.from(value, 'utf16le').copy(row, point.x)
		return this
	}

}
