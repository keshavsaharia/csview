
export type ElementState = 'focus' | 'active'
export type ElementEventId = 'focus' | 'blur'

export interface ElementStyle {
	width?: number					// Sizing, defaults to parent size
	maxWidth?: number				// Width constraint
	widthAuto?: boolean				// Automatically take maximum width from parent

	height?: number
	maxHeight?: number
	heightAuto?: boolean			// Automatically take maximum height from parent

	// Padding and margin
	padding?: number | number[]
	margin?: number | number[]

	// Alignment and wrapping
	align?: 'left' | 'center' | 'right'
	wrap?: boolean
	lineHeight?: number

	// Display flags
	block?: boolean
	inline?: boolean

	// Color specification
	foreground?: number
	background?: number

	// State and color map for state
	state?: ElementState | null
	state_color?: Record<ElementState, {
		foreground?: number
		background?: number
	}>
}
