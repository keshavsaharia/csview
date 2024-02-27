import { Style, Display } from '../types'

import { parseSize } from './size'

import {
	inlineCursor, inlineSpace,
	inlineLength, inlineLine
} from './inline'

import {
	getPadding,
	insertPadding
} from './padding'

/**
 * @func 	displayContainer
 * @desc 	Create the inner container of this display specification using the given style
 * 			specification. This process creates an identical Display object, then adjusts
 * 			the size of the container to account for margins, paddings, and borders. The
 * 			new object has its offset and maximum child height initialized to 0.
 */
export function displayContainer(display: Display, parent: Display, style: Style) {

	// Start a new container position object with a zero offset
	const container = {
		x: display.x,
		y: display.y,
		width: display.width,
		height: display.height,
		offset: 0,
		max: 0
	}

	if (style.width != null) {
		const width = parseSize(style.width, parent.width, display.width)
		if (width != null)
			display.width = container.width = width
	}
	if (style.height != null) {
		const height = parseSize(style.height, parent.height, display.height)
		if (height != null)
			display.height = container.height = height
	}

	// If no padding or borders, return as-is
	if (style.padding == null && style.border == null)
		return container

	// Get the configured padding or the default equal 0 padding array
	const padding = getPadding(style.padding)

	// If there is a padding in some direction, adjusts the position object
	insertPadding(container, padding)

	return container
}

/**
 * @func    containerOffsetBlock
 * @desc	Given a generated child Display object that renders as a block (i.e.
 * 			takes the full available width), adjust the container positioning to
 * 			the remaining space after the block element.
 * @param 	{Display} container - a container that is being used to iteratively generate child positions
 * @param 	{Display} child - a generated child position for an element that renders as block
 */
export function containerOffsetBlock(container: Display, child: Display) {
	// Use any available inline space
	if (inlineCursor(container) > 0)
		container.offset += inlineSpace(container)
	container.offset += container.width * Math.min(child.height, container.height)
	container.max = 0
	return container
}

export function containerOffsetInline(container: Display, child: Display) {
	// Current line the container is adding inline elements to, and
	// inline length of the child element (either text length or child width)
	const line = inlineLine(container)
	const length = inlineLength(child)

	// Increment offset by the width and add to container length
	container.offset += length
	container.length = (container.length || 0) + length

	// If the container is now on a new line, reset max height
	if (line < inlineLine(container))
		container.max = Math.max(0, child.height)
	// Otherwise save the child height as the maximum height if greater than the
	// max height seen so far on this line
	else container.max = Math.max(container.max || 0, child.height)
}
