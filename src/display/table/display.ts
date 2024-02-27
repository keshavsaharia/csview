const NORMAL = 1
const BOLD = 2
const DOUBLE = 3

const KERNEL: Array<[string, number, number, number, number]> = [
	// EMPTY
	[' ', 0, 0, 0, 0],

	// NORMAL
	['╵', NORMAL, 0, 0, 0 ],			// Ends
	['╶', 0, NORMAL, 0, 0 ],
	['╷', 0, 0, NORMAL, 0 ],
	['╴', 0, 0, 0, NORMAL ],
	['─', 0, NORMAL, 0, NORMAL ],	// Lines
	['│', NORMAL, 0, NORMAL, 0 ],
	['└', NORMAL, NORMAL, 0, 0 ],	// Corners
	['┘', NORMAL, 0, 0, NORMAL ],
	['┌', 0, NORMAL, NORMAL, 0 ],
	['┐', 0, 0, NORMAL, NORMAL],
	['┬', 0, NORMAL, NORMAL, NORMAL ],	// T's
	['┤', NORMAL, 0, NORMAL, NORMAL ],
	['┴', NORMAL, NORMAL, 0, NORMAL ],
	['├', NORMAL, NORMAL, NORMAL, 0 ],
	['┼', NORMAL, NORMAL, NORMAL, NORMAL ],
	// BOLD
	['╹', BOLD, 0, 0, 0 ],				 // Ends
	['╺', 0, BOLD, 0, 0 ],
	['╻', 0, 0, BOLD, 0 ],
	['╸', 0, 0, 0, BOLD ],
	['━', 0, BOLD, 0, BOLD ],			  // Lines
	['┃', BOLD, 0, BOLD, 0 ],
	['╼', 0, BOLD, 0, NORMAL ],		  // Transition lines to normal
	['╾', 0, NORMAL, 0, BOLD ],
	['╽', NORMAL, 0, BOLD, 0 ],
	['╿', BOLD, 0, NORMAL, 0 ],
	['┗', BOLD, BOLD, 0, 0 ],				// Corners
	['┛', BOLD, 0, 0, BOLD ],
	['┓',0, 0, BOLD, BOLD],
	['┏', 0, BOLD, BOLD, 0 ],
	['┳', 0, BOLD, BOLD, BOLD ],			// T's
	['┫', BOLD, 0, BOLD, BOLD ],
	['┻', BOLD, BOLD, 0, BOLD ],
	['┣', BOLD, BOLD, BOLD, 0 ],
	['╋', BOLD, BOLD, BOLD, BOLD ],		// Plus
	['┖', BOLD, NORMAL, 0, 0 ],	// Corners
	['┕', NORMAL, BOLD, 0, 0 ],
	['┙', NORMAL, 0, 0, BOLD ],
	['┚', BOLD, 0, 0, NORMAL ],
	['┍', 0, BOLD, NORMAL, 0 ],
	['┎', 0, NORMAL, BOLD, 0 ],
	['┒', 0, 0, BOLD, NORMAL],
	['┑', 0, 0, NORMAL, BOLD],
	['┭', 0, NORMAL, NORMAL, BOLD ],		// T's
	['┮', 0, BOLD, NORMAL, NORMAL ],
	['┯', 0, BOLD, NORMAL, BOLD ],
	['┰', 0, NORMAL, BOLD, NORMAL ],
	['┱', 0, NORMAL, BOLD, BOLD ],
	['┲', 0, BOLD, BOLD, NORMAL ],
	['┥', NORMAL, 0, NORMAL, BOLD ],
	['┦', BOLD, 0, NORMAL, NORMAL ],
	['┧', NORMAL, 0, BOLD, NORMAL ],
	['┨', BOLD, 0, BOLD, NORMAL ],
	['┩', BOLD, 0, NORMAL, BOLD ],
	['┪', NORMAL, 0, BOLD, BOLD ],
	['┺', BOLD, BOLD, 0, NORMAL ],
	['┹', BOLD, NORMAL, 0, BOLD ],
	['┸', BOLD, NORMAL, 0, NORMAL ],
	['┷', NORMAL, BOLD, 0, BOLD ],
	['┶', NORMAL, BOLD, 0, NORMAL ],
	['┵', NORMAL, NORMAL, 0, BOLD ],
	['┝', NORMAL, BOLD, NORMAL, 0 ],
	['┞', BOLD, NORMAL, NORMAL, 0 ],
	['┟', NORMAL, NORMAL, BOLD, 0 ],
	['┠', BOLD, NORMAL, BOLD, 0 ],
	['┡', BOLD, BOLD, NORMAL, 0 ],
	['┢', NORMAL, BOLD, BOLD, 0 ],
	['╀', BOLD, NORMAL, NORMAL, NORMAL ],
	['┾', NORMAL, BOLD, NORMAL, NORMAL ],
	['╁', NORMAL, NORMAL, BOLD, NORMAL ],
	['┽', NORMAL, NORMAL, NORMAL, BOLD ],		// + hybrid across bold and normal
	['┿', NORMAL, BOLD, NORMAL, BOLD ],			//
	['╂', BOLD, NORMAL, BOLD, NORMAL ],
	['╄', BOLD, BOLD, NORMAL, NORMAL ],
	['╆', NORMAL, BOLD, BOLD, NORMAL ],
	['╅', NORMAL, NORMAL, BOLD, BOLD ],
	['╃', BOLD, NORMAL, NORMAL, BOLD ],
	['╈', NORMAL, BOLD, BOLD, BOLD ],
	['╉', BOLD, NORMAL, BOLD, BOLD ],
	['╇', BOLD, BOLD, NORMAL, BOLD ],
	['╊', BOLD, BOLD, BOLD, NORMAL ],

	// Double
	['║', DOUBLE, 0, 0, 0 ],			  // Ends
	['═', 0, DOUBLE, 0, 0 ],
	['║', 0, 0, DOUBLE, 0 ],
	['═', 0, 0, 0, DOUBLE ],
	['║', DOUBLE, 0, DOUBLE, 0 ],		// Lines
	['═', 0, DOUBLE, 0, DOUBLE ],
	['╚', DOUBLE, DOUBLE, 0, 0 ],		// Corners
	['╝', DOUBLE, 0, 0, DOUBLE ],
	['╔', 0, DOUBLE, DOUBLE, 0 ],
	['╗', 0, 0, DOUBLE, DOUBLE ],
	['╦', 0, DOUBLE, DOUBLE, DOUBLE ],
	['╣', DOUBLE, 0, DOUBLE, DOUBLE ],
	['╩', DOUBLE, DOUBLE, 0, DOUBLE ],
	['╠', DOUBLE, DOUBLE, DOUBLE, 0 ],
	['╬', DOUBLE, DOUBLE, DOUBLE, DOUBLE ],
	['╖', 0, 0, DOUBLE, NORMAL ],		// Corners
	['╕', 0, 0, NORMAL, DOUBLE ],
	['╜', DOUBLE, 0, 0, NORMAL ],
	['╛', NORMAL, 0, 0, DOUBLE ],
	['╙', DOUBLE, NORMAL, 0, 0 ],
	['╘', NORMAL, DOUBLE, 0, 0 ],
	['╓', 0, NORMAL, DOUBLE, 0 ],
	['╒', 0, DOUBLE, NORMAL, 0 ],
	['╥', 0, NORMAL, DOUBLE, NORMAL ],
	['╤', 0, DOUBLE, NORMAL, DOUBLE ],
	['╡', NORMAL, 0, NORMAL, DOUBLE ],
	['╢', DOUBLE, 0, DOUBLE, NORMAL ],
	['╨', DOUBLE, NORMAL, 0, NORMAL ],
	['╧', NORMAL, DOUBLE, 0, DOUBLE ],
	['╞', NORMAL, DOUBLE, NORMAL, 0 ],
	['╟', DOUBLE, NORMAL, DOUBLE, 0 ],
	['╪', NORMAL, DOUBLE, NORMAL, DOUBLE ],	// four way
	['╫', DOUBLE, NORMAL, DOUBLE, NORMAL ]
];

