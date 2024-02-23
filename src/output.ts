//// 	GEOMETRY
////	The geometry submodule provides internal functions for calculating points, areas, offsets,
//// 	and handling important rendering requirements.
import {
	Display,					// Output positioning
	Area, cropArea,	        	// For rendering 2D areas
	Size, fullScreen,			// Size descriptions for output
	Point, originPoint,			// 2D points
	inlineLength, inlineText,	// Text rendering
	inlineCursor
} from './geometry'

import {
	OutputColor
} from './style'

import {
	outputBuffer,
	outputLine
} from './buffer'

import {
	updateColorArea
} from './color'

import {
	updateChar,
	writeTextChar,
	resizeText,
	resizeTextRow
} from './text'

import {
	resizeUpdate,
	eachUpdate
} from './update'

/**
 * @class 	Output
 * @desc 	Controls a 2D area that is rendered to the console.
 */
export class Output {
	size: Size					// Output size
	cursor: Point				// Output cursor
	scroll: number				// Allows output to scroll down without rewriting past lines

	text: Array<Buffer>			// The text content of the window
	color: Array<Buffer>		// The foreground color of each cell in the 2D space
	background: Array<Buffer>   // The background color of each cell in the 2D space
	style: Array<Buffer>		// Style array
	update: Array<Buffer>		// Update bit for rendering progressive updates

	// Text flags
	private utf16 = true			// Whether to render in UTF16 or UTF8
	private charSize = 2			// Number of bytes for each character
	private charFill: number		// Fill empty spaces with space characters

    // Output character encoding
    private encoding: 'utf16le' | 'utf8'

	// Rendering flags
	private tty = true				// Whether output is rendered to a TTY terminal
	private depth = 1				// Color depth
	private colorSize = 1			// Number of bytes for color
	private alpha = false			// Whether to enable alpha channel for color
	private firstRender = true		// Whether this is the first time the window is being rendered
	private shouldRender = true		// If new content was written on this window after rendering, flag will be set to true

    /**
     *
     * @param size
     * @param option
     */
	constructor(size: Size = fullScreen(), option: {
		utf8?: boolean
		live?: boolean
		alpha?: boolean
	} = {}) {
		// Initialize flags from standard output settings
		this.tty = process.stdout.isTTY
		this.depth = this.tty ? process.stdout.getColorDepth() : 1
		this.alpha = option.alpha || false
		this.utf16 = option.utf8 !== true

        // Color width is number of bytes to store output colors
		// true color would require 3 bytes for R, G, B plus possible byte for A
		this.colorSize = Math.ceil(this.depth / 8) + (this.alpha ? 1 : 0)

        // Character encoding
        this.charSize = this.utf16 ? 2 : 1
		this.encoding = this.utf16 ? 'utf16le' : 'utf8'
		this.charFill = this.utf16 ? 0x2000 : 0x20

        // Initialize size and positioning
		this.setSize(size)
		this.cursor = originPoint()
		this.scroll = 0
	}

    /**
     * Set the size of this output
     *
     * @param size
     */
    setSize(size: Size) {
        // Update size for each 2D array type
		this.text = resizeText(this.text, size.width, size.height, this.charSize, this.charFill, this.utf16)
        this.setColorSize(size)
		this.update = resizeUpdate(this.update, size.width, size.height)
        this.size = size
    }

    /**
     * Set the size of the color, background, and style arrays of Buffers.
     * @param size
     */
    private setColorSize(size: Size) {
        // Initialize color/background/style arrays on initial sizing
        if (! this.color) {
            this.color = new Array(size.height)
            this.background = new Array(size.height)
            this.style = new Array(size.height)
        }

        // Bytes per color state for each cell on the 2D space
        const colorWidth = size.width * this.colorSize

		// Initialize each row with a new buffer in each 2D space array
		for (let y = 0 ; y < size.height ; y++) {

			// Create the text area and initialize with character if already set
            const colorLine = this.color[y]
            if (colorLine) {
                const backgroundLine = this.background[y]
                const styleLine = this.style[y]

                // If the color array needs to be resized down, take a subarray for each color/style buffer
                if (colorLine.length > colorWidth) {
                    this.color[y] = colorLine.subarray(0, colorWidth)
                    this.background[y] = backgroundLine.subarray(0, colorWidth)
                    this.style[y] = styleLine.subarray(0, size.width)
                }
                // If the text line needs to be resized up
                // Copy into resized buffer
                else if (colorLine.length < colorWidth) {
                    colorLine.copy(this.color[y] = Buffer.alloc(colorWidth))
                    backgroundLine.copy(this.background[y] = Buffer.alloc(colorWidth))
                    styleLine.copy(this.style[y] = Buffer.alloc(size.width))
                }
            }
            // Initialize text buffer
			else {
                this.color[y] = Buffer.alloc(colorWidth)
			    this.background[y] = Buffer.alloc(colorWidth)
			    this.style[y] = Buffer.alloc(size.width)
            }
		}

        // If there is an existing size initialized that has more rows than the new
        // initialized height, remove the extra rows
        if (this.color.length > size.height) {
            const remove = this.color.length - size.height
            this.color.splice(size.height, remove)
            this.background.splice(size.height, remove)
            this.style.splice(size.height, remove)
        }
    }

