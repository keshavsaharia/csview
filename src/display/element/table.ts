
interface TableOption {
	// set to true for default scrolling by row/column
	scroll?: boolean | {
		x?: boolean | 'column'
		y?: boolean | 'row' | 'page'
	}


}

/**
 * Create a LineGrid for managing the table's inner line elements
 */
export class Table {
	head?: TableHead
	body?: TableBody

}

export class TableHead {

}

export class TableBody {

}