function testing() {
	const char = new Array(256)
	for (let i = 0 ; i < KERNEL.length ; i++) {
		const kernel = KERNEL[i]
		const index = tableValue(kernel[1], kernel[2], kernel[3], kernel[4])
		char[index] = kernel[0]
	}

	for (let top = 0 ; top < 4 ; top++) {
		for (let right = 0 ; right < 4 ; right++) {
			for (let bottom = 0 ; bottom < 4 ; bottom++) {
				for (let left = 0 ; left < 4 ; left++) {
					const original = tableValue(top, right, bottom, left)
					let value = original
					// Convert bold to normal
					if (! char[value]) {
						value = tableValue(
							top == BOLD ? NORMAL : top,
							right == BOLD ? NORMAL : right,
							bottom == BOLD ? NORMAL : bottom,
							left == BOLD ? NORMAL : left)
					}
					// Convert double to bold
					if (! char[value]) {
						value = tableValue(
							top == DOUBLE ? BOLD : top,
							right == DOUBLE ? BOLD : right,
							bottom == DOUBLE ? BOLD : bottom,
							left == DOUBLE ? BOLD : left)
					}
					// Convert double to normal
					if (! char[value]) {
						value = tableValue(
							top == DOUBLE ? NORMAL : top,
							right == DOUBLE ? NORMAL : right,
							bottom == DOUBLE ? NORMAL : bottom,
							left == DOUBLE ? NORMAL : left)
						// value = tableValue(top & 1, right & 1, bottom & 1, left & 1)
					}
					if (value != original) {
						char[original] = char[value]
					}
					if (! char[value]) {
						console.log(top, right, bottom, left)
					}
				}
			}
		}
	}

	const buffer = Buffer.alloc(512)
	for (let i = 0 ; i < 256 ; i++) {
		Buffer.from(char[i] || 'X', 'utf16le').copy(buffer, i * 2)
	}
	// console.log(buffer.toString('utf16le'))

	// console.log(char.join(''))
	// console.log(char.length)
	const output = char.join('')
	console.log(output.substring(0, 64))
	console.log(output.substring(64, 128))
	console.log(output.substring(128, 192))
	console.log(output.substring(192))
}

function tableValue(top: number, right: number, bottom: number, left: number) {
	return (top << 6) | (right << 4) | (bottom << 2) | left
}

testing()
