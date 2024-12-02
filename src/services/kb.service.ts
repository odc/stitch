import { exec } from 'child_process'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import { simpleGit, SimpleGit } from 'simple-git'
import { promisify } from 'util'
import YAML from 'yaml'
import { ComponentMetadata, VariationMetadata } from '../types/kb'
import { OutputProvider } from './output/output-provider'

const execAsync = promisify(exec)

export class KBService {
  private git: SimpleGit
  // cloned repository path (if remote, temp dir)
  private repoPath: string
  // normalized repository path
  private originalPath: string
  private isTemp: boolean = false
  private debug: boolean = false // Add debug flag

  constructor(
    repoPath: string,
    private outputProvider: OutputProvider,
    _debug: boolean = false
  ) {
    this.debug = _debug
    this.originalPath = repoPath
    this.repoPath = repoPath
    this.git = simpleGit()
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log(...args)
    }
  }

  private async createTempDir(): Promise<string> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stitch-'))
    this.isTemp = true
    return tempDir
  }

  private async normalizeGitUrl(repoPath: string): Promise<string> {
    // 이미 완전한 URL이면 그대로 반환
    if (repoPath.startsWith('git@') || repoPath.startsWith('https://')) {
      return repoPath
    }

    try {
      // 먼저 로컬 디렉토리인지 확인
      const resolvedPath = path.resolve(repoPath)
      const stat = await fs.stat(resolvedPath)
      if (stat.isDirectory()) {
        return resolvedPath
      }
    } catch (error) {
      // 로컬 디렉토리가 아닌 경우, GitHub org/repo 형식인지 확인
      const parts = repoPath.split('/')
      if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
        // 원격 저장소 URL로 변환할 때는 SSH 형식 사용
        return `git@github.com:${repoPath}.git`
      }
    }

    return repoPath
  }

  async validateRepository(): Promise<void> {
    // URL 정규화
    const normalizedPath = await this.normalizeGitUrl(this.repoPath)
    this.log('Normalized repository path:', normalizedPath)

    // Check if it's a git URL
    if (
      normalizedPath.startsWith('git@') ||
      normalizedPath.startsWith('https://')
    ) {
      this.originalPath = normalizedPath
      const tempPath = await this.createTempDir()

      try {
        this.outputProvider.log(`Cloning repository from ${normalizedPath}...`)
        await this.git.clone(normalizedPath, tempPath, [
          '--depth',
          '1',
          '--single-branch',
          '--branch',
          'main',
        ])
        this.repoPath = tempPath
      } catch (mainError) {
        // main 브랜치가 없다면 master를 시도
        try {
          this.outputProvider.log(
            'Main branch not found, trying master branch...'
          )
          await this.git.clone(normalizedPath, tempPath, [
            '--depth',
            '1',
            '--single-branch',
            '--branch',
            'master',
          ])
          this.repoPath = tempPath
        } catch (masterError) {
          // 원본 git 에러를 그대로 전달
          throw mainError
        }
      }
    }

    try {
      const stat = await fs.stat(this.repoPath)
      if (!stat.isDirectory()) {
        throw new Error(`Path ${this.repoPath} is not a directory`)
      }

      // Check if it's a git repository
      this.git.cwd(this.repoPath)
      const isRepo = await this.git.checkIsRepo()
      if (!isRepo) {
        throw new Error(`Path ${this.repoPath} is not a git repository`)
      }
    } catch (error) {
      // fs.stat 에러나 git 에러를 그대로 전달
      throw error
    }
  }

  async getComponentMetadata(
    category: string,
    name: string
  ): Promise<ComponentMetadata> {
    const metadataPath = path.join(
      this.repoPath,
      category,
      name,
      'metadata.yaml'
    )
    try {
      const content = await fs.readFile(metadataPath, 'utf8')
      return YAML.parse(content)
    } catch (error) {
      throw new Error('Component metadata not found')
    }
  }

  async getVariationMetadata(
    category: string,
    name: string,
    variation: string
  ): Promise<VariationMetadata> {
    const metadataPath = path.join(
      this.repoPath,
      category,
      name,
      variation,
      'metadata.yaml'
    )
    try {
      const content = await fs.readFile(metadataPath, 'utf8')
      return YAML.parse(content)
    } catch (error) {
      throw new Error(`Variation metadata not found: ${variation}`)
    }
  }

  async listVariations(category: string, name: string): Promise<string[]> {
    const componentPath = path.join(this.repoPath, category, name)
    try {
      const entries = await fs.readdir(componentPath, { withFileTypes: true })
      return entries
        .filter((entry) => entry.isDirectory() && entry.name !== '.git')
        .map((entry) => entry.name)
    } catch (error) {
      throw new Error('Failed to list variations')
    }
  }

  async getCurrentCommitHash(): Promise<string> {
    try {
      this.git.cwd(this.repoPath)
      const hash = await this.git.revparse(['HEAD'])
      return hash.trim()
    } catch (error) {
      this.outputProvider.error(error)
      throw new Error('Failed to get current commit hash')
    }
  }

  async cleanup(): Promise<void> {
    if (this.isTemp && this.repoPath) {
      try {
        await fs.rm(this.repoPath, { recursive: true, force: true })
      } catch (error) {
        this.outputProvider.error(
          'Failed to cleanup temporary directory:',
          error
        )
      }
    }
  }

  getOriginalPath(): string {
    return this.originalPath
  }

  getRepoPath(): string {
    return this.repoPath
  }

  async scanKBRepository(): Promise<{
    categories: string[]
    components: Record<string, ComponentInfo[]>
  }> {
    const guidelinesPath = path.join(this.repoPath, 'docs/guidelines')

    try {
      const categories = await fs.readdir(guidelinesPath)
      const components: Record<string, ComponentInfo[]> = {}

      for (const category of categories) {
        const categoryPath = path.join(guidelinesPath, category)
        const stats = await fs.stat(categoryPath)

        if (!stats.isDirectory()) continue

        const componentDirs = await fs.readdir(categoryPath)
        components[category] = []

        for (const component of componentDirs) {
          const componentPath = path.join(categoryPath, component)
          const componentStats = await fs.stat(componentPath)

          if (!componentStats.isDirectory()) continue

          const variationsPath = path.join(componentPath, 'variations')
          let variations: string[] = []

          try {
            const variationFiles = await fs.readdir(variationsPath)
            variations = variationFiles
              .filter((file) => {
                const ext = path.extname(file)
                return ext === '.md' || ext === '.mdx'
              })
              .map((file) => path.basename(file, path.extname(file)))
          } catch (error) {
            // variations 디렉토리가 없거나 접근할 수 없는 경우 무시
            if (this.debug) {
              this.outputProvider.log(
                `No variations found for ${category}/${component}:`,
                error
              )
            }
          }

          components[category].push({
            name: component,
            variations,
          })
        }
      }

      return { categories, components }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(
          `KB repository structure is invalid. Missing 'docs/guidelines' directory in ${this.repoPath}`
        )
      }
      throw error
    }
  }
}

interface ComponentInfo {
  name: string
  variations: string[]
}
