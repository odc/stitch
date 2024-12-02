import { Command } from 'commander'
import { CLIInputProvider } from '@/services/input/cli-input-provider'
import { InputProvider } from '@/services/input/input-provider'
import { OutputProvider } from '@/services/output/output-provider'
import { StdoutProvider } from '@/services/output/stdout-provider'
import { SyncService } from '@/services/sync.service'

export async function syncCommand(options: {
  inputProvider: InputProvider
  outputProvider: OutputProvider
  debug?: boolean
}): Promise<void> {
  const service = new SyncService(
    options.inputProvider,
    options.outputProvider,
    options.debug
  )
  await service.run()
}

export function registerSyncCommand(program: Command): void {
  program
    .command('sync')
    .description('Synchronize components and templates from KB repository')
    .option('-d, --debug', 'Enable debug logging')
    .action(async (options) => {
      try {
        await syncCommand({
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
