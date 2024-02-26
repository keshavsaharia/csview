import { getCursorPosition } from './position'

describe('cursor position test', () => {

	it('should get current position', async () => {
		const cursor = await getCursorPosition()
		expect(cursor).toEqual({ x: -1, y: -1 })
	})

})
