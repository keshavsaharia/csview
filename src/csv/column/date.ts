import { CsvColumn } from '.'
import { DateOption } from '../types'

import { dateFormatParser } from './date/parser'
import { dateFormatter } from './date/formatter'
import { DateFormatter, DateParser } from './date/types'

export class DateColumn extends CsvColumn<Date, DateOption> {
    formatter: DateFormatter
    parser: DateParser

    initialize(option: DateOption) {
        if (option.format) {
            this.parser = dateFormatParser(option.format, option.utc)
            this.formatter = dateFormatter(option.format, option.utc)
        }
    }

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
