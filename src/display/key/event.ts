import { KeyEventMap, KeyEventId } from './types'

export class KeyEvent {

	static EXIT = Buffer.from([0x03])
	private static KEY_MAP: Record<string, KeyEventId> = {
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

	event?: KeyEventId
	buffer?: Buffer
	data?: string

	// Short-hand events to check event against
	isUp() {			return this.event == 'up' }
	isDown() {			return this.event == 'down' }
	isLeft() {			return this.event == 'left' }
	isRight() {			return this.event == 'right' }
	isEnter() {			return this.event == 'enter' }
	isBackspace() {		return this.event == 'backspace' }
	isEscape() {		return this.event == 'escape' }
	isTab() {			return this.event == 'tab' }

	// Get the next key press and use the optional keymap to intercept the
	// key event before being returned
	static async next<Context = any>(map: KeyEventMap<KeyEvent> = {}, context: Context | null = null): Promise<KeyEvent> {
		return new Promise((resolve: (event: KeyEvent) => any) => {
			process.stdin.setRawMode(true)
			process.stdin.setEncoding('utf8')

			process.stdin.once('data', (data: string) => {
				process.stdin.setRawMode(false)

				const keyEvent = new KeyEvent()
				keyEvent.data = data
				keyEvent.buffer = Buffer.from(data, 'utf8')
				const eventId = keyEvent.event = KeyEvent.KEY_MAP[keyEvent.buffer.toString('hex')]

				if (eventId && map[eventId]) {
					try {
						map[eventId].call(context, keyEvent)
					}
					catch (e) {}
					resolve(keyEvent)
				}
				// If exit is not overridden in event map, a child implementation
				// is responsible for calling process.exit() upon termination of its processing
				else if (eventId == 'exit') {
					console.clear()
					process.exit()
				}
				else {
					if (map.key)
						map.key.call(context, keyEvent)
					resolve(keyEvent)
				}
			})
		})
	}

}
