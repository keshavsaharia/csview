import { Column } from '.'

export class BooleanColumn extends Column<boolean> {
	
    toHTML(value: boolean) {
        return value.toString()
    }

    toEditableHTML(value: boolean) {
        return `<input type="checkbox" ${value ? 'checked' : ''}>`
    }

}
