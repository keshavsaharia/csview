import { ByteGrid } from './byte'

describe('byte grid test', () => {

	it('should size and resize', () => {
		const grid = new ByteGrid({ width: 5, height: 2 })
		grid.fill(1)
		expect(grid.read(0, 0)).toEqual(1)
		grid.resize({ width: 6, height: 3 })
		expect(grid.read(4, 0)).toEqual(1)
		expect(grid.read(5, 0)).toEqual(0)
	})

	it('should check bounds', () => {
		const grid = new ByteGrid({ width: 5, height: 3 })
		expect(grid.has(0, 0)).toBe(true)
		expect(grid.has(0, -1)).toBe(false)
		expect(grid.has(-1, 0)).toBe(false)

		expect(grid.has(4, 0)).toBe(true)
		expect(grid.has(5, 0)).toBe(false)
		expect(grid.has(5, 4)).toBe(false)
		expect(grid.has(4, 3)).toBe(false)
		expect(grid.has(4, 2)).toBe(true)
	})

	it('should read', () => {
		// TODO
	})

	it('should write', () => {

	})

	it('should update bit', () => {
		const grid = new ByteGrid({ width: 1, height: 1 })
		expect(() => grid.update(-1, -1, 0)).toThrowError()

		expect(grid.has(0, 0)).toBe(true)
		grid.write(0, 0, 1)
		expect(grid.read(0, 0)).toBe(1)
		grid.update(0, 0, 1)
		expect(grid.read(0, 0)).toBe(1)
		grid.update(0, 0, 2)
		expect(grid.read(0, 0)).toBe(3)	// binary 11
	})

})
