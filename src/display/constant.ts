import { KeyEvent } from './types'

// Cursor escape constants
export const ESCAPE_START = Buffer.from([27, 0, 91, 0])
export const SEMICOLON = Buffer.from([59, 0])
export const CURSOR_HOME = Buffer.from([27, 0, 91, 0, 72, 0])
export const CURSOR_VISIBLE = Buffer.from([27, 0, 91, 0, 63, 0, 50, 0, 53, 0, 104, 0])
export const CURSOR_INVISIBLE = Buffer.from([27, 0, 91, 0, 63, 0, 50, 0, 53, 0, 108, 0])

export const KEY_MAP: Record<string, KeyEvent> = {
	'03': 'exit',
	'7f': 'backspace',
	'1b': 'escape',
	'0d': 'enter',
	'09': 'tab',
	'1b5b41': 'up',
	'1b5b42': 'down',
	'1b5b43': 'right',
	'1b5b44': 'left',
}
