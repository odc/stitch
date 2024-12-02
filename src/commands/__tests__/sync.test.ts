import { MockInputProvider } from '@/services/input/mock-input-provider'
import { NullOutputProvider } from '@/services/output/null-output-provider'
import { OutputProvider } from '@/services/output/output-provider'
import { StitchConfig } from '@/types/kb'
import { exec } from 'child_process'
import * as fs from 'fs-extra'
import * as os from 'os'
import * as path from 'path'
import { promisify } from 'util'
import YAML from 'yaml'
import { syncCommand } from '../sync'

const execAsync = promisify(exec)

describe('st sync command', () => {
  let tempDir: string
  let mockKBPath: string
  let projectDir: string
  let originalCwd: string
  let mockInputProvider: MockInputProvider
  const outputProvider: OutputProvider = new NullOutputProvider()
  let configPath: string

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks()

    // Initialize mock input provider
    mockInputProvider = new MockInputProvider([], false)

    // 현재 디렉토리 저장
    originalCwd = process.cwd()

    // 테스트용 임시 디렉토리 생성
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'st-test-'))
    mockKBPath = path.join(tempDir, 'mock-kb')
    projectDir = path.join(tempDir, 'test-project')
    configPath = path.join(projectDir, 'stitch.yaml')

    // Mock KB repository 생성
    await fs.mkdir(mockKBPath)
    await execAsync('git init', { cwd: mockKBPath })
    await execAsync('git config user.name "Test User"', { cwd: mockKBPath })
    await execAsync('git config user.email "test@example.com"', {
      cwd: mockKBPath,
    })

    // Copy fixture directory
    const fixtureDir = path.join(__dirname, 'fixtures', 'fixture1')
    await fs.copy(fixtureDir, mockKBPath, {})

    // Create initial commit
    await execAsync('git add .', { cwd: mockKBPath })
    await execAsync('git commit -m "Initial commit"', { cwd: mockKBPath })

    // Create test project directory and move to it
    await fs.mkdir(projectDir)
    process.chdir(projectDir)
  })

  afterEach(async () => {
    process.chdir(originalCwd)
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  async function createDefaultStitchConfig(): Promise<void> {
    const config: StitchConfig = {
      kb: {
        repository: mockKBPath,
      },
      components: [
        {
          category: 'tech-stack',
          name: 'nestjs',
          variation: 'default',
          current_version: '1.0.0',
          checked_version: '1.0.0',
        },
      ],
    }

    await fs.writeFile(configPath, YAML.stringify(config))
  }

  async function readConfig(): Promise<StitchConfig> {
    const configContent = await fs.readFile(configPath, 'utf-8')
    return YAML.parse(configContent)
  }

  it('should fail when stitch.yaml does not exist', async () => {
    await expect(
      syncCommand({ inputProvider: mockInputProvider, outputProvider })
    ).rejects.toThrow('stitch.yaml not found')
  })

  it('should sync components based on stitch.yaml configuration', async () => {
    // Create stitch.yaml with default configuration
    await createDefaultStitchConfig()

    // Run sync command
    await syncCommand({ inputProvider: mockInputProvider, outputProvider })

    // Verify that the component was copied
    const componentPath = path.join(
      projectDir,
      'docs/guidelines/tech-stack/nestjs' // no variation path.
    )
    const exists = await fs.pathExists(componentPath)
    expect(exists).toBe(true)

    // Verify specific files
    const structureFile = path.join(componentPath, 'nestjs-structure.md')
    const structureExists = await fs.pathExists(structureFile)
    expect(structureExists).toBe(true)
  })

  it('should sync template directory', async () => {
    await createDefaultStitchConfig()
    await syncCommand({ inputProvider: mockInputProvider, outputProvider })

    const templatePath = path.join(projectDir, 'docs/templates')
    const exists = await fs.pathExists(templatePath)
    expect(exists).toBe(true)
  })

  it('should always sync workflow.md.mustache', async () => {
    await createDefaultStitchConfig()
    await syncCommand({ inputProvider: mockInputProvider, outputProvider })

    // mustache template will be rendered to workflow.md
    const workflowPath = path.join(
      projectDir,
      'docs/guidelines/ai-tools/workflow.md'
    )
    const exists = await fs.pathExists(workflowPath)
    expect(exists).toBe(true)
  })

  it('should sync multiple components', async () => {
    const config: StitchConfig = {
      kb: {
        repository: mockKBPath,
      },
      components: [
        {
          category: 'tech-stack',
          name: 'nestjs',
          variation: 'default',
          current_version: '1.0.0',
          checked_version: '1.0.0',
        },
        {
          category: 'tech-stack',
          name: 'typescript',
          variation: 'default',
          current_version: '1.0.0',
          checked_version: '1.0.0',
        },
      ],
    }

    await fs.writeFile(configPath, YAML.stringify(config))
    await syncCommand({ inputProvider: mockInputProvider, outputProvider })

    // Verify both components were copied
    const nestjsPath = path.join(
      projectDir,
      'docs/guidelines/tech-stack/nestjs'
    )
    const typescriptPath = path.join(
      projectDir,
      'docs/guidelines/tech-stack/typescript'
    )

    const nestjsExists = await fs.pathExists(nestjsPath)
    const typescriptExists = await fs.pathExists(typescriptPath)

    expect(nestjsExists).toBe(true)
    expect(typescriptExists).toBe(true)
  })

  it('should handle invalid KB repository path', async () => {
    const config: StitchConfig = {
      kb: {
        repository: '/invalid/path',
      },
      components: [],
    }

    await fs.writeFile(configPath, YAML.stringify(config))

    await expect(
      syncCommand({ inputProvider: mockInputProvider, outputProvider })
    ).rejects.toThrow()
  })

  it('should handle missing component in KB', async () => {
    const config: StitchConfig = {
      kb: {
        repository: mockKBPath,
      },
      components: [
        {
          category: 'tech-stack',
          name: 'nonexistent',
          variation: 'default',
          current_version: '1.0.0',
          checked_version: '1.0.0',
        },
      ],
    }

    await fs.writeFile(configPath, YAML.stringify(config))

    await expect(
      syncCommand({ inputProvider: mockInputProvider, outputProvider })
    ).rejects.toThrow('Component not found in KB')
  })

  it('should render workflow.md from mustache template', async () => {
    await createDefaultStitchConfig()

    // Create test directory structure
    const guidelinesPath = path.join(projectDir, 'docs/guidelines')
    await fs.ensureDir(path.join(guidelinesPath, 'tech-stack/nestjs'))
    await fs.ensureDir(path.join(guidelinesPath, 'tech-stack/typescript'))

    await syncCommand({ inputProvider: mockInputProvider, outputProvider })

    // Check if rendered file exists and mustache template is removed
    const mustachePath = path.join(
      projectDir,
      'docs/guidelines/ai-tools/workflow.md.mustache'
    )
    const renderedPath = path.join(
      projectDir,
      'docs/guidelines/ai-tools/workflow.md'
    )

    const mustacheExists = await fs.pathExists(mustachePath)
    const renderedExists = await fs.pathExists(renderedPath)

    expect(mustacheExists).toBe(false) // mustache template should be removed
    expect(renderedExists).toBe(true)

    // Verify rendered content
    const content = await fs.readFile(renderedPath, 'utf-8')
    expect(content).toContain('tech-stack')
    expect(content).toContain('nestjs')
    expect(content).toContain('typescript')
    expect(content).toContain('docs/guidelines/tech-stack/nestjs')
  })
})
