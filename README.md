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
npm install -g stitch-cli
# or
yarn global add stitch-cli
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

---
