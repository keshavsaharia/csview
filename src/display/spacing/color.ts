import { within } from './inline'

export interface OutputColor {
	ansi?: number
	r?: number
	g?: number
	b?: number
	index?: number
}


function ansiColor(ansi: number, r: number, g: number, b: number): OutputColor {
	return {
		ansi,
		index: ((r * 6 / 256) * 36 + (g * 6 / 256) * 6 + (b * 6 / 256)) & 0xff,
		r, g, b
	}
}

export class Color {

	static black = 			ansiColor(30,   0,   0,   0)
	static red = 			ansiColor(31, 194,  54,  33)
	static green = 			ansiColor(32,  37, 188,  36)
	static yellow = 		ansiColor(33, 173, 173,  39)
	static blue = 			ansiColor(34,  73,  46, 225)
	static magenta = 		ansiColor(35, 211,  56, 211)
	static cyan = 			ansiColor(36,  51, 187, 200)
	static lightGray = 		ansiColor(37, 203, 204, 205)
	static gray = 			ansiColor(90, 129, 131, 131)
	static brightRed = 		ansiColor(91, 252,  57,  31)
	static brightGreen = 	ansiColor(92,  49, 231,  34)
	static brightYellow = 	ansiColor(93, 234, 236,  35)
	static brightBlue = 	ansiColor(94,  88,  51, 255)
	static brightMagenta = 	ansiColor(95, 249,  53, 248)
	static brightCyan = 	ansiColor(96,  20, 240, 240)
	static white = 			ansiColor(97, 233, 235, 235)

	static random(): OutputColor {
		const n = Math.floor(Math.random() * 8)
		switch (n) {
		case 0: 		return Color.black
		case 1: 		return Color.red
		case 2: 		return Color.green
		case 3: 		return Color.yellow
		case 4: 		return Color.blue
		case 5: 		return Color.magenta
		case 6: 		return Color.cyan
		case 7: 		return Color.lightGray
		default: 		return Color.white
		}
	}

}

export function isOutputColor(color: any): color is OutputColor {
	return color != null && typeof color === 'object' && ! Array.isArray(color) &&
		 (color.hasOwnProperty('ansi') ||
		 	(color.hasOwnProperty('r') && color.hasOwnProperty('g') && color.hasOwnProperty('b')))
}

export function getColorIndex(r: number, g: number, b: number): number {
	return ((r * 6 / 256) * 36 + (g * 6 / 256) * 6 + (b * 6 / 256)) & 0xff
}

export function addColorIndex(color: OutputColor): OutputColor {
	if (color.index == null && color.r != null && color.g != null && color.b != null)
		color.index = getColorIndex(color.r, color.g, color.b)
	return color
}

export function parseOutputColor(color: string | Array<number> | number): OutputColor | undefined {
	if (Array.isArray(color) && color.length >= 3) {
		return {
			r: within(color[0], 0, 255),
			g: within(color[1], 0, 255),
			b: within(color[2], 0, 255)
		}
	}
	else if (typeof color === 'string') {
		// TODO: parse CSS
	}
	else if (typeof color === 'number') {

	}
	return undefined
}
