// If box flag is set, uses next 3 bits to choose between 8 values for the
// horizontal or vertical amplitude of the box (bottom or left justified)
export const BOX = 128
export const SHADE = 64

export const VERTICAL_BOX = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']
export const HORIZONTAL_BOX = ['▏', '▎', '▍', '▌', '▋', '▊', '▉', '█']
export const SHADING = ['░','▒','▓','█']
export const LINE_BOX = [
	' ', '▘', '▝', '▀',
	'▖', '▌', '▞', '▛',
	'▗', '▚', '▐', '▜',
	'▄', '▙', '▟', '█'
]

export const LINE_CHAR = Buffer.from(
	' ╴╸═╷┐┑╕╻┒┓╕║╖╖╗╶─╾╾┌┬┭┭┎┰┱┭╓╥╥┱╺╼━╾┍┮┯┭┏┲┳┭╓╥╥┱═╼╼═╒┮┮╤╒┮┮╤╔┲┲╦' +
	'╵┘┙╛│┤┥╡╽┧┪╡╽┧┧┪└┴┵┵├┼┽┽┟╁╅┽┟╁╁╅┕┶┷┵┝┾┿┽┢╆╈┽┟╁╁╅╘┶┶╧╞┾┾╪╞┾┾╪┢╆╆╈' +
	'╹┚┛╛╿┦┩╡┃┨┫╡╽┧┧┪┖┸┹┵┞╀╃┽┠╂╉┽┟╁╁╅┗┺┻┵┡╄╇┽┣╊╋┽┟╁╁╅╘┶┶╧╞┾┾╪╞┾┾╪┢╆╆╈' +
	'║╜╜╝╿┦┦┩╿┦┦┩║╢╢╣╙╨╨┹┞╀╀╃┞╀╀╃╟╫╫╉╙╨╨┹┞╀╀╃┞╀╀╃╟╫╫╉╚┺┺╩┡╄╄╇┡╄╄╇╠╊╊╬', 'utf16le')

export const NORMAL = 1
export const BOLD = 2
export const DOUBLE = 3

// Direction
export const TOP = 3
export const BOTTOM = 12
export const RIGHT = 10
export const LEFT = 5
export const SE = 8
export const SW = 4
export const NE = 2
export const NW = 1
export const ALL_DIR = 15

// 1 2
// 3 4

// 0 - space
