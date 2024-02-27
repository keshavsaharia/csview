import { Cursor, TextGrid, StyleGrid, ColorGrid } from '.'
import { Size, Point, Area } from './types'

import { KeyEvent } from './key/event'
import { KeyEventMap } from './key/types'

export class Terminal {
	size: Size
	area: Area
	offset: Point = { x: 0, y: 0 }

	text: TextGrid
	style: StyleGrid
	color: ColorGrid
	cursor: Cursor

	// Cache handlers for removing from process on termination
	resizeHandler?: (this: Terminal, ...args: any[]) => void

	constructor(size: Size = Terminal.fullScreen()) {
		this.size = size
		this.area = { x: 0, y: 0, ...size }

		// Byte grids
		this.text = new TextGrid(this.size, ' ')
		this.style = new StyleGrid(this.size)
		this.color = new ColorGrid(this.size)
		this.cursor = new Cursor(0, 0)

		this.start()
	}

	resize(size: Size) {
		this.size = size
		this.text.resize(size)
		this.style.resize(size)
		this.color.resize(size)
	}

	writeString(output: string, position: Point = this.cursor) {
		this.text.writeString(position.x, position.y, output)
	}

	fillColor(area: Area, foreground: number, background: number) {
		this.style.fillColor(area)
		this.color.fillColor(area, foreground, background)
	}

	fillForeground(area: Area, foreground: number) {
		this.style.fillForeground(area)
		this.color.fillForeground(area, foreground)
	}

	fillBackground(area: Area, background: number) {
		this.style.fillBackground(area)
		this.color.fillBackground(area, background)
	}

	start() {
		// Set output encoding for rendering
		process.stdout.setEncoding('utf16le')
		if (! this.resizeHandler)
			process.stdout.on('resize', this.resizeHandler = function(this: Terminal) {
				this.resize(Terminal.fullScreen())
				this.render()
			}.bind(this))
		console.clear()
	}

	stop() {
		if (this.resizeHandler)
			process.stdout.off('resize', this.resizeHandler)
		// TODO: clean up terminal area
	}



	async nextKey(map: KeyEventMap<KeyEvent, Terminal> = {}): Promise<KeyEvent> {
		return KeyEvent.next(map, this)
	}

	render() {
		// this.cursor.hide()
		process.stdout.cork()
		process.stdout.write(Cursor.HOME)
		for (let view_y = 0 ; view_y < this.size.height ; view_y++) {
			// Move cursor and get display y position after offset
			// process.stdout.write(Cursor.movement(0, view_y))
			const y = view_y + this.offset.y
			if (y >= this.text.getHeight())
				break

			// Initial escape sequence to start row style
			let style_x = this.offset.x
			process.stdout.write(this.style.getEscape(style_x, y, this.color.read(style_x, y)))

			for (let view_x = 0 ; view_x < this.size.width ; view_x++) {
				const x = view_x + this.offset.x
				if (x >= this.text.getWidth())
					break

				// If there is a change in style or color
				if (! this.style.sameByte(x, y, style_x, y) || ! this.color.sameByte(x, y, style_x, y)) {
					process.stdout.write(this.style.getEscape(x, y, this.color.read(x, y)))
					style_x = x
				}
				process.stdout.write(this.text.getChar(x, y))
			}
			// Final escape to terminate output
			process.stdout.write(StyleGrid.escape())
			process.stdout.write(Cursor.nextLine())
		}
		process.stdout.uncork()
		this.cursor.move()
		// this.cursor.show()
	}

	renderUpdate() {
		// TODO: only render updated areas
	}

	async delay(ms: number) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(ms)
			}, ms)
		})
	}

	static fullScreen(): Size {
		return {
			width: process.stdout.columns,
			height: process.stdout.rows
		}
	}

	getArea(): Area {
		return this.area
	}

	getSize(): Size {
		return this.size
	}

	getWidth() {
		return this.size.width
	}

	getHeight() {
		return this.size.height
	}

}
