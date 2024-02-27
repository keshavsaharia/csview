import { KeyMap } from './types'
import { KEY_MAP } from './constant'

/**
 * Wait for a key press
 */
export async function getNextKey<T = any>(this: T, map: KeyMap<T> = {}): Promise<string> {
	const context = this

	return new Promise((resolve: (key: string) => any) => {
		process.stdin.setRawMode(true)
		process.stdin.setEncoding('utf8')

		process.stdin.once('data', (data: string) => {
			process.stdin.setRawMode(false)

			const hex = Buffer.from(data, 'utf8').toString('hex')
			const specialKey = KEY_MAP[hex]

			if (specialKey && map[specialKey]) {
				try {
					map[specialKey].call(context, data)
				}
				catch (e) {}
				resolve(specialKey)
			}
			else if (specialKey == 'exit') {
				console.clear()
				process.exit()
			}
			else {
				if (map.key)
					map.key.call(context, data)
				resolve(data)
			}
		})
	})
}
