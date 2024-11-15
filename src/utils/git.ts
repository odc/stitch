import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export function execSyncSafe(command: string, options: object = {}): string {
  try {
    return execSync(command, { ...options, stdio: 'pipe' })
      .toString()
      .trim()
  } catch (error) {
    return ''
  }
}

export function getGitRoot(): string {
  const root = execSyncSafe('git rev-parse --show-toplevel')
  if (!root) {
    throw new Error('Not a git repository')
  }
  return root
}

export function getCurrentBranch(): string {
  return execSyncSafe('git branch --show-current')
}

export function hasLocalChanges(): boolean {
  return execSyncSafe('git status --porcelain') !== ''
}

export function getRemoteBranches(): Set<string> {
  const output = execSyncSafe('git ls-remote --heads origin')
  if (!output) return new Set()

  return new Set(
    output
      .split('\n')
      .map((line) => line.match(/refs\/heads\/(.+)$/)?.[1])
      .filter((branch): branch is string => Boolean(branch))
  )
}

export function getCommitMessages(): string {
  const format =
    '%H%n작성자: %an%n작성일시: %ai%n%n%B%n----------------------------------------%n'
  const messages = execSyncSafe(
    `git log main..HEAD --pretty=format:"${format}"`
  )

  if (!messages) {
    console.log('ℹ️ No commits between main and current branch')
    return ''
  }
  return messages
}

// PP 명령어 관련 유틸리티
export interface PPConfig {
  protectedPatterns: string[]
}

export function readPPConfig(gitRoot: string): PPConfig {
  const DEFAULT_PROTECTED = ['main', 'develop']
  const ppignorePath = path.join(gitRoot, '.ppignore')

  try {
    if (fs.existsSync(ppignorePath)) {
      const content = fs.readFileSync(ppignorePath, 'utf8')
      const patterns = content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'))

      return {
        protectedPatterns: [...DEFAULT_PROTECTED, ...patterns],
      }
    }
  } catch (error) {
    console.warn('⚠️  Failed to read .ppignore file')
  }

  return {
    protectedPatterns: DEFAULT_PROTECTED,
  }
}

export function isBranchProtected(
  branch: string,
  protectedPatterns: string[]
): boolean {
  return protectedPatterns.some((pattern) => {
    if (pattern === branch) return true
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    )
    return regex.test(branch)
  })
}
