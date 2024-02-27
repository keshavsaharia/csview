#!/usr/bin/env node

import { CliHandler } from './cli/handler'

new CliHandler({
	cwd: process.cwd(),
	argv: process.argv
}).handle()
