import { Command } from 'commander'
import { createPullRequest } from '../services/pr.service'

export function registerPrCommand(program: Command): void {
  program
    .command('pr')
    .description('Create PR with AI-generated summary')
    .action(async () => {
      try {
        await createPullRequest()
      } catch (error) {
        console.error(
          '❌ Error:',
          error instanceof Error ? error.message : error
        )
        process.exit(1)
      }
    })
}
