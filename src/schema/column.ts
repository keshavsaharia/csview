
export abstract class ColumnSchema<T> {

	abstract validate(value: string): boolean

}

export class StringColumnSchema extends ColumnSchema<string> {

	validate(value: string) {
		return true
	}

	

}
