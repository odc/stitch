import https from 'https'

interface PRContent {
  title: string
  description: string
}

export async function generatePRDescription(
  commitMessages: string
): Promise<PRContent> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required')
  }

  const language = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(commitMessages) ? 'ko' : 'en'

  const systemPrompt =
    language === 'ko'
      ? `커밋 메시지들을 분석하여 PR의 제목과 설명을 생성합니다...`
      : `Analyze commit messages and generate a PR title and description...`

  const userPrompt =
    language === 'ko'
      ? `다음 커밋들의 전체 내용을 바탕으로 PR의 제목과 설명을 생성해주세요. 단, 이 내용들이 하나의 PR 에 담길 것이므로 각각의 커밋을 요약하는 방식이 아닌, 전체를 하나의 변경으로 보고 내용을 작성하세요 :\n\n${commitMessages}`
      : `Based on the full content of these commits, please generate a PR title and description. Please write the content as a single change, not as a summary of each commit:\n\n${commitMessages}`

  const requestData = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  }

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      },
      (response) => {
        let data = ''
        response.on('data', (chunk) => (data += chunk))
        response.on('end', () => {
          try {
            const jsonResponse = JSON.parse(data)

            if (response.statusCode !== 200) {
              reject(
                new Error(`Claude API returned status ${response.statusCode}`)
              )
              return
            }

            const content = jsonResponse.content[0].text
            const titleMatch = content.match(/(?:Title|제목):\s*([^\n]+)/)
            const title = titleMatch ? titleMatch[1].trim() : ''
            const description = content
              .replace(/(?:Title|제목):.*?\n/s, '')
              .trim()

            resolve({ title, description })
          } catch (error) {
            reject(
              error instanceof Error
                ? error
                : new Error('Failed to parse API response')
            )
          }
        })
      }
    )

    request.on('error', reject)
    request.write(JSON.stringify(requestData))
    request.end()
  })
}
