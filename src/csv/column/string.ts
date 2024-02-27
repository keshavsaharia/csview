import { Column } from '.'

export class StringColumn extends Column<string> {

	validate(value: string) {
		return true
	}

}
