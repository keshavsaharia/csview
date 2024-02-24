
// Top 4 bits are overwritten
const ROUNDED = 128
const NORMAL = 64
const BOLD = 32
const DOUBLE = 16
const ANY = ROUNDED | NORMAL | BOLD | DOUBLE
// Bottom 4 bits persist - flag for whether line is
// horizontal and/or vertical, and 2 bits for dash pattern
const VERTICAL = 8
const HORIZONTAL = 4
const DASH4 = 3
const DASH3 = 2
const DASH2 = 1

// 0 - rounded
// 1 - normal
// 2 - bold
// 3 - double
// 4 - thick
// 5 -

// + shaped kernels

const TOP = 0
const RIGHT = 1
const BOTTOM = 2
const LEFT = 3

// 2 directions
// 4 corners
// 4 T directions
// All directions

type DisplayKernels = [ number, DisplayKernel[] ]
type DisplayKernel = [ string, number[] ]

function main() {
	const table = resizeTable(50, 20)
	rectangle(table, NORMAL, 0, 0, 49, 19)
	rectangle(table, DOUBLE, 0, 0, 29, 19)
	rectangle(table, NORMAL, 0, 0, 19, 19)
	rectangle(table, DOUBLE, 10, 2, 19, 8)
	rectangle(table, NORMAL, 0, 0, 49, 19)
	rectangle(table, BOLD, 1, 12, 20, 5)
	rectangle(table, DOUBLE, 0, 0, 49, 10)
	rectangle(table, DOUBLE, 44, 2, 5, 7)
	console.log(tableRender(table))

	const hierarchy = resizeTable(50, 20)
	vertical(hierarchy, NORMAL, 1, 1, 10)
	horizontal(hierarchy, NORMAL, 1, 1, 3)
	horizontal(hierarchy, NORMAL, 2, 1, 3)
	horizontal(hierarchy, NORMAL, 3, 1, 4)
	vertical(hierarchy, NORMAL, 4, 3, 7)
	horizontal(hierarchy, NORMAL, 4, 4, 6)
	horizontal(hierarchy, NORMAL, 5, 4, 6)
	horizontal(hierarchy, NORMAL, 6, 4, 6)
	horizontal(hierarchy, NORMAL, 7, 4, 6)

	horizontal(hierarchy, NORMAL, 8, 1, 3)
	horizontal(hierarchy, NORMAL, 9, 1, 3)
	horizontal(hierarchy, NORMAL, 10, 1, 3)
	console.log(tableRender(hierarchy))
}

function resizeTable(width: number, height: number): Buffer[] {
	const table: Buffer[] = new Array(height)
	for (let y = 0 ; y < height ; y++)
		table[y] = Buffer.alloc(width).fill(0)
	return table
}

function rectangle(table: Buffer[], value: number, x: number, y: number, width: number, height: number) {
	vertical(table, value, x, y, y + height)
	horizontal(table, value, y, x, x + width)
	vertical(table, value, x + width, y, y + height)
	horizontal(table, value, y + height, x, x + width)
}

function horizontal(table: Buffer[], value: number, row: number, start: number, end: number) {
	if (row < 0 || row >= table.length)
		return

	const line = table[row]
	for (let x = start ; x <= end && x < line.length ; x++)
		line.writeUint8(value | HORIZONTAL | ((line.readUint8(x) & 0x0f)), x)
}

function vertical(table: Buffer[], value: number, col: number, start: number, end: number) {
	if (col < 0 || col >= table[0].length)
		return

	for (let y = start ; y <= end && y < table.length ; y++) {
		const line = table[y]
		line.writeUint8(value | VERTICAL | ((line.readUint8(col) & 0x0f)), col)
	}
}

function tableRender(table: Buffer[]) {
	const render: string[][] = []
	for (let y = 0 ; y < table.length ; y++) {
		render[y] = []
		for (let x = 0 ; x < table[y].length ; x++) {
			render[y][x] = tableChar(table, x, y) || ' '
		}
	}
	return render.map((line) => line.join('')).join('\n')
}

