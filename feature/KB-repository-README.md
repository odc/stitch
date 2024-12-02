# ODCode Knowledge Base

> A central repository for AI-enhanced development guidelines and best practices

## Overview

The ODCode Knowledge Base is designed to streamline development with AI tools by providing structured guidelines, patterns, and prompts. Rather than being just another documentation repository, it's specifically structured to be AI-friendly and evolves alongside our AI tooling.

## Why This Exists

Modern development heavily relies on AI assistants like Cursor IDE and Windsurf (by codeium). While these tools are powerful, their effectiveness depends largely on:

- Clear project context and guidelines
- Well-crafted initial prompts
- Consistent coding patterns
- Shared best practices

This Knowledge Base serves as a central source of truth that both humans and AI tools can reference, ensuring consistent high-quality development across projects.

## Structure

```
docs/
├── guidelines/
│   ├── ai-tools/              # AI tool-specific guidelines
│   │   ├── cursor/            # Cursor IDE usage guides
│   │   ├── windsurf/          # Windsurf patterns
│   │   │   ├── default/       # 기본 문서 세트
│   │   │   │   ├── setup.md
│   │   │   │   └── usage.md
│   │   │   ├── experimental-v1/ # 실험적 문서 variation
│   │   │   │   ├── metadata.yaml # variation 메타데이터
│   │   │   │   ├── setup.md
│   │   │   │   └── usage.md
│   │   │   └── metadata.yaml  # 컴포넌트 메타데이터
│   │   └── workflow.md        # **Workflow guideline for AI tools**
│   │
│   └── tech-stack/            # Technology guidelines (examples)
│       ├── typescript/        # TypeScript patterns
│       ├── nestjs/            # NestJS best practices
│       │   ├── default/       # 기본 문서 세트
│       │   │   ├── setup.md
│       │   │   └── best-practices.md
│       │   ├── microservices/ # 특화된 variation
│       │   │   ├── metadata.yaml
│       │   │   └── architecture.md
│       │   └── metadata.yaml
│       └── README.md          # Stack selection guides
│
└── templates/                 # Templates for AI workflows
    ├── feature/               # Feature development workflow
    │    ├── prompt.md         # Initial prompt
    │    ├── requirements.md   # Feature requirements
    │    ├── todo.md           # TODO list by breaking down the requirements
    │    └── changes.md        # User perspective change documents
    └── hotfix/                # Hotfix development workflow
         ├── prompt.md         # Initial prompt
         ├── requirements.md   # Feature requirements
         ├── todo.md           # TODO list by breaking down the requirements
         └── changes.md        # User perspective change documents

```

## Metadata Structure

### Component metadata.yaml
```yaml
name: "windsurf"
category: "ai-tools"
description: "Windsurf 관련 문서"
```

### Variation metadata.yaml
```yaml
name: "experimental-v1"
status: "experimental"
created_at: "2024-01-20"
purpose: "새로운 설치 방식 테스트"
target_audience: "개발자"
```

## Usage

### For Developers

We highly recommend using stich CLI to use this knowledge base:

- **[Stitch CLI](https://github.com/odc/stitch)**: Easily sync project-specific guidelines and prompts

1. **Reference**

   - Browse guidelines relevant to your tech stack
   - Find optimal prompts for your use case
   - Follow established patterns

2. **Contribute**
   - Share successful patterns
   - Propose guideline improvements
   - Submit optimized prompts
   - Pull requests are welcome

### For AI Tools

The repository structure is optimized for AI consumption:

- Clear, consistent document structure
- Context-rich guidelines
- Machine-readable formats

## Contributing

Guidelines evolve with our understanding and tools. We encourage contributions, especially:

- New AI tool integration guides
- Improved prompts
- Pattern discoveries
- Best practice refinements

### Contribution Process

1. Fork the repository
2. Create a feature branch
3. Submit a pull request with:
   - Clear description of changes
   - Context and reasoning
   - Real-world examples

## Integration

This Knowledge Base is designed to work seamlessly with our tooling:

- **[Stitch CLI](https://github.com/odc/stitch)**: Easily sync project-specific guidelines and prompts
- **AI IDEs**: Optimized structure for AI context understanding
- **Project Templates**: Ready-to-use project setups
