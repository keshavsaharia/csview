import { Point } from '../grid/types'
import { getCursorPosition } from './read'

/**
 *
 */
export class Cursor implements Point {
	x: number = 0
	y: number = 0

	static ESCAPE = Buffer.from([27, 0, 91, 0])
	static SEMICOLON = Buffer.from([59, 0])
	static HOME = Buffer.from([27, 0, 91, 0, 72, 0])
	static GET_POSITION = Buffer.from([0, 0x1b, 0, 0x5b, 0, 0x36, 0, 0x6e ])
	static CURSOR_SHOW = Buffer.from([27, 0, 91, 0, 63, 0, 50, 0, 53, 0, 104, 0])
	static CURSOR_HIDE = Buffer.from([27, 0, 91, 0, 63, 0, 50, 0, 53, 0, 108, 0])

	constructor(x?: number, y?: number) {
		this.setX(x || 0)
		this.setY(y || 0)
	}

	static home() {
		Cursor.output(Cursor.HOME)
	}

	static movement(x: number, y: number): Buffer {
		return Buffer.concat([
			Cursor.ESCAPE,
			Buffer.from((y + 1).toString(), 'utf16le'),
			Cursor.SEMICOLON,
			Buffer.from((x + 1).toString(), 'utf16le'),
			Buffer.from([72, 0])
		])
	}

	static operation(value: number, id: number): Buffer {
		return Buffer.concat([
			Cursor.ESCAPE,
			Buffer.from(value.toString(), 'utf16le'),
			Buffer.from([id, 0])
		])
	}

	move(x?: number, y?: number): this {
		// Go to saved cursor position
		if (x == null && y == null)
			Cursor.output(Cursor.movement(this.x, this.y))
		// Move to column
		else if (y == null) {
			this.setX(x)
			Cursor.output(Cursor.operation(x + 1, 71))
		}
		// Move to specified position
		else {
			this.setX(x)
			this.setY(y)
			Cursor.output(Cursor.movement(x, y))
		}
		return this
	}

	static column(x: number) {
		return Cursor.operation(x + 1, 71)
	}

	moveColumn(x: number) {
		this.setX(x)
		Cursor.output(Cursor.column(this.x))
	}

	static up(rows: number = 1) {
		return Cursor.operation(rows, 65)
	}

	moveUp(rows: number = 1) {
		this.setY(this.y - rows)
		Cursor.output(Cursor.up(rows))
	}

	static down(rows: number = 1) {
		return Cursor.operation(rows, 66)
	}

	moveDown(rows: number = 1) {
		this.setY(this.y + rows)
		Cursor.output(Cursor.down(rows))
	}

	static right(columns: number = 1) {
		return Cursor.operation(columns, 67)
	}

	moveRight(columns: number = 1) {
		this.setX(this.x + columns)
		Cursor.output(Cursor.right(columns))
	}

	static left(columns: number = 1) {
		return Cursor.operation(columns, 68)
	}

	moveLeft(columns: number = 1) {
		this.setX(this.x - columns)
		Cursor.output(Cursor.left(columns))
	}

	static nextLine(lines: number = 1) {
		return Cursor.operation(lines, 69)
	}

	moveToNextLine(lines: number = 1, x: number = 0) {
		this.setX(x)
		this.setY(this.y + lines)
		Cursor.output(Cursor.nextLine(lines))
	}

	static previousLine(lines: number = 1) {
		return Cursor.operation(lines, 70)
	}

	show() {
		Cursor.output(Cursor.CURSOR_SHOW)
	}

	hide() {
		Cursor.output(Cursor.CURSOR_HIDE)
	}

	setX(x: number) {
		this.x = Math.min(Math.max(x, 0), process.stdout.columns)
	}

	changeX(dx: number) {
		this.setX(this.x + dx)
	}

	setY(y: number) {
		this.y = Math.min(Math.max(y, 0), process.stdout.rows)
	}

	changeY(dy: number) {
		this.setY(this.y + dy)
	}

	private static output(buffer: Buffer) {
		process.stdout.write(buffer)
	}

	/**
	 * Get cursor position
	 */
	async getPosition(): Promise<Point> {
		return getCursorPosition()
	}
}
