import os from 'os'
import fs from 'fs'
import path from 'path'

import { Terminal, CsvReader } from '..'
import { CliOption } from '.'
import { CliEnvironment } from './types'

/**
 * Created on cli initialization
 */
export class CliHandler {
	env: CliEnvironment
	args: string[]
    
    globalOption: Map<string, CliOption> = new Map()
    fileOption: Map<string, CliOption> = new Map()

	constructor(env: CliEnvironment) {
		this.env = env
		this.args = env.argv.slice(2)
	}

	async handle() {
        console.log(this.args)

        // Parse initial arguments
        let index = CliOption.parse(this.globalOption, this.args)

        // Get CSV targets
        const readers: CsvReader[] = []
        for (; index < this.args.length ; index++) {
            const arg = this.args[index]
            if (CliOption.isOption(arg, this.fileOption))
                break

            const argPath = path.join(this.env.cwd, arg)
            if (CsvReader.canRead(argPath)) {
                readers.push(new CsvReader(argPath))
            }
            else {
                // console.log('invalid ' + arg)
            }
        }
        
        // Get options after target reference
        index += CliOption.parse(this.fileOption, this.args, index)

        if (readers.length > 0) {
            await readers[0].readAll()
            console.log(readers[0].row[0])
        }
		// const terminal = new Terminal()
		// await terminal.nextKey()
		// console.log('args', this.args)
	}

}
