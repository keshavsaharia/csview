import { Schema } from '.'

export class CsvRow extends Array {
    header?: string[]

    constructor(header?: string[]) {
        super(header ? header.length : undefined)
        this.header = header
    }

    // Report invalid lengths
    invalidLength() {
        return this.header && this.length != this.header.length
    }

    // Create an HTML row
    toHTML(schema: Schema) {
        const html: string[] = ['<tr>']
        
        html.push('</tr>')
        return html.join('')
    }

}