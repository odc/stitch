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
import { initCommand } from '../init'

const execAsync = promisify(exec)
const nestjs = { category: 'tech-stack', name: 'nestjs', variation: 'default' }
const nestjsExp1 = { category: 'tech-stack', name: 'nestjs', variation: 'exp1' }
const typescript = {
  category: 'tech-stack',
  name: 'typescript',
  variation: 'default',
}

describe('st init command', () => {
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

    // Create test project directory
    await fs.mkdir(projectDir)
    process.chdir(projectDir)
  })

  afterEach(async () => {
    process.chdir(originalCwd)
    // await fs.rm(tempDir, { recursive: true, force: true })
  })

  async function readConfig(): Promise<StitchConfig> {
    const configContent = await fs.readFile(configPath, 'utf-8')
    return YAML.parse(configContent)
  }

  async function createDefaultStitchConfig(): Promise<void> {
    const prevDebug = mockInputProvider.debug
    mockInputProvider.debug = false

    // Set up mock input sequence
    mockInputProvider.setNextSequences(
      mockKBPath, // getKnowledgeBasePath
      'add',
      [nestjs],
      'save'
    )

    await initCommand({ inputProvider: mockInputProvider, outputProvider })

    const configPath = path.join(projectDir, 'stitch.yaml')
    const configExists = await fs
      .access(configPath)
      .then(() => true)
      .catch(() => false)
    expect(configExists).toBe(true)

    const config = await readConfig()
    expect(config).toEqual({
      kb: {
        repository: mockKBPath,
      },
      components: [
        {
          category: 'tech-stack',
          name: 'nestjs',
          variation: 'default',
          current_version: expect.any(String),
          checked_version: expect.any(String),
        },
      ],
    })

    mockInputProvider.debug = prevDebug
  }

  it('should initialize stitch configuration with KB path', async () => {
    await createDefaultStitchConfig()
  })

  it('should handle exit without saving', async () => {
    await createDefaultStitchConfig()
    // Set up mock input sequence
    mockInputProvider.setNextSequences(
      true, // modify existing.
      'remove',
      [nestjs],
      'exit',
      true
    )

    await initCommand({ inputProvider: mockInputProvider, outputProvider })

    const config = await readConfig()
    expect(config.components).toHaveLength(1)
  })

  it('should handle edit (add) configuration', async () => {
    await createDefaultStitchConfig()

    // Then edit configuration
    mockInputProvider.setNextSequences(true, 'add', [typescript], 'save')
    await initCommand({ inputProvider: mockInputProvider, outputProvider })

    const config = await readConfig()
    expect(config.components).toHaveLength(2)
  })

  it('should replace existing component when variation is selected', async () => {
    await createDefaultStitchConfig()

    // Then edit configuration
    mockInputProvider.setNextSequences(true, 'add', [nestjsExp1], 'save')
    await initCommand({ inputProvider: mockInputProvider, outputProvider })

    const config = await readConfig()
    expect(config.components).toHaveLength(1)
    const nestjsVariation = config.components.find(
      (c) => c.name === 'nestjs' && c.variation === 'exp1'
    )
    expect(nestjsVariation).toBeDefined()
  })

  it('should validate KB repository structure', async () => {
    // 메타데이터 파일을 삭제하기 전에 Git repository를 먼저 삭제
    await fs.rm(path.join(mockKBPath, '.git'), { recursive: true })

    mockInputProvider.setNextSequences(mockKBPath)

    await expect(
      initCommand({
        inputProvider: mockInputProvider,
        outputProvider,
      })
    ).rejects.toThrow('Invalid KB repository')
  })

  it('should handle multiple component selections', async () => {
    await createDefaultStitchConfig()

    // Set up mock input sequence
    mockInputProvider.setNextSequences(
      true,
      'add',
      [nestjsExp1, typescript],
      'save'
    )

    await initCommand({ inputProvider: mockInputProvider, outputProvider })

    const config = await readConfig()
    expect(config.components).toHaveLength(2)
    const nestjsVariation = config.components.find(
      (c) => c.name === 'nestjs' && c.variation === 'exp1'
    )
    expect(nestjsVariation).toBeDefined()
    const typescriptVariation = config.components.find(
      (c) => c.name === 'typescript' && c.variation === 'default'
    )
    expect(typescriptVariation).toBeDefined()
  })
})
