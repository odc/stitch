import { execSync } from 'child_process'
import { generatePRDescription } from './ai.service'
import { createGitHubPR, getRepoPath } from './github.service'
import { openBrowser } from '../utils/browser'
import { checkEnvironment } from '../utils/environment'
import { getCommitMessages } from '../utils/git'

export async function createPullRequest(): Promise<void> {
  // 환경 변수 체크
  checkEnvironment()

  // 작업 디렉토리 상태 체크
  const status = execSync('git status --porcelain').toString()
  if (status.length > 0) {
    throw new Error(
      'Working directory is not clean. Please commit or stash your changes.'
    )
  }

  // 현재 브랜치 가져오기
  const currentBranch = execSync('git branch --show-current').toString().trim()

  // 커밋 메시지 출력
  console.log('\n📝 Commits to be included in PR:')
  const commitMessages = getCommitMessages()
  if (commitMessages) {
    console.log(
      commitMessages
        .split('\n')
        .map((msg) => `  ${msg}`)
        .join('\n')
    )
  }
  console.log()

  // PR 설명 생성
  console.log('🤖 Generating PR description using Claude...')
  const prContent = await generatePRDescription(commitMessages)
  console.log('\n📋 Generated PR Content:')
  console.log(`Title: ${prContent.title}`)
  console.log(`Description:\n${prContent.description}\n`)

  // 브랜치 push
  console.log('📤 Pushing to origin...')
  execSync(`git push -u origin ${currentBranch}`)

  // PR 생성
  const repoPath = getRepoPath()
  let prUrl = null

  if (process.env.GITHUB_TOKEN) {
    console.log('🔄 Creating PR via GitHub API...')
    prUrl = await createGitHubPR(
      repoPath,
      currentBranch,
      prContent.title,
      prContent.description
    )
  }

  if (!prUrl) {
    prUrl = `https://github.com/${repoPath}/pull/new/${currentBranch}`
  }

  // PR 페이지 열기
  console.log('🔗 Opening PR page...')
  await openBrowser(prUrl)

  console.log('✅ Done!')
}
