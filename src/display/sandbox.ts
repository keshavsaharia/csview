import { Terminal, Cursor } from '.'

async function main() {
	const terminal = new Terminal()
	terminal.style.fillColor(terminal.style.getArea(), 1, 5)
	terminal.text.writeString(terminal.cursor, 'hello world')
	terminal.cursor.moveToNextLine()
	terminal.text.writeString(terminal.cursor, 'yo yo yo')
	terminal.render()

	while (true) {
		const key = await terminal.nextKey({
			backspace() {
				// this.text.setStringValue(this.cursor.x, this.cursor.y, ' ')
				this.cursor.changeX(-1)
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

		if (key.length == 1) {
			terminal.text.setStringValue(terminal.cursor.x, terminal.cursor.y, key)
			terminal.cursor.changeX(1)
		}
		terminal.render()
		// terminal.cursor.mov

	}
}

main()
