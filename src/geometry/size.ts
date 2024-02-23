import {
	Display,
	Size
} from '.'

export const fullScreen = () => ({
	width: process.stdout.columns,
	height: process.stdout.rows - 1
} as Size)

/**
 * A user size definition may
 */
export interface SizeStyle {
	width?: string | number
	height?: string | number
}

export function initialSize(display: Display, size: SizeStyle): Size {
	return {
		width: display.width,
		height: display.height
	}
}

export function finalSize(display: Display, size: SizeStyle): Display {

	return display
}
