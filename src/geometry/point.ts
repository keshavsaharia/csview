import {
	Display,
	Point
} from '.'

export function displayPoint(point: Point, display?: Display) {
	if (display == null)
		return point
	return {
		x: Math.min(point.x + display.x, display.x + display.width),
		y: Math.min(point.y + display.y, display.y + display.height)
	}
}

export function originPoint() {
	return { x: 0, y: 0 }
}
