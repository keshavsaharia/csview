import { KernelState, KernelDefinition } from './types'

// Top 4 bits are overwritten
export const ROUNDED = 128
export const NORMAL = 64
export const BOLD = 32
export const DOUBLE = 16
export const DASHED = 8
export const FULL = 4
export const ANY = 0xfc

// Bottom 4 bits persist - flag for whether line is
// horizontal and/or vertical, and 2 bits for dash pattern
export const VERTICAL = 2
export const HORIZONTAL = 1

export const KERNEL_DEFINITION: KernelDefinition = [
	// Rounded corners
	[ ROUNDED, [
		['▢', [ 0, 0, 0, 0 ]],				// Empty single cell
		['╰', [ ANY, ANY, 0, 0 ]],
		['╯', [ ANY, 0, 0, ANY ]],
		['╭', [ 0, ANY, ANY, 0 ]],
		['╮', [0, 0, ANY, ANY]],
	]],

	// Straight dashed lines
	// [ BOLD | DASH4,   [ ['┋', [ ANY, 0, ANY, 0 ]],
	// 					['┉', [ 0, ANY, 0, ANY ]]]],
	// [ DASH4, 		  [ ['┊', [ ANY, 0, ANY, 0 ]],
	// 					['┈', [ 0, ANY, 0, ANY ]]]],
	[ BOLD | DASHED,   [ ['┇', [ BOLD, 0, BOLD, 0 ]],
						 ['┅', [ 0, BOLD, 0, BOLD ]]]],
	[ DASHED, 		   [ ['┆', [ NORMAL, 0, NORMAL, 0 ]],
					 	 ['┄', [ 0, NORMAL, 0, NORMAL ]]]],
	[ FULL, [ ['█', []] ] ],
	//
	// [ DASH2, 		  [ ['╎', [ NORMAL, 0, NORMAL, 0 ]],
	// 					['╌', [ 0, NORMAL, 0, NORMAL ]]]],
	// [ BOLD | DASH2,   [ ['╏', [ BOLD, 0, BOLD, 0 ]],
	// 					['╍', [ 0, BOLD, 0, BOLD ]]]],

	// Normal to bold crossover lines
	[ BOLD, [
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
	[ DOUBLE, [
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
		['╵', [ ANY, 0, 0, 0 ]],			// Ends
		['╶', [ 0, ANY, 0, 0 ]],
		['╷', [ 0, 0, ANY, 0 ]],
		['╴', [ 0, 0, 0, ANY ]],
		['─', [ 0, ANY, 0, ANY ]],	// Lines
		['│', [ ANY, 0, ANY, 0 ]],
		['└', [ ANY, ANY, 0, 0 ]],	// Corners
		['┘', [ ANY, 0, 0, ANY ]],
		['┌', [ 0, ANY, ANY, 0 ]],
		['┐', [ 0, 0, ANY, ANY]],
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

// Compile to array of bytes
export const KERNELS: KernelState = KERNEL_DEFINITION.map((kernels) => [
	kernels[0],
	kernels[1].map((kernel) => [
		Array.from(Buffer.from(kernel[0], 'utf16le')),
		kernel[1]
	])
])
