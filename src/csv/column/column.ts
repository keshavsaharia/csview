import {
    CsvNumberColumn,
    CsvStringColumn,
    CsvBooleanColumn
} from '.'

import { ColumnType, ColumnOption } from '../types'

export class CsvColumn<Type = any, Option extends ColumnOption = ColumnOption> {
    option: Partial<ColumnOption> = {}

    static fromJSON(type: ColumnType): CsvColumn {
        switch (type) {
        case 'boolean': return new CsvBooleanColumn()
        case 'number':  return new CsvNumberColumn()
        case 'string':
        default:        return new CsvStringColumn()
        }
        
    }

    setOption(option: Option): this {
        Object.assign(this.option, option)
        return this
    }

    toHTML(value: Type) {
        if (value == null)
            return ''
        return value.toString()
    }

    toEditableHTML(value: Type) {
        return `<input type="text" value="${value}">`
    }

}
