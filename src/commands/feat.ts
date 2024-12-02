import { execSync } from 'child_process'
import { Command } from 'commander'
import fs from 'fs-extra'
import * as path from 'path'
import { execSyncSafe, getCurrentBranch } from '../utils/git'

export function registerFeatCommand(program: Command): void {
  program
    .command('feat <name>')
    .description('Create new feature branch')
    .action(async (name: string) => {
      try {
        await createFeatureBranch(name)
        await copyTemplateFiles(name)
      } catch (error) {
        console.error(
          '❌ Error:',
          error instanceof Error ? error.message : error
        )
        process.exit(1)
      }
    })
}

function validateFeatureName(name: string): void {
  const invalidChars = /[^a-zA-Z0-9-_]/g
  if (invalidChars.test(name)) {
    throw new Error(
      'Feature name can only contain letters, numbers, hyphens, and underscores'
    )
  }
}

async function createFeatureBranch(featureName: string): Promise<void> {
  // 1. Validate feature name
  validateFeatureName(featureName)

  // 2. Create new feature branch name
  const newBranch = `feat/${featureName}`

  // if already on a feature branch, return
  console.log(`Current branch: ${getCurrentBranch()}`)
  if (getCurrentBranch() === newBranch) {
    console.log('You are already on a feature branch, ignoring..')
    return
  }

  // 3. Check if current branch is main
  const currentBranch = getCurrentBranch()
  if (currentBranch !== 'main') {
    throw new Error('Current branch must be main')
  }

  // 4. Check if branch already exists
  const existingBranches = execSyncSafe('git branch')
  if (existingBranches.includes(newBranch)) {
    throw new Error(`Branch ${newBranch} already exists`)
  }

  // 5. Create and checkout new branch
  console.log(`🔄 Creating and switching to new branch: ${newBranch}`)
  execSync(`git checkout -b ${newBranch}`, { stdio: 'inherit' })

  console.log('✨ Done!')
}

async function copyTemplateFiles(featName: string): Promise<void> {
  console.log(`📝 Copying template files for ${featName}`)
  const dir = process.cwd()
  const featureTemplateDir = path.join(dir, 'docs/templates/feature')
  const targetDir = path.join(dir, 'docs/features', featName)

  // copy featureTemplateDir to targetDir
  await fs.copy(featureTemplateDir, targetDir, { overwrite: false })

  console.log(`Copied feature template files to ${targetDir}`)
  const promptFile = path.join(targetDir, 'prompt.md')
  console.log(`✨ Modify ${promptFile} and start hacking!`)
}
