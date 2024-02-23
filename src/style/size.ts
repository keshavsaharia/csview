import {
	Style,
	parseBorderPadding
} from '.'

import {
	Display,
	within,
	inlineHeight,
	inlineLength,
	inlineCursor,
	inlineSpace,
	inlineLine
} from '../geometry'

export function initializeSize(display: Display, parent: Display, style: Style): Display {
	if (style.width != null) {
		const width = parseSize(style.width, parent.width, display.width)
		if (width != null) {
			const cursor = inlineCursor(display)
			display.x = display.x + cursor
			display.width = width - cursor
			display.offset = 0
		}
	}
	if (style.height != null) {
		const height = parseSize(style.height, parent.height, display.height)
		if (height != null) {
			display.height = height
		}
	}
	return display
}

export function finalizeSize(container: Display, display: Display, parent: Display, style: Style) {
	// If the height of the view is not specified or set to "auto", calculate the exact inline height and
	// for non-wrapping inline containers, use the max inline child's height stored in
	// container.height to compute the total height
	if (autoSize(style.height)) {
		const heightPad = display.height - container.height
		// Compute height based on used inline height if wrapping container
		display.height = heightPad + (style.wrap ?
			Math.min(inlineHeight(container), container.height) :
			container.height)
	}
	else if (style.wrap) {
		display.height = inlineHeight(container)
	}
	// For non-wrapping inline containers, set display width based on container size
	else if (style.inline) {
		if (autoSize(style.width) && inlineHeight(container) <= 1) {
			const extraWidth = Math.max(0, display.width - container.width)
			display.width -= extraWidth
		}
		display.width = Math.min(display.width, inlineSpace(display))
	}
	return display
}

export function finalizeTextSize(display: Display, parent: Display, style: Style) {
	// display.height = Math.min(Math.max(1, style.lineHeight || 1), display.height)
	const cursor = inlineCursor(parent) + inlineCursor(display)
	const line = inlineLine(parent) + inlineLine(display)

	display.x += cursor
	display.y += line
	if (autoSize(style.width) && display.length != null && display.length < display.width)
		display.width = display.length
	else
		display.width -= inlineCursor(display)
	display.offset = 0
	display.height = 1
	// For text that is only on one line that does not wrap
	// if (! style.wrap && inlineHeight(display) <= 1)
	// 	display.width = inlineLength(display)

	return display
}

export function parseSize(size?: string | number, relative?: number, limit?: number): number | undefined {
	// Returns undefined so function value can be used as object parameter
	if (size == null)
		return limit
	// Validate number
	else if (typeof size === 'number') {
		if (isNaN(size))
			return limit
		return limit != null ? within(size, limit) : size
	}
	// Parse string width
	else if (size.endsWith('%')) {
		const percent = parseFloat(size.substring(0, size.length - 1).trim())
		if (! isNaN(percent)) {
			// Limit parameter has to be set for percentage calculations, otherwise return percent of parent
			if (limit == null || isNaN(limit))
				return relative != null ? Math.round(percent * relative / 100) : undefined
			// Limit and relative parameter must be set to provide relative scaling value
			else if (relative == null || isNaN(relative))
				return Math.round(percent * limit / 100)
			// Return scaled value from parent value
			else
				return within(Math.round(percent * relative / 100), limit)
		}
	}
	else if (typeof size === 'string') {
		const value = parseFloat(size)
		if (! isNaN(value))
			return limit != null ? within(Math.round(value), limit) : value
	}
	return limit
}

export function autoSize(size?: string | number) {
	return size == null || size == 'auto'
}
