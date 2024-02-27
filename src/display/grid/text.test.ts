import { TextGrid } from './text'

describe('text buffer', () => {

	it('should initialize to a size', () => {
		const grid = new TextGrid({ width: 4, height: 1 })
		grid.writeString(0, 0, 'abcd')
		expect(grid.getChar(0, 0)).toBe('a')
		expect(grid.getChar(1, 0)).toBe('b')
		expect(grid.getChar(2, 0)).toBe('c')
		expect(grid.getChar(3, 0)).toBe('d')
	})

	it('should initialize to a size', () => {
		const grid = new TextGrid({ width: 5, height: 2 })
		grid.writeString(0, 0, 'abcde')
		expect(grid.getChar(0, 0)).toBe('a')
		expect(grid.getChar(1, 0)).toBe('b')
	})

})
