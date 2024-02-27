import { Terminal, Cursor } from '.'

async function main() {
	const terminal = new Terminal()
	terminal.writeString('hello world')
	// terminal.cursor.move(5, 5)
	terminal.fillColor(terminal.getArea(), 1, 5)
	// terminal.text.writeString(terminal.cursor, 'hello world')
	// terminal.cursor.moveToNextLine()
	// terminal.text.writeString(terminal.cursor, 'yo yo yo')
	terminal.render()

	while (true) {
		const key = await terminal.nextKey({
			key(event) {
				this.writeString(event.data, this.cursor)
				this.cursor.changeX(1)
			},
			backspace() {
				this.cursor.changeX(-1)
				this.writeString(' ', this.cursor)
			},
			enter() {
				this.cursor.moveToNextLine()
			},
			tab() {
				this.cursor.changeX(4)
			},
			left() {
				this.cursor.moveLeft()
			},
			right() {
				this.cursor.moveRight()
			},
			up() {
				this.cursor.moveUp()
			},
			down() {
				this.cursor.moveDown()
			}
		})

		// if (key.data) {
		// 	terminal.writeString(key.data, terminal.cursor)
		// 	terminal.cursor.changeX(1)
		// }

		terminal.render()
		// terminal.cursor.mov

	}
}

main()
