import {
	Area,
	Point,
	Size,
	Display
} from '.'

export function cropArea(area: Area, size: Size) {
	if (area.x >= 0 && area.width >= 0 && area.x + area.width <= size.width &&
		area.y >= 0 && area.height >= 0 && area.y + area.height <= size.height)
		return area

	const x = Math.max(area.x, 0)
	const y = Math.max(area.y, 0)
	const width = Math.min(area.width, size.width - x)
	const height = Math.min(area.height, size.height - y)

	return {
		x, y, width, height
	}
}

export function inlineDisplayArea(display: Display): Area {
	const cursor = display.offset % display.width
	const line = Math.floor(display.offset / display.width)

	return {
		x: display.x + cursor,
		y: display.y + line,
		width: (display.length || 0), //display.width - cursor,
		height: 1
	}
}
