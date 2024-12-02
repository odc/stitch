import { CLIInputProvider } from '@/services/input/cli-input-provider'
import { InputProvider } from '@/services/input/input-provider'
import { OutputProvider } from '@/services/output/output-provider'
import { StdoutProvider } from '@/services/output/stdout-provider'
import { Command } from 'commander'
import { InitService } from '../services/init.service'

export const init = new Command('init')

export async function initCommand(options: {
  inputProvider: InputProvider
  outputProvider: OutputProvider
  debug?: boolean
}): Promise<void> {
  const service = new InitService(
    options.inputProvider,
    options.outputProvider,
    options.debug
  )
  await service.run()
}

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize stitch configuration')
    .option('-p, --kb-path <path>', 'Path to knowledge base repository')
    .option('-d, --debug', 'Enable debug logging')
    .action(async (options) => {
      try {
        await initCommand({
          ...options,
          inputProvider: new CLIInputProvider(),
          outputProvider: new StdoutProvider(),
        })
      } catch (error) {
        if (options.debug) {
          console.error('Debug error:', error)
        } else {
          console.error(
            'Error:',
            error instanceof Error ? error.message : error
          )
        }
        process.exit(1)
      }
    })
}
