import https from 'https'
import { execSync } from 'child_process'

export function getRepoPath(): string {
  const remoteUrl = execSync('git remote get-url origin').toString().trim()
  if (!remoteUrl.includes('github.com')) {
    throw new Error('Remote origin is not a GitHub repository')
  }

  const [, repoPath] = remoteUrl.match(/github\.com[:/](.+?)(?:\.git)?$/) || []
  if (!repoPath) {
    throw new Error('Could not parse GitHub repository path')
  }

  return repoPath
}

export async function createGitHubPR(
  repoPath: string,
  branch: string,
  title: string,
  description: string
): Promise<string | null> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN
  if (!GITHUB_TOKEN) {
    return null
  }

  const [owner, repo] = repoPath.split('/')
  const requestData = {
    title,
    body: description,
    head: branch,
    base: 'main',
  }

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: 'api.github.com',
        path: `/repos/${owner}/${repo}/pulls`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${GITHUB_TOKEN}`,
          'User-Agent': 'stitch-cli',
        },
      },
      (response) => {
        let data = ''
        response.on('data', (chunk) => (data += chunk))
        response.on('end', () => {
          try {
            const jsonResponse = JSON.parse(data)
            resolve(jsonResponse.html_url || null)
          } catch (error) {
            reject(new Error('Failed to parse GitHub API response'))
          }
        })
      }
    )

    request.on('error', reject)
    request.write(JSON.stringify(requestData))
    request.end()
  })
}
