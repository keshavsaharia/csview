import fs from 'fs'
import path from 'path'

import {
	AnyClass,
	isString
} from '@blockflows/type'


import { readStream } from './stream'

type ReadHandler<RowClass extends AnyClass> = (instance: InstanceType<RowClass>, stream: fs.ReadStream) => any

export default class CSVReader<RowClass extends AnyClass> {
	private rowClass: RowClass
	private files: Array<string> = []
	private rowArgs: Array<any> = []
	private handlers: Array<ReadHandler<RowClass>> = []
	private columns: Array<CSVProperty> = []
	private column: { [name: string]: CSVProperty } = {}

	constructor(context: CSVContext, rowClass: RowClass, ...files: Array<string>) {
		this.context = context
		this.rowClass = rowClass
		this.files = files

		if (context.hasDefined('filePath')) {
			const filePath = context.get('filePath')
			if (path.isAbsolute(filePath))
				this.files.push(filePath)
			else
				this.files.push(path.join(__dirname, filePath))
		}

		this.loadColumns()
	}

	private loadColumns() {
		for (const column of this.context.propertiesWithDefined('column')) {
			const value = column.get('column')
			const name = isString(value) ? value : column.getName()
			this.columns.push(column)
			this.column[name] = column
		}
	}

	onRow(handler: (instance: InstanceType<RowClass>, stream: fs.ReadStream) => any): this {
		this.handlers.push(handler)
		return this
	}

	async read(): Promise<number> {
		let streamed = 0
		for (const file of this.files) {
			// Skip invalid files
			if (! fs.existsSync(file)) {
				console.log('Invalid file: ' + file)
				continue
			}

			let column: Array<CSVProperty | undefined> | undefined = undefined

			streamed += await readStream(file, async (line, header, stream) => {
				// Set header if first line
				if (! column && header) {
					column = header.map((head) => this.column[head])
				}

				// If there is any CSV data
				else if (line.length > 0) {
					// Create a new instance for this row
					const instance = new this.rowClass(...this.rowArgs)

					for (let c = 0 ; c < column.length ; c++) {
						const property = column[c]
						if (property != null)
							property.setParsedValue(instance, line[c])
					}

					for (const handler of this.handlers)
						await handler(instance, stream)
				}
			})
		}
		return streamed
	}

	addFile(file: string) {
		this.files.push(file)
		return this
	}

	addFiles(files: Array<string>) {
		this.files.push.apply(this.files, files)
		return this
	}

}
