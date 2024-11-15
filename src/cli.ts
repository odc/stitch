#!/usr/bin/env node

import { Command } from 'commander'
import { registerPrCommand } from './commands/pr'
import { registerPpCommand } from './commands/pp'
import { registerFeatCommand } from './commands/feat'

const program = new Command()

program
  .name('st')
  .description('Stitch CLI - Seamlessly connecting development workflow gaps')
  .version('0.1.0')

registerPrCommand(program)
registerPpCommand(program)
registerFeatCommand(program)

program.parse()
