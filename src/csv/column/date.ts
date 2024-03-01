import { CsvColumn } from '.'
import { DateOption } from '../types'

export class DateColumn extends CsvColumn<Date, DateOption> {

    toText(value: Date) {

    }

    toHTML(value: Date) {
        if (value == null)
            return ''
        return value.toString()
    }

    toEditableHTML(value: Date) {
        return `<input type="date" value="${ value.toISOString() }">`
    }

}
