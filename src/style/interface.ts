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

	// Join borders
	join?: Array<boolean> | boolean
	joinTop?: boolean
	joinBottom?: boolean
	joinLeft?: boolean
	joinRight?: boolean
	joinHorizontal?: boolean
	joinVertical?: boolean

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

export interface OutputColor {
	ansi?: number
	r?: number
	g?: number
	b?: number
	index?: number
}

export interface OutputBorder {
	width: Array<number>
	dir: Array<number | null>
	corner: Array<number | null>
	top: number
	bottom: number
	left: number
	right: number
}

export interface Border {
	top: number
	bottom: number
	left: number
	right: number
	topLeft: number
	topRight: number
	bottomLeft: number
	bottomRight: number
	joinTop: number
	joinBottom: number
	joinLeft: number
	joinRight: number
	joinTopLeft: number
	joinTopRight: number
	joinBottomLeft: number
	joinBottomRight: number
	[key: string]: number
}
