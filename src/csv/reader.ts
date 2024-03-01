import fs from 'fs'

import { CsvRow } from '.'
import { parseLine } from './parse'
import { csvParseOption, ParseOption } from './types'

export class CsvTable {
    
    filePath: string
    stream: fs.ReadStream
    encoding: BufferEncoding = 'utf8'
    option: ParseOption = csvParseOption

    // Options
    header?: string[]
    noHeader?: boolean

    // Reading state
    input: string = ''
    private start: number = 0
    rows: number = 0
    row: Array<CsvRow> = []

    static canRead(filePath: string) {
        return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    }

    constructor(filePath: string, encoding: BufferEncoding = 'utf8', option: ParseOption = csvParseOption) {
        this.filePath = filePath
        this.encoding = encoding
        this.option = option
    }

    async readAll(): Promise<number> {
        if (this.stream) {
            this.stream.resume()
            return 0
        }

        const reader = this
        const stream = this.getReadStream()

        return new Promise((resolve, reject) => {
            stream.on('data', (data) => {
                // Append to byte start index and reader input cache
                reader.input += data.toString()
                this.start += data.length

                // Get the last newline character and parse all CSV rows
                // within the chunk of lines
                const end = reader.input.lastIndexOf('\n')
                if (end < 0) return
                
                // Parse each row by taking substrings
                let start = 0
                while (start < end) {
                    const row = new CsvRow(reader.header)
                    const line = parseLine(reader.input, start, reader.option, row)
                    // Try parsing a header if first line, otherwise parse row
                    if (! reader.header && ! reader.noHeader)
                        reader.onHeader(line.column)
                    else reader.onRow(reader.rows++, row)
                    // Read from end of line to get next line
                    start = line.end
                }
                reader.input = reader.input.substring(start)
            })

            stream.on('close', () => {
                resolve(reader.rows)
            })
    
            stream.on('error', (error) => {
                reject(error)
            })
        })
    }

    private onHeader(header: string[]) {
        // Special case to skip leading empty lines
        if (header.length == 0)
            return
        this.header = header
    }

    private onRow(row: number, column: CsvRow) {
        this.row[row] = column
    }

    hasRow(row: number): boolean {
        return this.row[row] != null
    }

    getRow(row: number): string[] {
        return this.row[row]
    }

    private getReadStream(): fs.ReadStream {
        if (! this.stream)
            this.stream = fs.createReadStream(this.filePath, {
                start: this.start,
                encoding: this.encoding
            })
        return this.stream
    }

    clearCache(start?: number, end?: number): this {
        start = (start == null) ? 0 : start
        end = (end == null) ? this.row.length : end

        for (let i = start ; i < end ; i++) {
            delete this.row[i]
        }
        return this
    }

    async resume() {
        if (this.stream) {
            this.stream.resume()
            return
        }
    }

    async pause() {
        if (this.stream)
            this.stream.pause()
        return this
    }

}