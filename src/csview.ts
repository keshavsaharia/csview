#!/usr/bin/env node --max-old-space-size=8192

import os from 'os'

console.log(process.env)
async function csview(args: string[]) {
	console.log('cwd', process.cwd())
	console.log('args', args)
	console.log('memory', os.freemem())
}

csview(process.argv)
