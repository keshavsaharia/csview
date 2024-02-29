import { Column, ColumnOption } from '.'

export interface DateOption extends ColumnOption {
    /**
     * Format that date is stored in
     */
    format?: string
    
    /**
     * Format that date should be displayed in as text
     */
    display?: string
}

export class DateColumn extends Column<Date, DateOption> {

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
