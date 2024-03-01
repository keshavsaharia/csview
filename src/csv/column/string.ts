import { CsvColumn } from '.'
import { StringOption } from '../types'

export class CsvStringColumn extends CsvColumn<string, StringOption> {

	validate(value: string) {
		return true
	}

    toHTML(value: string): string {
        return value
    }

    toEditableHTML(value: string): string {
        return `<textarea>${ value }</textarea>`
        // return `<input type="text" value="${ value }">`
    }

}
