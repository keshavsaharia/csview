import { Column } from '.'

export class StringArrayColumn extends Column<string[]> {
	/**
	 * Split delimiter (default is comma ,)
	 */
	delimiter?: string

}
