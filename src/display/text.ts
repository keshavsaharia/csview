import { Grid, StyleGrid } from '.'
import { Point, Size } from './types'

import { cursorToOrigin, hideCursor, showCursor, moveCursor } from './cursor'
import { Key, KeyMap, KEY_MAP } from './constant'

export class TextGrid extends Grid {

	style: StyleGrid

	constructor(size: Size) {
		super(size, 2, [ 0, 32 ])
	}

	resize(size: Size) {
		super.resize(size)
		if (! this.style)
			this.style = new StyleGrid(size)
		this.style.resize(size)
		return this
	}

	render() {
		process.stdout.setEncoding('utf16le')
		process.stdout.cork()
		process.stdout.write(cursorToOrigin())
		// process.stdout.write(hideCursor())
		for (let y = 0 ; y < this.getHeight() ; y++) {

			process.stdout.write(this.getRow(y))
			// if (y + 1 < this.getHeight())
			// 	process.stdout.write('\n')
		}
		process.stdout.uncork()
	}

	/**
	 * Get cursor position
	 */
	async cursorPosition(): Promise<Point> {
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
			process.stdout.setEncoding('utf16le')
			process.stdout.write(Buffer.from([0, 0x1b, 0, 0x5b, 0, 0x36, 0, 0x6e ]), 'utf16le')
		})
	}

	/**
	 * Wait for a key press
	 */
	async getKeyPress(map: KeyMap = {}): Promise<string> {
		return new Promise((resolve: (key: string) => any) => {
			process.stdin.setRawMode(true)
			process.stdin.setEncoding('utf8')

			process.stdin.once('data', (data: string) => {
				process.stdin.setRawMode(false)

				const hex = Buffer.from(data, 'utf8').toString('hex')
				const specialKey = KEY_MAP[hex]

				if (specialKey && map[specialKey]) {
					try {
						map[specialKey](data)
					}
					catch (e) {}
					resolve(specialKey)
				}
				else if (specialKey == 'exit') {
					console.clear()
					process.exit()
				}
				else resolve(data)
			})
		})
	}

}

async function main() {
	const text = new TextGrid({ width: process.stdout.columns, height: process.stdout.rows })
	// text.setStringValue(0, 0, 'A')
	// text.setStringValue(text.getWidth() - 1, 0, 'B')
	// text.setStringValue(text.getWidth() - 1, text.getHeight() - 1, 'C')
	// text.setStringValue(0, text.getHeight() - 1, 'D')
	text.render()

	const BACKSPACE = Buffer.from([ 0x7f ])
	const ESCAPE = Buffer.from([ 0x1b ])
	const ENTER = Buffer.from([ 0x0d ])
	const TAB = Buffer.from([ 0x09 ])
	const UP = Buffer.from([ 0x1b, 0x5b, 0x41 ])
	const DOWN = Buffer.from([ 0x1b, 0x5b, 0x42 ])
	const RIGHT = Buffer.from([ 0x1b, 0x5b, 0x43 ])
	const LEFT = Buffer.from([ 0x1b, 0x5b, 0x44 ])

	let x = 1, y = 1
	process.stdout.write(moveCursor(x, y))
	// process.stdout.write(showCursor())
	while (true) {
		const key = await text.getKeyPress({
			backspace() {
				x--
				text.setStringValue(x, y, ' ')
			},
			enter() {
				x = 1
				y++
			},
			tab() {
				x += 4
			},
			left() {
				x--
			},
			right() {
				x++
			},
			up() {
				y--
			},
			down() {
				y++
			}
		})
		if (key.length == 1) {
			text.setStringValue(x, y, key)
			x++
		}
		text.render()
		process.stdout.write(moveCursor(x, y))
	}

	// console.log('key', key)
}

main()
