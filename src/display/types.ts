/**
 * @interface 	Point
 * @desc 		An x, y coordinate, where x corresponds to column index and y corresponds
 * 				to line number. Points are usually stored in absolute form, and additional
 * 				offset/size information is used to calculate inner element positioning.
 */
export interface Point {
	x: number
	y: number
}

/**
 * @interface 	Size
 * @desc		A
 */
export interface Size {
	width: number
	height: number
}

/**
 * @interface 	Area
 * @desc 		Calculated by a View instance during rendering. The x, y position are the
 * 				absolute position on the target output, and the width, height are the total
 * 				space allocated for rendering. Each position also caches the total offset
 * 				used from a parent view (either horizontal space if inline, otherwise lines).
 */
export interface Area extends Point, Size {}

/**
 * For calculating sizing and alignment
 */
export interface Display extends Area {
	offset: number
	length?: number
	// Maximum height of a child
	max?: number
	// For cropping wrapped text by delimiter
	start?: number
	end?: number
}

export type Data = { [key: string]: any }

export interface Style {
	// Sizing, defaults to parent size
	width?: string | number
	maxWidth?: string | number
	height?: string | number
	maxHeight?: string | number

	// Text color
	color?: string | number | Array<number>
	background?: string | number | Array<number>

	// Border and whether to join adjacent child views with borders
	border?: Array<number | boolean> | string | boolean
	borderLeft?: string | boolean
	borderRight?: string | boolean
	borderTop?: string | boolean
	borderBottom?: string | boolean
	borderStyle?: string

	// Spacing
	padding?: number | Array<number>
	margin?: number | Array<number>

	// Alignment and inline (side-by-side) placement of views
	display?: string
	block?: boolean
	inline?: boolean

	// Set explicit line height
	lineHeight?: number

	// Text alignment
	align?: 'left' | 'center' | 'right'
	alignLeft?: boolean
	alignCenter?: boolean
	alignRight?: boolean

	// Whether to
	wrap?: boolean
	inherit?: boolean
	inheritWrap?: boolean
}
