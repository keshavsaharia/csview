import {
	Terminal
} from '..'

import {
	Display, Style, Size, Data
} from '../types'

import {
	OutputColor,
	isOutputColor,
	parseOutputColor
} from '../spacing/color'

import { parseSize } from '../spacing/size'

export default abstract class Element {
	// Hierarchy references
	protected parent?: Element
	protected child?: Element[]

	// Style configuration
	style: Style

	// State and computed color values
	state?: 'focus' | 'active'
	color?: number
	foreground?: number
	background?: number
	color_state?: {
		[key: string]: {				// focus, active, etc
			foreground?: number
			background?: number
		}
	}

	// Display positioning and update flag
	display: Display | null
	updated: boolean = true

	constructor(style: Style = {}, display?: Display) {
		this.style = style
		this.display = display || null
	}

	abstract renderPosition(display: Display, parent: Display): Display | null

	abstract renderTo(output: Terminal): void

	render(output?: Terminal): Terminal {
		// Initialize a new output buffer if not provided
		output = output || new Terminal(this.display)

		// Render this element as the root object within the display
		const display: Display = { x: 0, y: 0, ...output.getSize(), offset: 0 }
		this.display = this.renderPosition(display, display)
		// Render onto the output view and recursively clear the updated flag
		this.renderTo(output)
		this.finishUpdate()
		return output
	}

	/**
	 * @func    finishUpdate
	 * @desc	Clear the update flag on this element and recursively on all children
	 */
	private finishUpdate() {
		this.updated = false
		if (this.child)
			this.child.forEach((child) => child.finishUpdate())
	}

	/**
	 * @func 	add
	 * @desc 	Append children to this element
	 */
	protected addChild<E extends Element>(this: E, ...children: Array<Array<Element> | Element>): E {
		// Initialize child array and iterate over all children
		if (! this.child)
			this.child = []
		for (let i = 0 ; i < children.length ; i++) {
			const child = children[i]

			// Add children from an array or a single child
			if (Array.isArray(child))
				for (let j = 0 ; j < child.length ; j++)
					this.child.push(child[j].setParent(this))
			else
				this.child.push(child.setParent(this))

			// Set update flag
			this.updated = true
		}
		// Can be chained
		return this
	}

	protected eachChild<E extends Element>(this: E, handler: (child: Element, index: number, parent: Element) => any): E {
		for (let i = 0 ; this.child && i < this.child.length ; i++) {
			handler(this.child[i], i, this)
		}
		return this
	}

	protected removeChild<E extends Element, C extends Element>(this: E, child: C): C | null {
		if (! this.child)
			return null
		const index = this.child.findIndex((c) => (child == c))

		if (index >= 0) {
			this.child.splice(index, 1)
			this.updated = true
			return child
		}
		return null
	}

	protected removeChildren<E extends Element>(this: E): E {
		delete this.child
		return this
	}

	protected setParent<E extends Element>(this: E, parent: Element) {
		this.parent = parent
		return this
	}

	// setSize<E extends Element>(this: E, size: Size): E

	setSize<E extends Element>(this: E, width: Size | string | number, height: string | number = 'auto'): E {
		if (typeof width == 'object')
			Object.assign(this.style, width)
		else {
			this.style.width = width
			this.style.height = height
		}
		this.updated = true
		return this
	}

	setWrap<E extends Element>(this: E, wrap: boolean = true): E {
		if (this.style.wrap != wrap) {
			this.style.wrap = wrap
			this.updated = true

			// If inline style not explicitly set
			if (wrap && this.style.inline == null)
				this.style.inline = true
		}
		return this
	}

	setColor<T extends Element>(this: T, foreground: number, background?: number): T {
		this.foreground = foreground
		this.background = background
		this.updated = true
		return this
	}

	setForeground<T extends Element>(this: T, foreground: number): T {
		this.foreground = foreground
		this.updated = true
		return this
	}

	setBackground<T extends Element>(this: T, background: number): T {
		this.background = background
		this.updated = true
		return this
	}

	canWrap(): boolean {
		return this.style.wrap === true
	}

	isInline(): boolean {
		return this.style.inline === true
	}

	isBlock(): boolean {
		return this.style.block === true
	}

	setStyle(style: Style) {
		this.style = style
		this.updated = true
		return this
	}

	updateStyle(style: Style) {
		Object.assign(this.style, style)
		this.updated = true
		return this.style
	}

	toJSON(): Data {
		const json: Data = { style: this.style }
		if (this.display)
			json.display = this.display
		if (this.child)
			json.child = this.child.map((c) => c.toJSON())
		return json
	}

	toString(indent: string = ''): string {
		return ''
	}

	displayToString() {
		if (! this.display)
			return ''
		return [' display=(',
			this.display.x, ',', this.display.y, ',',
			this.display.width, ',', this.display.height, ' + ',
			this.display.offset, ' / ', this.display.length, ')'].join('')
	}
}
