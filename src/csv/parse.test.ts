import { parseLine } from './parse'

describe('parseLine test', () => {

	it('should parse up to a newline character', () => {
		const source = 'foo,bar\nbaz,quux\n1,"234"'
		const line1 = parseLine(source)
		expect(line1.column).toEqual(['foo', 'bar'])
		expect(source.substring(line1.end)).toEqual('baz,quux\n1,"234"')
		const line2 = parseLine(source, line1.end)
		expect(line2.column).toEqual(['baz', 'quux'])
		expect(source.substring(line2.end)).toEqual('1,"234"')
		const line3 = parseLine(source, line2.end)
		expect(line3.column).toEqual(['1', '234'])
		expect(line3.end).toEqual(source.length)
	})

	it('should allow certain escape patterns from string', () => {
		// \n
		// \t
		// \r

	})

	it('should parse simple strings', () => {
		expect(parseLine('a,b,c').column).toEqual(['a', 'b', 'c'])
	})

	it('should parse integers', () => {
		
	})

	it('should parse string delimiters', () => {
		expect(parseLine('"a",b,c').column).toEqual(['a', 'b', 'c'])
		expect(parseLine('a,"b",c').column).toEqual(['a', 'b', 'c'])
		expect(parseLine('a,b,"c"').column).toEqual(['a', 'b', 'c'])
		expect(parseLine('"a,b,c"').column).toEqual(['a,b,c'])
		expect(parseLine('"a,b,c","de,f"').column).toEqual(['a,b,c', 'de,f'])
	})

})
