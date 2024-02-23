import {
	Output,
	Display
} from '..'

import {
	Style,
	Border,
	OutputBorder
} from './interface'

import {
	BORDER_DEFAULT,
	BORDER_ROUNDED,
	BORDER_THIN,
	BORDER_THICK,
	BORDER_DOUBLE,
	BORDER_THICK_THIN
} from './constant'

// function getBoxStyle(size: Style): Border {
// 	switch (size.boxStyle) {
// 		case 'double': 		return BORDER_DOUBLE
// 		case 'round':
// 		case 'rounded': 	return BORDER_ROUNDED
// 		case 'thick': 		return BORDER_THICK
// 		case 'thin': 		return BORDER_THIN
// 		default:	 		return BORDER_DEFAULT
// 	}
// }

export function renderBorder(output: Output, display: Display, border: OutputBorder) {
	const startX = display.x,
		  startY = display.y,
		  endX = display.x + display.width,
		  endY = display.y + display.height

	if (border.dir[0] || border.dir[2])
		for (let x = startX + border.left ; x < endX - border.right ; x++) {
			if (border.dir[0])
				output.writeChar(border.dir[0], x, startY)
			if (border.dir[2])
				output.writeChar(border.dir[2], x, endY - border.bottom)
		}
	if (border.dir[1] || border.dir[3])
		for (let y = startY + border.top ; y < endY - border.bottom ; y++) {
			if (border.dir[3])
				output.writeChar(border.dir[3], startX, y)
			if (border.dir[1])
				output.writeChar(border.dir[1], endX - border.right, y)
		}

	// Corner characters
	if (border.corner[0])
		output.writeChar(border.corner[0], startX, startY)
	if (border.corner[1])
		output.writeChar(border.corner[1], endX - border.right, startY)
	if (border.corner[2])
		output.writeChar(border.corner[2], endX - border.right, endY - border.top)
	if (border.corner[3])
		output.writeChar(border.corner[3], startX, endY - border.top)
}

// export function getBorder(size: Style): Border {
// 	// Get the initial border style
// 	const borderStyle = getBorderStyle(size)
// 	const border = parseBorder(size.border)
// 	const style = toggleBorder(borderStyle, border)
//  	return size.join ? joinBorder(style, parseBorder(size.join)) : style
// }

export function toggleBorder(style: Border, border: Array<boolean>): Border {
	if (border.every((dir) => dir))
		return Object.assign({}, style)

	return {
		...style,
		left: border[3] ? style.left : 0,
		right: border[1] ? style.right : 0,
		top: border[0] ? style.top : 0,
		bottom: border[2] ? style.bottom : 0,
		topLeft: (border[0] && border[3]) ? style.topLeft : 0,
		topRight: (border[0] && border[1]) ? style.topRight : 0,
		bottomLeft: (border[2] && border[3]) ? style.bottomLeft : 0,
		bottomRight: (border[2] && border[1]) ? style.bottomRight : 0
	}
}

function joinBorder(style: Border, join: Array<boolean>): Border {
	if (join.every((dir) => !dir))
		return style

	if (join[0]) {
		style.topLeft = join[3] ? style.joinTopLeft : style.joinLeft
		style.topRight = join[1] ? style.joinTopRight : style.joinRight
	}
	if (join[1]) {
		style.topRight = join[0] ? style.joinTopRight : style.joinTop
		style.bottomRight = join[2] ? style.joinBottomRight : style.joinBottom
	}
	if (join[2]) {
		style.bottomLeft = join[3] ? style.joinBottomLeft : style.joinLeft
		style.bottomRight = join[1] ? style.joinBottomRight : style.joinRight
	}
	if (join[3]) {
		style.topLeft = join[0] ? style.joinTopLeft : style.joinTop
		style.bottomLeft = join[2] ? style.joinBottomLeft : style.joinBottom
	}
	return style
}

export function getOutputBorder(style: Style): OutputBorder | null {
	if (style.border == null)
		return null
	else {
		const border = parseBorder(style.border)
		if (border != null && border.some((dir) => (dir > 0)))
			return createOutputBorder(border)
		return null
	}
}

const TOP_DIR: Array<number | null> = 		[null, 9601, 9604, 9608]
const BOTTOM_DIR: Array<number | null> = 	[null, 9620, 9600, 9608]
const LEFT_DIR: Array<number | null> = 		[null, 9621, 9616, 9608]
const RIGHT_DIR: Array<number | null> = 	[null, 9615, 9612, 9608]

const CORNER: Array<Array<number | null>> = [
	[],
	[null, null, null, null],
	[9623, 9622, 9629, 9624],
	[9608, 9608, 9608, 9608]
]


function createOutputBorder(width: Array<number>): OutputBorder {
	width = width.map((w) => Math.max(0, Math.min(w, 3)))

	const top = width[0], bottom = width[2],
		  right = width[1], left = width[3]

	const border: OutputBorder = {
		width,
		dir: [
			TOP_DIR[top] || null,
			RIGHT_DIR[right] || null,
			BOTTOM_DIR[bottom] || null,
			LEFT_DIR[left] || null
		],
		corner: [
			(left < top ? LEFT_DIR[left] : CORNER[top][0]) || null,
			(right < top ? RIGHT_DIR[right] : CORNER[top][1]) || null,
			CORNER[bottom][3] || null,
			CORNER[bottom][2] || null
		],
		top: Math.min(top, 1),
		bottom: Math.min(bottom, 1),
		left: Math.min(left, 1),
		right: Math.min(right, 1)
	}

	return border
}

export function createInputBorder(style: Style): OutputBorder {
	return {
		width: [1, 1, 1, 1],
		dir: [ 9472, 9474, 9472, 9474 ],
		corner: [ 9581, 9582, 9583, 9584 ],
		top: 1,
		bottom: 1,
		left: 1,
		right: 1
	}
}

function parseBorderValue(value?: number | boolean | null) {
	if (value == null)
		return 0
	return (typeof value === 'number') ? value : (value ? 1 : 0)
}

export function parseBorderPadding(border?: Array<number | boolean> | string | boolean): Array<number> {
	return parseBorder(border).map((dir) => Math.min(dir, 1))
}

export function parseBorder(border?: Array<number | boolean> | string | boolean): Array<number> {
	if (border == null)
		return equalBorder()
	if (typeof border === 'boolean')
		return equalBorder(parseBorderValue(border))
	if (typeof border === 'string')
		return stringBorder(border)
	// Most common case
	if (border.length == 4)
		return border.map((dir) => parseBorderValue(dir))
	// Adjust lengths of shorter CSS-style border descriptors
	if (border.length == 0)
		return equalBorder()
	if (border.length == 1)
		return equalBorder(parseBorderValue(border[0]))
	if (border.length == 2)
		return border.concat(border).map((dir) => parseBorderValue(dir))
	if (border.length == 3)
		return border.concat([ 0 ]).map((dir) => parseBorderValue(dir))
	// Shorten array that is too long
	return border.slice(0, 4).map((dir) => parseBorderValue(dir))
}

const BORDER_INDEX: { [key: string]: number } = { top: 0, right: 1, bottom: 2, left: 3 }
function stringBorder(direction: string): Array<number> {
	const border = equalBorder()
	direction.split(' ').forEach((dir) => {
		const index = BORDER_INDEX[dir]
		if (index != null)
			border[index] = 1
	})
	return border
}

function equalBorder(value: number = 0) {
	return new Array(4).fill(value)
}
