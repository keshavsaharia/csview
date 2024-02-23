import {
	Area,
	Display,
	within
} from '.'

/**
 * @func	hasSpace
 * @desc 	Returns true if the display area has at least 1 unit of visible width and height space.
 * @param 	{Display} display - a 2D output specification
 */
export function hasSpace(display: Display) {
	return display.width > 0 && display.height > 0
}

/**
 * @func	hasInlineSpace
 * @desc 	Returns true if the inline display area has visible space for additional inline children.
 * @param 	{Display} display - a 2D output specification
 */
export function hasInlineSpace(display: Display) {
	return hasSpace(display) && inlineHeightRemainder(display) > 0
}

/**
 * @func	inlineCursor
 * @desc 	Returns the current cursor position within the inline display. This function is often used
 * 			on intermediate Display objects during position calculation, where a Display object stores an
 *	 		offset value that is incremented by the "length" value of each child Display object.
 * @param 	{Display} display - a 2D output specification
 */
export function inlineCursor(display: Display) {
	return display.offset % display.width
}

export function inlineLine(display: Display) {
	return Math.floor(display.offset / display.width)
}

/**
 * @func	inlineWrapCursor
 * @desc 	Returns true if the cursor is on a new wrapped line that is not the first line.
 * @param 	{Display} display - a 2D output specification
 */
export function inlineWrapCursor(display: Display): boolean {
	return display.offset > 0 && inlineCursor(display) == 0
}

/**
 * @func	inlineSpace
 * @desc 	Returns the total space available after the cursor for inline content.
 * @param 	{Display} display - a 2D output specification
 */
export function inlineSpace(display: Display) {
	return display.width - display.offset % display.width
}

/**
 * @func	lineHeight
 * @desc 	Returns the line height of the inline container, which is always at least 1, and is set
 * 			to the maximum child height directly within the display container.
 * @param 	{Display} display - a 2D output specification
 */
export function lineHeight(display: Display) {
	return Math.max(1, display.max != null ? display.max : 1)
}

/**
 * @func	inlineHeight
 * @desc 	Returns the total consumed height of the inline container.
 * @param 	{Display} display - a 2D output specification
 */
export function inlineHeight(container: Display) {
	return Math.ceil(container.offset / container.width) * lineHeight(container)
}

export function inlineHeightRemainder(display: Display) {
	return Math.max(0, display.height - Math.floor(display.offset / display.width))
}

export function inlineLength(display: Display, text?: string) {
	if (display.length != null)
		return display.length

	const start = display.start != null ? display.start : 0
	const end = display.end != null ? display.end : 0
	if (text != null)
		return Math.max(0, text.length + end - start)
	// Return the full available inline space
	return inlineSpace(display)
}

/**
 * @func	inlineText
 * @desc
 */
export function inlineText(display: Display, text: string) {
	const start = display.start != null ? display.start : 0
	const end = display.end != null ? display.end : 0
	return text.substring(start, text.length + end)
}

/**
 * Set the end and possibly the start index for the Display object. This is used to
 * clip delimiter characters from appearing in rendered text, while still preserving them
 * within the text string to allow updates to be repositioned more efficiently.
 */
export function inlineClip(display: Display, limit: number = 0, end?: number): Display {
	return {
		...display,           // right     left+right
		start: (end == null) ? undefined : limit,
		end: (end == null) ?   limit     : end
	}
}

export function inlineWrapDelimiter(display: Display, lines: number, end: number = -1): Display {
	const wrap = cropDisplayTop(display, lines, (lines == 0 ? display.offset : 0))
	wrap.end = end
	return wrap
}

/**
 * Crop the display by the given number of lines, and set the specified offset if provided.
 */
export function cropDisplayTop(display: Display, lines: number, offset: number = 0): Display {
	return {
		x: display.x,
		y: within(display.y + lines, display.y, display.y + display.height),
		width: display.width,
		height: within(display.height - lines, 0, display.height),
		offset
	}
}

/**
 * Crop the display by the given number of lines, and set the specified offset if provided.
 */