	/**
	 * @func 	write
	 * @desc 	Write a string to output at the given display specification
	 */
	write(text: string, display: Display, color?: OutputColor): number {
		// If this text cannot be rendered
		if (inlineLength(display, text) == 0)
			return 0

		// Calculate cursor position and ensure the calculated position is
		// within the window width
		const cursor = inlineCursor(display)
		if (display.x + cursor >= this.size.width)
			return 0

		// Horizontal space remaining, and the total line offset
		const space = display.width - cursor
		const line = Math.floor(display.offset / display.width)

		// Get output arrays and validate line number is visible
		const output = this.text[display.y + line]
		const update = this.update[display.y + line]
		if (! output) return 0

		// Set flags and color state of the display area
		this.shouldRender = true
        if (color)
            this.setColor(color, display)

		const sequence = Buffer.from(inlineText(display, text), this.utf16 ? 'utf16le' : 'utf8')
        const x = display.x + cursor

        // Iterate over sequence and set update bits into a full byte before updating
        let updateByte = 0
        let startBit = x % 8
        const startIndex = x * this.charSize

        // Iterate over characters in groups of 8, and iterate over characters within the group
        // with the bit index to write into the update byte
        for (let char = 0 ; char < space ; char += 8) {
            // Start first iteration with a bit shift which is set to 0 for subsequent iterations
            for (let bit = startBit ; bit < 8 ; bit++) {

                // Get indexes to compare sequence against buffer
                const index = (char + bit - startBit) * this.charSize
                const bufferIndex = startIndex + index

                // Terminate loop and set update byte
                if (index >= sequence.length || bufferIndex >= output.length) {
                    // Shift update byte by remaining bits to align properly
                    updateByte = updateByte << (7 - bit)
                    break
                }

                // If there is a new byte to write into the buffer, add it
                // and set the update bit for this byte
                const newChar = sequence.readUint16LE(index)
                if (output.readUint16LE(bufferIndex) != newChar) {
                    output.writeUint16LE(newChar, bufferIndex)
                    updateByte = updateByte | 1
                }

                // If not last bit, shift the update byte to make space for the next bit
                if (bit != 7)
                    updateByte = updateByte << 1
            }

            // Write the update byte into the buffer if there was an update
            if (updateByte > 0) {
                const updateIndex = Math.floor((x + char - startBit) / 8)
                update.writeUint8(update.readUint8(updateIndex) | updateByte, updateIndex)
            }

            // Stop offsetting bits after first iteration and compensate for missed bytes
            if (startBit > 0) {
                char -= startBit
                startBit = 0
            }
            // Reset update byte
            updateByte = 0
        }

        // Return output text space
        return space
	}

	/**
	 * @func 	writeChar
	 * @desc 	Write a character to output
	 */
	writeChar(char: number, x: number, y: number): boolean {
		return updateChar(
			this.text[y],
			this.update[y],
			char,
			x,
			this.charSize,
			this.utf16
		)
	}

	/**
	 * Sets the color in the given area to the designated output color.
	 */
	setColor(color: OutputColor, area: Area) {
		updateColorArea(
            this.color,
            this.style,
            this.update,
            color,
            cropArea(area, this.size), false, // background flag
            this.depth, this.colorSize
        )
	}

	setBackground(color: OutputColor, area: Area) {
		updateColorArea(
            this.background,
            this.style,
            this.update,
            color,
            cropArea(area, this.size), true, // background flag set to true
            this.depth,
            this.colorSize
        )
	}

	/**
	 * Debug function for showing the color value at each position
	 */
	renderColor() {
		const debug: Array<string> = []
		for (let y = 0 ; y < this.size.height ; y++) {
			for (let x = 0 ; x < this.size.width ; x++) {
				const color = this.color[y].readUintLE(x * this.colorSize, this.colorSize)
				if (color != 0 && this.colorSize == 1) {
					debug.push('\u001b[38;5;', color.toString(), 'm█\u001b[0m')
				}
				else
					debug.push(this.text[y].subarray(x * 2, x * 2 + 2).toString('utf16le'))
			}
			debug.push('\n')
		}
		console.log(debug.join(''))
	}

