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
npm install -g @odc/stitch
# or
yarn global add @odc/stitch
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

Contributions are welcome!

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

---
