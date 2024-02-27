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
