import {
	Display
} from '../types'

export function getPadding(padding?: Array<number> | number) {
	if (padding == null)
		return equalPadding()
	else if (typeof padding === 'number')
		return equalPadding(padding)
	else if (padding.length == 0)
		return equalPadding()
	else if (padding.length == 1)
		return equalPadding(padding[0])
	else if (padding.length == 2)
		return padding.concat(padding)
	else if (padding.length == 3)
		return padding.concat([ 0 ])
	else if (padding.length == 4)
		return padding
	else
		return padding.slice(0, 4)
}

function equalPadding(value: number = 0) {
	return new Array(4).fill(value)
}

export function addPadding(padding: Array<number>, border: Array<number>) {
	border.forEach((dir, i) => {
		padding[i] += dir
	})
	return padding
}

export function insertPadding(display: Display, padding: Array<number>): Display {
	display.x += padding[3]
	display.y += padding[0]
	display.width = Math.max(0, display.width - padding[1] - padding[3])
	display.height = Math.max(0, display.height - padding[0] - padding[2])
	return display
}
