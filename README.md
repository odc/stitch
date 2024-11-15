# Stitch

> Seamlessly connecting the small gaps in your development workflow with AI

Stitch is a pragmatic CLI toolkit that connects various aspects of modern development workflow. It focuses on bridging small gaps between different development tools, processes, and AI assistants - those minor frustrations that slow you down every day.

## Warning

Stitch is **very** opinionated. It's built for my personal use, and it may not have options for your use case.
Welcome pull requests if you'd like to add features for other people.

## What it solves

Modern development involves constant context switching between:

- Different development tools
- AI assistants and human workflows
- Project structures and IDE setups (especially, cursor.com)
- Git operations and documentation
- Code generation and reviews

Stitch aims to eliminate these small friction points, making your workflow more fluid.

## Roadmap

- [ ] Git workflow enhancement
- [ ] Cursor IDE context management

## Features

### Git workflow enhancement

```bash
st pr         # Create PR with AI-generated summary and context
st pp         # Pull & Prune. Sync remote and delete local branches that no longer exist on remote, and back to main.
st feat       # Create new feature branch and prepare next AI-enhanced workflow.
```

### Cursor IDE context management

TODO

## Installation

```bash
npm install -g @odcode/stitch
# or
yarn global add @odcode/stitch
# or
pnpm add -g @odcode/stitch
```

## Why 'Stitch'?

The name represents our core philosophy:

- Connecting different parts of development smoothly
- Fixing small gaps that cause daily friction
- Keeping things together in a clean, organized way

## Principles

1. **Fix the small things**

   - Focus on common friction points
   - Automate repetitive tasks
   - Maintain context between tools

2. **Stay out of the way**

   - Minimal configuration
   - Sensible defaults
   - Quick commands

3. **Enhance, don't replace**
   - Work with existing tools
   - Provide smart assistance
   - Keep developer in control

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

GitHub Repository: [github.com/odc/stitch](https://github.com/odc/stitch)

## License

MIT

## Development

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0

### Local Development Setup

1. pnpm global directory 설정 (처음 한 번만)

```bash
# pnpm 글로벌 디렉토리 생성
mkdir -p ~/pnpm-global

# pnpm 글로벌 경로 설정
pnpm config set global-dir ~/pnpm-global
pnpm config set global-bin-dir ~/pnpm-global/bin

# PATH 설정 추가 (~/.zshrc 또는 ~/.bashrc)
echo 'export PNPM_HOME="$HOME/pnpm-global/bin"' >> ~/.zshrc
echo 'export PATH="$PNPM_HOME:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

2. 프로젝트 설정

```bash
# 의존성 설치
pnpm install

# 개발 모드 실행
pnpm dev

# 글로벌로 심볼릭 링크 설정
pnpm build
pnpm link --global

# 테스트
st hello
```

### Available Scripts

- `pnpm build`: Build the project
- `pnpm dev`: Run in development mode with watch
- `pnpm test`: Run tests
- `pnpm lint`: Run linter
- `pnpm format`: Format code

## Usage

### `st pr` - Create PR with AI-generated summary

Creates a pull request with an AI-generated description based on your commit messages.

```bash
st pr
```

Requirements:

- Clean working directory (commit or stash changes)
- ANTHROPIC_API_KEY environment variable
- GITHUB_TOKEN environment variable (optional, for automatic PR creation)

### `st pp` - Pull & Prune

Updates your local repository and cleans up merged branches.

```bash
st pp
```

Features:

- Switches to main branch
- Updates all branches from remote
- Deletes local branches that are already merged
- Preserves branches listed in .ppignore

Example .ppignore:

```
# Protect branches matching these patterns
release/*
hotfix/*
```

### `st feat` - Create feature branch

Creates a new feature branch with standardized naming.

```bash
st feat <name>
```

Requirements:

- Must be on main branch
- Name can only contain letters, numbers, hyphens, and underscores

Example:

```bash
st feat add-user-auth
# Creates and switches to feat/add-user-auth
```

## Environment Setup

### Required Environment Variables

1. ANTHROPIC_API_KEY (Required for PR generation)

   ```bash
   export ANTHROPIC_API_KEY="your-api-key"
   ```

   Get your API key from [Claude Console](https://console.anthropic.com/)

2. GITHUB_TOKEN (Optional, for automatic PR creation)
   ```bash
   export GITHUB_TOKEN="your-github-token"
   ```
   Generate token at [GitHub Settings](https://github.com/settings/tokens)
   Required scope: `repo`

## Deployment

### Prerequisites

1. NPM 계정 및 권한

   - @odcode organization의 멤버여야 함
   - Automation token 필요 (2FA 지원)

2. GitHub 설정
   - `NPM_TOKEN`: NPM Automation token
   - `GITHUB_TOKEN`: GitHub Personal Access Token (자동 생성됨)

### Release Process

1. 버전 업데이트 (main 브랜치에서)

```bash
# Patch version update (0.0.x)
pnpm run version:patch

# Minor version update (0.x.0)
pnpm run version:minor

# Major version update (x.0.0)
pnpm run version:major
```

2. 자동 배포

   - 버전 태그가 생성되면 GitHub Actions가 자동으로:
     1. 테스트 실행
     2. 빌드
     3. NPM 배포
     4. GitHub Release 생성

3. 배포 확인

```bash
# 패키지 정보 확인
npm view @odcode/stitch

# 최신 버전 설치
npm install -g @odcode/stitch@latest
```

---
