
export interface ColumnOption {
    edit?: boolean
}

export class Column<Type = any, Option extends ColumnOption = ColumnOption> {
    option: Partial<ColumnOption> = {}

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