export function cropDisplayLeft(display: Display, offset: number = inlineCursor(display)): Display {
	return {
		x: within(display.x + offset, display.x + display.width),
		y: display.y,
		width: within(display.width - offset, 0, display.width),
		height: display.height,
		offset: 0
	}
}

/**
 * Create a new Display object that is an inline wrapping of the
 */
export function inlineWrap(display: Display, lines: number = inlineHeight(display), offset?: number): Display {
	return cropDisplayTop(display, lines,
		(offset != null) ? offset : (lines == 0 ? display.offset : 0))
}

/**
 * Add the offset to the display
 */
export function inlineOffset(display: Display, offset: number = 0): Display {
	return {
		x: display.x,
		y: display.y,
		width: display.width,
		height: display.height,
		offset: display.offset + offset
	}
}

export function blockWrap(display: Display, lines: number = inlineHeight(display)): Display {
	return cropDisplayTop(display, lines, 0)
}

/**
 * Create a new Display container that fills the entire width of this inline block with a
 * child element that is asking for block spacing.
 */
export function blockChild(display: Display): Display {
	return cropDisplayTop(display, display.offset)
}

/**
 * @func 	inlineCopy
 * @desc 	Create a copy of the container at its current offset position to add an inline
 * 			child which shares the same y position (i.e. line number) with other children
 * 			on the line, but computes its positioning based on the offset position modulus
 * 			the display width.
 */
function inlineCopy(container: Display): Display {
	const display = Object.assign({}, container)
	// Reset keys
	delete display.max
	delete display.length
	delete display.start
	delete display.end
	// Copy of container object with current offset
	return display
}

/**
 * @func 	inlineInsert
 * @desc 	Create a copy of the container at its current offset position to add an inline
 * 			child which has a new starting offset and the absolute x, y position
 */
function inlineInsert(container: Display, childWidth?: number, childHeight?: number): Display {
	const cursor = container.offset % container.width
	const line = Math.floor(container.offset / container.width)
	const lineHeight = Math.max(1, line > 0 ? (container.max || 0) : 1)

	const x = container.x + cursor
	const y = container.y + line * lineHeight
	const width = container.width - cursor
	const height = container.height - line * lineHeight

	// Scale width/height to maximum available space
	if (childWidth != null)
		childWidth = Math.min(childWidth, width)
	if (childHeight != null)
		childHeight = Math.min(childHeight, height)

	// Return inline insert
	return {
		x,
		y,
		length: childWidth != null ? childWidth : undefined,
		width: childWidth != null ? childWidth : width,
		height: childHeight != null ? childHeight : height,
		offset: 0
	}
}

export function inlineChild(container: Display, option: {
	wrap?: boolean		// Whether wrapping is enabled on the display container
	block?: boolean		// Whether the child is a block element
	inline?: boolean	// Whether the child is an inline element
	width?: number		// If the child has a width specified
} = {}): Display {

	// If cropping a block display for a child of an inline container, offset
	// the original display object by all remaining space and return
	if (option.block)
		return blockWrap(container)

	// If the child has an explicit width set, it may be a member of
	// either an inline group of blocks or within wrapping lines of text
	else if (option.width != null) {
		// If wrapping is enabled on the container
		if (option.wrap) {
			// If the child width is too large for this line, but can wrap to the next line
			if (option.width > inlineSpace(container)) {
				if (option.width <= container.width)
					return inlineWrap(container)
				else
					return inlineInsert(container)
			}
			// Return a copy of the container with the current offset
			else
				return inlineInsert(container)
		}
		// Crop the inline display on the left for the child container
		else
			return cropDisplayLeft(container)
	}

	// If the view wraps, use a copy of the original display for the child, and rely on
	// setting the offset/length values to calculate the total size
	else if (option.wrap) {
		// If inline child, use current offset of container to compute position
		if (option.inline)
			return inlineCopy(container)
		else
			return inlineInsert(container)
		// return inlineOffset(display)
		// // if (display.max != null) {
		// // 	return inlineWrap(display, inlineHeight(display))
		// // }
		// // else return { ...display }
	}

	// Otherwise crop this inline space by the used amount, and shift the x value to
	// provide a smaller rendering space to the child inline view
	else return cropDisplayLeft(container)
}
