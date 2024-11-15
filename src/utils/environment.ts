export function showEnvironmentGuide(missingEnvs: string[]): void {
  console.log('\n🔧 Environment Setup Guide:')

  if (missingEnvs.includes('ANTHROPIC_API_KEY')) {
    console.log('\n📍 ANTHROPIC_API_KEY 설정하기:')
    console.log('1. https://console.anthropic.com/ 에서 계정을 생성하세요.')
    console.log('2. Settings > API Keys 에서 새로운 API 키를 생성하세요.')
    console.log('3. 다음과 같이 환경변수를 설정하세요:')
    console.log('   export ANTHROPIC_API_KEY="your-api-key"')
    console.log('   또는 ~/.bashrc 나 ~/.zshrc 에 추가하세요.\n')
  }

  if (missingEnvs.includes('GITHUB_TOKEN')) {
    console.log('\n📍 GITHUB_TOKEN 설정하기 (선택사항):')
    console.log(
      '1. https://github.com/settings/tokens 에서 새로운 토큰을 생성하세요.'
    )
    console.log('2. 필요한 권한: repo (repository 접근)')
    console.log('3. 다음과 같이 환경변수를 설정하세요:')
    console.log('   export GITHUB_TOKEN="your-github-token"')
    console.log('   또는 ~/.bashrc 나 ~/.zshrc 에 추가하세요.\n')
  }
}

export function checkEnvironment(): void {
  const missingEnvs: string[] = []

  if (!process.env.ANTHROPIC_API_KEY) {
    missingEnvs.push('ANTHROPIC_API_KEY')
  }

  if (!process.env.GITHUB_TOKEN) {
    missingEnvs.push('GITHUB_TOKEN')
  }

  if (missingEnvs.length > 0) {
    console.log('\n⚠️ Missing environment variables detected.')
    showEnvironmentGuide(missingEnvs)

    if (missingEnvs.includes('ANTHROPIC_API_KEY')) {
      throw new Error('ANTHROPIC_API_KEY is required to continue.')
    }
  }
}
