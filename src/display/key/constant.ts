import { KeyEvent } from './types'

/**
 * Map specific hex sequences to special key events
 */
export const KEY_MAP: Record<string, KeyEvent> = {
	'03': 'exit',
	'09': 'tab',
	'0d': 'enter',
	'1b': 'escape',
	'7f': 'backspace',
	'1b5b41': 'up',
	'1b5b42': 'down',
	'1b5b43': 'right',
	'1b5b44': 'left',
}
