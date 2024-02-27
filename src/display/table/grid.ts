
import { ByteGrid } from '..'
import { Size } from '../types'

import {
	ROUNDED, NORMAL, BOLD, DOUBLE, DASHED, FULL, ANY,
	HORIZONTAL, VERTICAL, KERNELS
} from './constant'

export class TableGrid extends ByteGrid {

	// Top 4 bits are overwritten
	static ROUNDED = ROUNDED
	static NORMAL = NORMAL
	static BOLD = BOLD
	static DOUBLE = DOUBLE
	static DASHED = DASHED
	static FULL = FULL
	static ANY = ANY

	// Bottom 2 bits persist - flag for whether line is horizontal and/or vertical
	static VERTICAL = VERTICAL
	static HORIZONTAL = HORIZONTAL

	constructor(size: Size) {
		super(size)
	}

	private getTableValue(x: number, y: number, dir: number = 0) {
		if (! this.has(x, y))
			return 0
		const value = this.read(x, y)
		if (dir > 0 && ((value & dir) == 0))
			return 0
		return value
	}

	static displayValue(value: number, dir: number[]): number[] | null {
		for (const displayKernel of KERNELS) {
			const pattern = displayKernel[0]
			const match = pattern & value
			if (match > 0) {
				const kernels = displayKernel[1]
				const matchKernel = kernels.find((kernel) => kernel[1].every((value, index) => (
					// If zero, corresponding direction must also be zero
					value == 0 ? dir[index] == 0 :
					// Any corresponding direction specification must match
					((value & dir[index]) > 0))
				))
				if (matchKernel)
					return matchKernel[0]
			}
		}
		return null
	}

}
