#!/usr/bin/env node
import { Command } from 'commander'
import { registerFeatCommand } from './commands/feat'
import { registerInitCommand } from './commands/init'
import { registerPpCommand } from './commands/pp'
import { registerPrCommand } from './commands/pr'
import { registerSyncCommand } from './commands/sync'

const program = new Command()

program
  .name('st')
  .description('Stitch CLI - Knowledge Base Synchronization Tool')
  .version(require('../package.json').version)

registerPrCommand(program)
registerPpCommand(program)
registerFeatCommand(program)
registerInitCommand(program)
registerSyncCommand(program)

program.parse()