function tableChar(table: Buffer[], x: number, y: number): string | null {
	const value = tableValue(table, x, y)
	if (value == 0)
		return null

	// Find the first kernel that matches each directions corresponding table style
	const horizontal = (value & HORIZONTAL) > 0
	const vertical = (value & VERTICAL) > 0

	const dir = [
		vertical ? tableValue(table, x, y - 1, VERTICAL) : 0,
		horizontal ? tableValue(table, x + 1, y, HORIZONTAL) : 0,
		vertical ? tableValue(table, x, y + 1, VERTICAL) : 0,
		horizontal ? tableValue(table, x - 1, y, HORIZONTAL) : 0
	]

	for (const displayKernel of displayKernels) {
		const pattern = displayKernel[0]
		const match = pattern & value
		if (match > 0) {
			const matchKernel = displayKernel[1].find((kernel) => kernelMatch(kernel, dir))
			if (matchKernel)
				return matchKernel[0]
		}
	}
}

function kernelMatch(kernel: DisplayKernel, dir: number[]): boolean {
	return kernel[1].every((value, index) => (
		// If zero, corresponding direction must also be zero
		value == 0 ? dir[index] == 0 :
		// Any corresponding direction specification must match
		((value & dir[index]) > 0)))
}

function tableValue(table: Buffer[], x: number, y: number, dir: number = 0): number {
	if (y < 0 || y >= table.length || x < 0 || x >= table[0].length)
		return 0
	const value = table[y].readUint8(x)
	if (dir > 0 && ((value & dir) == 0))
		return 0
	return value
}

