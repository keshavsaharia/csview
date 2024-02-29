import fs from 'fs'

import { parseLine } from './parse'

export class CsvReader {
    
    filePath: string
    stream: fs.ReadStream
    encoding: BufferEncoding = 'utf8'

    // Options
    header?: string[]
    noHeader?: boolean

    // Reading state
    input: string = ''
    rows: number = 0
    row: Array<any[]> = []

    static canRead(filePath: string) {
        return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
    }

    constructor(filePath: string, encoding: BufferEncoding = 'utf8') {
        this.filePath = filePath
        this.encoding = encoding
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
                reader.input += data.toString()
                const end = reader.input.lastIndexOf('\n')
                if (end < 0) return
    
                let start = 0
                while (start < end) {
                    const line = parseLine(reader.input, start)
                    // Try parsing a header if first line, otherwise parse row
                    if (! reader.header && ! reader.noHeader)
                        reader.onHeader(line.column)
                    else reader.onRow(reader.rows++, line.column)
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

    private onRow(row: number, column: string[]) {
        this.row[row] = column
    }

    private getReadStream(): fs.ReadStream {
        if (! this.stream)
            this.stream = fs.createReadStream(this.filePath, this.encoding)
        return this.stream
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