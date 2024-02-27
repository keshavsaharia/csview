import Element from './element'
import { Terminal } from '..'
import { Display } from '../types'

import {
	inlineDisplayArea,
	inlineSpace, hasInlineSpace,
	inlineLength,
	inlineHeightRemainder,
	inlineOffset, inlineWrap,
	inlineClip, inlineWrapDelimiter
} from '../spacing/inline'

import {
	Style
} from '../types'

const SPACE = ' '
const EOL = '\n'
interface WrapOption {
	space?: string
	eol?: string
	preserve?: boolean
}

export default class Text extends Element {
	private text: string

	constructor(text: string = '', style: Style = {}, display?: Display) {
		super(style, display)
		this.style.inline = true
		this.text = text

		// Set display length to text length adjusted by possible start/end offset
		if (display)
			this.updateLength(display)
	}

	/**
	 * @func 	renderTo
	 * @desc 	Renders this text (including all wrapped lines) to the given Output instance.
	 */
	renderTo(output: Terminal) {
		// No pre-computed line wrapping for this text element
		if (! this.child)
			return

		// Render each child of this text element
		for (let i = 0 ; i < this.child.length ; i++)
			this.renderChildTo(output, this.child[i] as Text)
	}

	/**
	 * @func    renderChildTo
	 * @desc	Renders the wrapped line to the output instance.
	 */
	private renderChildTo(output: Terminal, child: Text) {
		if (! child.display)
			return

		output.writeString(child.text, child.display)
		// If there is a text color for this line
		if (this.foreground != null || this.background != null)
			output.fillColor(inlineDisplayArea(child.display), this.foreground, this.background)
	}

	/**
	 * @func    renderPosition
	 * @desc	Calculate positioning of this text and any wrapped children if the
	 * 			space exceeds available space on the line, and wrapping is enabled.
	 */
	renderPosition(display: Display, parent: Display): Display | null {

		// Text needs at least 1 line of space with 1 character to display
		if (! hasInlineSpace(display))
			return null

		// Crop text to visible space if line wrapping is not turned on
		const visibleText = this.canWrap() ? this.text :
			this.text.substring(0, inlineSpace(display))

		// Pass visible text to line wrapping function to handle possible
		// newline characters with a copy of the display object
		this.child = Text.lineWrap(visibleText, display, this.style)

		// Return the display object for the first line wrap result if this
		// text should be rendered on one line, or did not need to wrap
		if (! this.canWrap() || this.child.length == 1) {
			const firstLine = this.child[0]
			if (firstLine && firstLine.display)
				return firstLine.display
				// return finalizeTextSize(firstLine.display, parent, this.style)
		}
		// If line wrapping is enabled and there were more than one result from
		// the wrap operation
		else if (this.child.length > 1) {
			const innerLines = this.child.length - 2
			const lastLine = this.child[this.child.length - 1]

			// Calculate total space used by this line wrap
			display.length = inlineSpace(display) + innerLines * display.width
			// Include last line's length and possible end clipping
			if (lastLine.display) {
				display.length += (lastLine.display.length || 0)
				if (lastLine.display.end != null)
					display.end = lastLine.display.end
				// finalizeTextSize(lastLine.display, parent, this.style)
			}
			// Return this display object
			return display
		}
		return null
	}

	static lineWrap(text: string, display: Display, style: Style = {}, option: WrapOption = {}): Array<Text> {
		// Edge case to stop recursion on empty space
		if (text.length == 0 || ! hasInlineSpace(display))
			return []

		// There will always be a non-zero amount of space since this is the
		// modulus of the offset with the width
		const space = inlineSpace(display)
		const heightLeft = inlineHeightRemainder(display)

		// Get the substring of the text that will fit in the available inline space
		const wrapLine = text.substring(0, space)

		// Delimiter characters
		const eolChar = option.eol || EOL
		const spaceChar = option.space || SPACE

		// First need to check if there are newline characters in the string
		// before checking the base case of the line fitting on the available space
		const newLine = wrapLine.indexOf(eolChar)
		if (newLine >= 0) {
			const lines = wrapLine.split(eolChar).map((line, index) =>
				new Text(line + eolChar, style, inlineWrapDelimiter(display, index)))

			// If position height is exceeded by line breaks, end recursion and pass
			// visible lines up to caller
			if (lines.length > heightLeft)
				return lines.slice(0, heightLeft)

			// Get last new line character and start from next index
			const remainder = text.substring(wrapLine.lastIndexOf(eolChar) + 1)

			// Return lines split until final new line character, then recursively
			// generate remainder to ensure last line is joined with remaining text
			return [
				...lines.slice(0, lines.length - 1),
				...Text.lineWrap(remainder, inlineWrap(display, lines.length - 1), style, option)
			]
		}

		// Base case where the text fits on this line, and there are no newline characters.
		// This is the most common base case, just needs to be checked after newlines to maintain
		// consistency in the output.
		if (text.length <= space)
			return [ new Text(text, style, display) ]

		// If newline or space character is at beginning of the next line, start at the character
		// after the delimiter for the next line if strict white space preservation is not enabled
		const firstCharNextLine = text.charAt(space)
		if (firstCharNextLine == spaceChar || firstCharNextLine == eolChar) {

			// Start a new line if there is an EOL character, otherwise add an inline offset to the next line
			const wrapDisplay = (firstCharNextLine == eolChar) ?
				inlineWrapDelimiter(display, 1) : inlineOffset(display, space)
			return [
				// Clip the last character from the display position of this text
				// and include the terminating character in this line of text
				new Text(wrapLine + firstCharNextLine, style, inlineClip(display, -1)),
				...Text.lineWrap(text.substring(space + 1), wrapDisplay, style, option)
			]
		}

		// Get the last space character, which is either within the wrapped line, or at the
		// first character of the subsequent line, and include in the first line if found
		const delimiter = wrapLine.lastIndexOf(spaceChar)

		// Include the delimiter character on this line, and add an end clipping to the display to prevent
		// the delimiter from being displayed when rendering
		const firstLine = delimiter < 0 ?
			new Text(wrapLine, style, inlineClip(display)) :
			new Text(wrapLine.substring(0, delimiter + 1), style, inlineClip(display))
		// Remaining text to line wrap
		const nextLines = text.substring(delimiter < 0 ? wrapLine.length : (delimiter + 1))

		// Get the remaining text to line wrap, and remove leading space if delimiter found
		return heightLeft > 1 ? [
			firstLine,
			...Text.lineWrap(nextLines, inlineOffset(display, space), style, option)
		] : [ firstLine ]
	}

	renderUpdate(display: Display): Display | null {
		return display
	}

	private updateLength(display: Display) {
		display.length = inlineLength(display, this.text)
	}

	isInline() {
		return true
	}

	getText() {
		return this.text
	}

	getVisibleText() {
		if (this.display)
			return this.text.substring(
				this.display.start || 0,
				this.text.length - (this.display.end || 0))
		return this.text
	}

	toJSON() {
		const json = super.toJSON()
		if (json.style && json.style.inline === true)
			delete json.style.inline
		if (json.child && json.child.length == 1)
			delete json.child

		return {
			...json,
			text: this.text
		}
	}

	toString(indent: string = ''): string {
		const output: Array<string> = []

		if (! this.child) return ''
		if (this.child.length == 1) {
			output.push(indent, (this.child[0] as Text).text, '|', this.child[0].displayToString(), '\n')
		}
		else if (this.child.length > 1) {
			this.child.forEach((child: Text) => {
				output.push(indent, child.text, '|', child.displayToString(), '\n')
			})
		}
		return output.join('')
	}
}
