import { Schema } from '.'

export class Row extends Array {
    header: string[]

    constructor(header: string[]) {
        super(header.length)
        this.header = header
    }

    // Report invalid lengths
    invalidLength() {
        return this.length != this.header.length
    }

    // Create an HTML row
    toHTML(schema: Schema) {
        const html: string[] = ['<tr>']
        
        html.push('</tr>')
        return html.join('')
    }

}