	/**
	 * Debug function for showing update matrix
	 */
	renderUpdate() {
		console.clear()
		const debug: Array<string> = ['\u001b[0m']
		for (let x = 0 ; x < this.size.width ; x += 8)
			debug.push('___.___|')
		debug.push('\n')
		for (let y = 0 ; y < this.size.height ; y++) {
			for (let x = 0 ; x < this.size.width ; x += 8) {
				let update = this.update[y].readUint8(Math.floor(x / 8))

				for (let bit = 0 ; bit < 8 ; bit++) {
					const index = (x + bit) * 2
					const display = (x + bit < this.size.width) ? this.text[y].subarray(index, index + 2).toString('utf16le') : ' '
					if ((update & 128) != 0) {
						debug.push('\u001b[48;5;2m', display, '\u001b[0m')
					}
					else debug.push('\u001b[48;5;8m', display, '\u001b[0m')

					update = update << 1
				}
			}
			debug.push('\n')
		}
		console.log(debug.join(''))
	}

	/**
	 * Run a frame of rendering
	 */
	render() {
		if (this.firstRender) {
			this.firstRender = false
			this.getCursorPosition().then((cursor) => {
				this.cursor = cursor
				process.stdout.setEncoding(this.encoding)
				if (cursor.y + this.size.height >= process.stdout.rows) {
					console.log(new Array(this.size.height).fill('\n').join(''))
					this.cursor.y = process.stdout.rows - this.size.height - 2
				}
				this.renderUpdates()

			})
			.catch((error) => {
				console.clear()
				this.renderUpdates()
			})
		}
		else this.renderUpdates()
	}

	private renderUpdates() {
		for (let y = 0 ; y < this.size.height ; y++) {
			eachUpdate(this.update[y], this.size.width, (start, end) => {
				this.renderLine(start, end, y)
			})
		}
		this.moveCursor(0, this.cursor.y + this.size.height)
	}

	moveCursor(x: number, y: number) {
		process.stdout.write(Buffer.concat([
			Buffer.from([0x1b, 0x00, 0x5b, 0x00]),
			Buffer.from([y + 1, ';', x + 1, 'H'].join(''), 'utf16le')
		]))
	}

	async getCursorPosition() {
		return new Promise((resolve: (cursor: Point) => any, reject) => {
			process.stdin.once('readable', () => {
				const buffer = process.stdin.read()
				process.stdin.setRawMode(false)
				if (! Buffer.isBuffer(buffer))
					reject(new Error('Invalid input response for getting cursor position'))

				// Receive an escape sequence with the cursor position
				if (buffer.readUint8(0) == 0x1b && buffer.readUint8(1) == 0x5b) {
					// Get the string position
					const pos = buffer.slice(2, buffer.length - 1).toString('utf8')
					const semicolon = pos.indexOf(';')
					if (semicolon < 0)
						reject(new Error('Invalid position "' + pos.toString() + '"'))

					// Parse position from string, where row;col -> y;x
					const x = parseInt(pos.substring(semicolon + 1)) - 1
					const y = parseInt(pos.substring(0, semicolon)) - 1
					if (isNaN(x) || isNaN(y))
						reject(new Error('Invalid position "' + pos.toString() + '"'))

					resolve({ x, y })
				}
				// TODO: reject error cases
				else reject(buffer)
			})
			process.stdin.setRawMode(true)
			process.stdout.write(Buffer.from([0x1b, 0x5b, 0x36, 0x6e ]), 'utf8')
		})
	}

	private renderLine(start: number, end: number, y: number) {
		if (! this.text[y])
			return

		outputLine(
			this.text[y],
			this.color[y],
			this.background[y],
			this.style[y],
			start,
			end,
			y,
			this.utf16,
			this.charSize,
			this.depth,
			this.colorSize,
			this.cursor
		)
	}

	toBuffer() {
		return outputBuffer(this.text, {
			utf16: this.utf16
		})
	}

	toString() {
		return this.toBuffer().toString(this.utf16 ? 'utf16le' : 'utf8')
	}

	getDisplay(): Display {
		return {
			x: 0,
			y: 0,
			width: this.size.width,
			height: this.size.height,
			offset: 0
		}
	}

	isColorDepth(depth: number) {
		return this.depth == depth
	}

	getTextSize() {
		return this.charSize
	}

	getColorDepth() {
		return this.depth
	}

	getColorSize() {
		return this.colorSize
	}

	copy() {
		// TODO create new buffer
	}
}
