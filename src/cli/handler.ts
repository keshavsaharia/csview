import os from 'os'
import fs from 'fs'

import { Terminal } from '..'
import { CliEnvironment } from './types'

/**
 * Created on cli initialization
 */
export class CliHandler {
	env: CliEnvironment
	args: string[]

	constructor(env: CliEnvironment) {
		this.env = env
		this.args = env.argv.slice(2)
	}

	async handle() {
		// const terminal = new Terminal()
		// await terminal.nextKey()
		console.log('args', this.args)
	}

}
