import {
	Border
} from './interface'

function char(str: string): number {
	return Buffer.from(str, 'utf16le').readUint16LE(0)
}
function chars(str: string): Array<number> {
	const chars = Buffer.from(str, 'utf16le')

	return new Array(str.length).fill(0)
		.map((_, i) => chars.readUint16LE(i * 2))
}

const BORDER_KEY = [
	'top', 'right', 'bottom', 'left',
	'topLeft', 'topRight', 'bottomLeft', 'bottomRight',
	'joinLeft', 'joinRight', 'joinTop', 'joinBottom',
	'joinTopLeft', 'joinTopRight', 'joinBottomLeft', 'joinBottomRight'
]
function border(str: string): Border {
	const chars = Buffer.from(str, 'utf16le')
	const map: { [key: string]: number } = {}
	BORDER_KEY.forEach((key, i) => {
		if (i * 2 < chars.length)
			map[key] = chars.readUint16LE(i * 2)
	})
	return map as Border
}
// U+250x	─	━	│	┃	┄	┅	┆	┇	┈	┉	┊	┋	┌	┍	┎	┏
// U+251x	┐	┑	┒	┓	└	┕	┖	┗	┘	┙	┚	┛	├	┝	┞	┟
// U+252x	┠	┡	┢	┣	┤	┥	┦	┧	┨	┩	┪	┫	┬	┭	┮	┯
// U+253x	┰	┱	┲	┳	┴	┵	┶	┷	┸	┹	┺	┻	┼	┽	┾	┿
// U+254x	╀	╁	╂	╃	╄	╅	╆	╇	╈	╉	╊	╋	╌	╍	╎	╏
// U+255x	═	║	╒	╓	╔	╕	╖	╗	╘	╙	╚	╛	╜	╝	╞	╟
// U+256x	╠	╡	╢	╣	╤	╥	╦	╧	╨	╩	╪	╫	╬	╭	╮	╯
// U+257x	╰	╱	╲	╳	╴	╵	╶	╷	╸	╹	╺	╻	╼	╽	╾	╿

export const SPACE = char(' ')

// Rectangle borders
export const BORDER_DEFAULT = border('▁▏▔▕    ')
export const BORDER_THIN = border('─│─│┌┐└┘├┤┬┴┼┼┼┼')
export const BORDER_MIDDLE = border('─│─│┌┐└┘├┤┬┴┼┼┼┼')
export const BORDER_THICK = border('━┃━┃┏┓┗┛┣┫┳┻╋╋╋╋')
export const BORDER_THICK_THIN = border('━┃━┃┏┓┗┛┢┪┲┺╆╅╄╃')
export const BORDER_ROUNDED = border('─│─│╭╮╰╯├┤┬┴┼┼┼┼')
export const BORDER_DOUBLE = border('═║═║╔╗╚╝╠╣╦╩╬╬╬╬')
export const BORDER_DASHED = border('┄┆┄┆╔╗╚╝╠╣╦╩╬╬╬╬')

// Text styles for last 6 bits of style byte
export const BOLD = 		0b000001
export const DIM = 			0b000010
export const ITALIC = 		0b000011
export const UNDERLINE = 	0b000100
export const BLINK = 		0b001000
export const STRIKE = 		0b010000
export const CONCEAL = 		0b100000
