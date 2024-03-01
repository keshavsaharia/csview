import { CsvColumn } from '.'
import { BooleanOption } from '../types'

export class CsvBooleanColumn extends CsvColumn<boolean, BooleanOption> {
	
    toHTML(value: boolean) {
        return value.toString()
    }

    toEditableHTML(value: boolean) {
        return `<input type="checkbox" ${value ? 'checked' : ''}>`
    }

}
