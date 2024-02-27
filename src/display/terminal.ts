import { Cursor, TextGrid, StyleGrid } from '.'
import { Size, Point } from './types'

import { getNextKey } from './key/read'
import { KeyMap } from './key/types'

export class Terminal {
	size: Size
	viewport: Size
	offset: Point = { x: 0, y: 0 }

	text: TextGrid
	style: StyleGrid
	cursor: Cursor

	constructor(size?: Size) {
		this.fullScreen()
		this.size = size || this.viewport
		this.text = new TextGrid(this.size)
		this.style = new StyleGrid(this.size)
		this.cursor = new Cursor(0, 0)

		// Set output encoding for rendering
		process.stdout.setEncoding('utf16le')
		process.stdout.on('resize', function(this: Terminal) {
			this.resize(this.fullScreen())
			this.render()
		}.bind(this))
		console.clear()
	}

	resize(size: Size) {
		this.size = size
		this.text.resize(size)
		this.style.resize(size)
	}

	render() {
		this.cursor.hide()
		process.stdout.cork()
		process.stdout.write(Cursor.HOME)
		for (let view_y = 0 ; view_y < this.viewport.height ; view_y++) {
			// Move cursor and get display y position after offset
			// process.stdout.write(Cursor.movement(0, view_y))
			const y = view_y + this.offset.y
			if (y >= this.text.getHeight())
				break

			// Initial escape sequence to start row style
			let style_x = this.offset.x
			process.stdout.write(this.style.getEscape(style_x, view_y))

			for (let view_x = 0 ; view_x < this.viewport.width ; view_x++) {
				const x = view_x + this.offset.x
				if (x >= this.text.getWidth())
					break

				// If there is a change in style
				if (! this.style.sameColor(x, y, style_x, y)) {
					process.stdout.write(this.style.getEscape(x, y))
					style_x = x
				}
				process.stdout.write(this.text.getChar(x, y))
			}
			// Final escape to terminate output
			process.stdout.write(StyleGrid.escape())
			process.stdout.write(Cursor.nextLine())

			// process.stdout.write(this.text.getRow(y))
			// if (y + 1 < this.getHeight())
			// 	process.stdout.write('\n')
		}
		process.stdout.uncork()
		this.cursor.move()
		this.cursor.show()
	}

	/**
	 * Wait for a key press
	 */
	async nextKey(map: KeyMap<Terminal> = {}): Promise<string> {
		return getNextKey.call(this, map)
	}



	fullScreen(): Size {
		this.viewport = {
			width: process.stdout.columns + 1,
			height: process.stdout.rows
		}
		return this.viewport
	}

	getViewWidth() {
		return this.viewport.width
	}

	getWidth() {
		return this.size.width
	}

	getViewHeight() {
		return this.viewport.height
	}

	getHeight() {
		return this.size.height
	}

}
