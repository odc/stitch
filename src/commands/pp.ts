import { Command } from 'commander'
import { execSync } from 'child_process'
import {
  getGitRoot,
  hasLocalChanges,
  getRemoteBranches,
  readPPConfig,
  isBranchProtected,
  execSyncSafe,
} from '../utils/git'

export function registerPpCommand(program: Command): void {
  program
    .command('pp')
    .description('Pull & Prune. Sync remote and cleanup local branches')
    .action(async () => {
      try {
        await pullAndPrune()
      } catch (error) {
        console.error(
          '❌ Error:',
          error instanceof Error ? error.message : error
        )
        process.exit(1)
      }
    })
}

async function pullAndPrune(): Promise<void> {
  const gitRoot = getGitRoot()
  let didStash = false

  // 1. Stash if needed
  if (hasLocalChanges()) {
    console.log('💾 Stashing local changes...')
    execSync('git stash', { stdio: 'inherit' })
    didStash = true
  }

  try {
    // 2. Switch to main
    console.log('🔄 Switching to main branch...')
    execSync('git checkout main', { stdio: 'inherit' })

    // 3. Fetch and prune
    console.log('📥 Syncing with remote...')
    execSync('git fetch --all --prune', { stdio: 'inherit' })

    // 4. Get remote branches
    const remoteBranches = getRemoteBranches()

    // 5. Update main
    console.log('📥 Updating main branch...')
    execSync('git pull origin main', { stdio: 'inherit' })

    // 6. Update other branches
    console.log('\n📥 Updating other branches...')
    const localBranches = execSyncSafe(
      'git for-each-ref --format="%(refname:short)" refs/heads/'
    )
      .split('\n')
      .filter((b) => b && b !== 'main')

    for (const branch of localBranches) {
      if (remoteBranches.has(branch)) {
        try {
          console.log(`   Updating ${branch}...`)
          execSync(`git fetch origin ${branch}:${branch}`, { stdio: 'inherit' })
        } catch (error) {
          console.warn(`   ⚠️  Failed to update ${branch}`)
        }
      } else {
        console.log(`   ℹ️  Skipping ${branch} (no remote branch)`)
      }
    }

    // 7. Read config and find branches to delete
    const { protectedPatterns } = readPPConfig(gitRoot)
    console.log('\n🛡️  Protected branch patterns:', protectedPatterns)

    const mergedBranches = execSyncSafe('git branch --merged')
      .split('\n')
      .map((b) => b.trim())
      .filter((b) => b && !b.startsWith('*'))

    const branchesToDelete = mergedBranches.filter(
      (branch) => !isBranchProtected(branch, protectedPatterns)
    )

    // 8. Delete branches
    if (branchesToDelete.length === 0) {
      console.log('✨ No merged branches to delete')
    } else {
      console.log('\n🗑️  Deleting merged branches:')
      branchesToDelete.forEach((branch) => {
        try {
          execSync(`git branch -d ${branch}`)
          console.log(`   ✅ Deleted: ${branch}`)
        } catch (error) {
          if (error instanceof Error) {
            console.error(`   ❌ Failed to delete ${branch}: ${error.message}`)
          }
        }
      })
    }
  } finally {
    // 9. Restore stashed changes if any
    if (didStash) {
      console.log('\n💾 Popping stashed changes...')
      execSync('git stash pop', { stdio: 'inherit' })
    }
  }

  console.log('\n✨ Done!')
}
