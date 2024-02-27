

export class OutOfBoundsError extends Error {

	static forLine(line: number): OutOfBoundsError {
		return new OutOfBoundsError(-1, line)
	}

	constructor(x: number, y: number) {
		super('out of bounds')
	}

}
