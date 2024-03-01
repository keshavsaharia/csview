import { CsvColumn } from '.'

export class StringArrayColumn extends CsvColumn<string[]> {
	/**
	 * Split delimiter (default is comma ,)
	 */
	delimiter?: string

}