const displayKernels: DisplayKernels[] = [
	// Rounded corners
	[ ROUNDED, [
		['▢', [ 0, 0, 0, 0 ]],				// Empty single cell
		['╰', [ NORMAL, NORMAL, 0, 0 ]],
		['╯', [ NORMAL, 0, 0, NORMAL ]],
		['╭', [ 0, NORMAL, NORMAL, 0 ]],
		['╮', [0, 0, NORMAL, NORMAL]],
	]],

	// Straight dashed lines
	// [ BOLD | DASH4,   [ ['┋', [ BOLD, 0, BOLD, 0 ]],
	// 					['┉', [ 0, BOLD, 0, BOLD ]]]],
	// [ DASH4, 		  [ ['┊', [ NORMAL, 0, NORMAL, 0 ]],
	// 					['┈', [ 0, NORMAL, 0, NORMAL ]]]],
	// [ NORMAL | DASH3, [ ['┆', [ NORMAL, 0, NORMAL, 0 ]],
	// 					['┄', [ 0, NORMAL, 0, NORMAL ]]]],
	// [ BOLD | DASH3,   [ ['┇', [ BOLD, 0, BOLD, 0 ]],
	// 					['┅', [ 0, BOLD, 0, BOLD ]]]],
	// [ NORMAL | DASH2, [ ['╎', [ NORMAL, 0, NORMAL, 0 ]],
	// 					['╌', [ 0, NORMAL, 0, NORMAL ]]]],
	// [ BOLD | DASH2,   [ ['╏', [ BOLD, 0, BOLD, 0 ]],
	// 					['╍', [ 0, BOLD, 0, BOLD ]]]],

	// Normal to bold crossover lines
	[ NORMAL | BOLD, [
		['┖', [ BOLD, NORMAL, 0, 0 ]],	// Corners
		['┕', [ NORMAL, BOLD, 0, 0 ]],
		['┙', [ NORMAL, 0, 0, BOLD ]],
		['┚', [ BOLD, 0, 0, NORMAL ]],
		['┍', [ 0, BOLD, NORMAL, 0 ]],
		['┎', [ 0, NORMAL, BOLD, 0 ]],
		['┒', [ 0, 0, BOLD, NORMAL]],
		['┑', [ 0, 0, NORMAL, BOLD]],

		['┭', [ 0, NORMAL, NORMAL, BOLD ]],		// T's
		['┮', [ 0, BOLD, NORMAL, NORMAL ]],
		['┯', [ 0, BOLD, NORMAL, BOLD ]],
		['┰', [ 0, NORMAL, BOLD, NORMAL ]],
		['┱', [ 0, NORMAL, BOLD, BOLD ]],
		['┲', [ 0, BOLD, BOLD, NORMAL ]],
		['┥', [ NORMAL, 0, NORMAL, BOLD ]],
		['┦', [ BOLD, 0, NORMAL, NORMAL ]],
		['┧', [ NORMAL, 0, BOLD, NORMAL ]],
		['┨', [ BOLD, 0, BOLD, NORMAL ]],
		['┩', [ BOLD, 0, NORMAL, BOLD ]],
		['┪', [ NORMAL, 0, BOLD, BOLD ]],
		['┺', [ BOLD, BOLD, 0, NORMAL ]],
		['┹', [ BOLD, NORMAL, 0, BOLD ]],
		['┸', [ BOLD, NORMAL, 0, NORMAL ]],
		['┷', [ NORMAL, BOLD, 0, BOLD ]],
		['┶', [ NORMAL, BOLD, 0, NORMAL ]],
		['┵', [ NORMAL, NORMAL, 0, BOLD ]],
		['┝', [ NORMAL, BOLD, NORMAL, 0 ]],
		['┞', [ BOLD, NORMAL, NORMAL, 0 ]],
		['┟', [ NORMAL, NORMAL, BOLD, 0 ]],
		['┠', [ BOLD, NORMAL, BOLD, 0 ]],
		['┡', [ BOLD, BOLD, NORMAL, 0 ]],
		['┢', [ NORMAL, BOLD, BOLD, 0 ]],

		['╀', [ BOLD, NORMAL, NORMAL, NORMAL ]],
		['┾', [ NORMAL, BOLD, NORMAL, NORMAL ]],
		['╁', [ NORMAL, NORMAL, BOLD, NORMAL ]],
		['┽', [ NORMAL, NORMAL, NORMAL, BOLD ]],		// + hybrid across bold and normal

		['┿', [ NORMAL, BOLD, NORMAL, BOLD ]],			//
		['╂', [ BOLD, NORMAL, BOLD, NORMAL ]],
		['╄', [ BOLD, BOLD, NORMAL, NORMAL ]],
		['╆', [ NORMAL, BOLD, BOLD, NORMAL ]],
		['╅', [ NORMAL, NORMAL, BOLD, BOLD ]],
		['╃', [ BOLD, NORMAL, NORMAL, BOLD ]],

		['╈', [ NORMAL, BOLD, BOLD, BOLD ]],
		['╉', [ BOLD, NORMAL, BOLD, BOLD ]],
		['╇', [ BOLD, BOLD, NORMAL, BOLD ]],
		['╊', [ BOLD, BOLD, BOLD, NORMAL ]],
	]],

	// Hybrid from normal to double lines
	[ NORMAL | DOUBLE, [
		['╖', [ 0, 0, DOUBLE, NORMAL ]],		// Corners
		['╕', [ 0, 0, NORMAL, DOUBLE ]],
		['╜', [ DOUBLE, 0, 0, NORMAL ]],
		['╛', [ NORMAL, 0, 0, DOUBLE ]],
		['╙', [ DOUBLE, NORMAL, 0, 0 ]],
		['╘', [ NORMAL, DOUBLE, 0, 0 ]],
		['╓', [ 0, NORMAL, DOUBLE, 0 ]],
		['╒', [ 0, DOUBLE, NORMAL, 0 ]],
		['╥', [ 0, NORMAL, DOUBLE, NORMAL ]],
		['╤', [ 0, DOUBLE, NORMAL, DOUBLE ]],
		['╡', [ NORMAL, 0, NORMAL, DOUBLE ]],
		['╢', [ DOUBLE, 0, DOUBLE, NORMAL ]],
		['╨', [ DOUBLE, NORMAL, 0, NORMAL ]],
		['╧', [ NORMAL, DOUBLE, 0, DOUBLE ]],
		['╞', [ NORMAL, DOUBLE, NORMAL, 0 ]],
		['╟', [ DOUBLE, NORMAL, DOUBLE, 0 ]],
		['╪', [ NORMAL, DOUBLE, NORMAL, DOUBLE ]],	// four way
		['╫', [ DOUBLE, NORMAL, DOUBLE, NORMAL ]],
	]],

	// Normal lines
	[ NORMAL, [
		['□', [ 0, 0, 0, 0 ]],				// Empty
		['╵', [ NORMAL, 0, 0, 0 ]],			// Ends
		['╶', [ 0, NORMAL, 0, 0 ]],
		['╷', [ 0, 0, NORMAL, 0 ]],
		['╴', [ 0, 0, 0, NORMAL ]],
		['─', [ 0, ANY, 0, ANY ]],	// Lines
		['│', [ ANY, 0, ANY, 0 ]],
		['└', [ NORMAL, NORMAL, 0, 0 ]],	// Corners
		['┘', [ NORMAL, 0, 0, NORMAL ]],
		['┌', [ 0, NORMAL, NORMAL, 0 ]],
		['┐', [ 0, 0, NORMAL, NORMAL]],
		['┬', [ 0, ANY, ANY, ANY ]],	// T's
		['┤', [ ANY, 0, ANY, ANY ]],
		['┴', [ ANY, ANY, 0, ANY ]],
		['├', [ ANY, ANY, ANY, 0 ]],
		['┼', [ ANY, ANY, ANY, ANY ]],
	]],

	[ BOLD, [
		['▣', [ 0, 0, 0, 0 ]],				 // Empty
		['╹', [ BOLD, 0, 0, 0 ]],				 // Ends
		['╺', [ 0, BOLD, 0, 0 ]],
		['╻', [ 0, 0, BOLD, 0 ]],
		['╸', [ 0, 0, 0, BOLD ]],
		['━', [ 0, BOLD, 0, BOLD ]],			  // Lines
		['┃', [ BOLD, 0, BOLD, 0 ]],
		['╼', [ 0, BOLD, 0, NORMAL ]],		  // Transition lines to normal
		['╾', [ 0, NORMAL, 0, BOLD ]],
		['╽', [ NORMAL, 0, BOLD, 0 ]],
		['╿', [ BOLD, 0, NORMAL, 0 ]],
		['┗', [ BOLD, BOLD, 0, 0 ]],				// Corners
		['┛', [ BOLD, 0, 0, BOLD ]],
		['┓', [0, 0, BOLD, BOLD]],
		['┏', [ 0, BOLD, BOLD, 0 ]],
		['┳', [ 0, BOLD, BOLD, BOLD ]],			// T's
		['┫', [ BOLD, 0, BOLD, BOLD ]],
		['┻', [ BOLD, BOLD, 0, BOLD ]],
		['┣', [ BOLD, BOLD, BOLD, 0 ]],
		['╋', [ BOLD, BOLD, BOLD, BOLD ]],		// Plus
	]],

	[ DOUBLE, [
		['▣', [ 0, 0, 0, 0 ]],				  // Empty
		['║', [ ANY, 0, 0, 0 ]],			  // Ends
		['═', [ 0, ANY, 0, 0 ]],
		['║', [ 0, 0, ANY, 0 ]],
		['═', [ 0, 0, 0, ANY ]],
		['║', [ ANY, 0, ANY, 0 ]],		// Lines
		['═', [ 0, ANY, 0, ANY ]],
		['╚', [ DOUBLE, DOUBLE, 0, 0 ]],		// Corners
		['╝', [ DOUBLE, 0, 0, DOUBLE ]],
		['╔', [ 0, DOUBLE, DOUBLE, 0 ]],
		['╗', [ 0, 0, DOUBLE, DOUBLE ]],
		['╦', [ 0, DOUBLE, DOUBLE, DOUBLE ]],
		['╣', [ ANY, 0, ANY, ANY ]],
		['╩', [ ANY, ANY, 0, ANY ]],
		['╠', [ ANY, ANY, ANY, 0 ]],
		['╬', [ ANY, ANY, ANY, ANY ]]
	]],
]

main()
