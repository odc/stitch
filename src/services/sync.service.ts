import { StitchConfig } from '@/types/kb'
import * as fs from 'fs-extra'
import * as path from 'path'
import YAML from 'yaml'
import { InputProvider } from './input/input-provider'
import { OutputProvider } from './output/output-provider'

export class SyncService {
  constructor(
    private inputProvider: InputProvider,
    private outputProvider: OutputProvider,
    private debug: boolean = false
  ) {}

  async run(): Promise<void> {
    // 1. Read and validate stitch.yaml
    const config = await this.readConfig()
    await this.validateConfig(config)

    // 2. Sync components
    await this.syncComponents(config)

    // 3. Sync template directory
    await this.syncTemplateDirectory(config)

    // 4. Sync workflow.md.mustache
    await this.syncWorkflowFile(config)

    this.outputProvider.log('✨ Sync completed successfully!')
  }

  private async readConfig(): Promise<StitchConfig> {
    const configPath = path.join(process.cwd(), 'stitch.yaml')

    try {
      const configContent = await fs.readFile(configPath, 'utf-8')
      return YAML.parse(configContent)
    } catch (error) {
      throw new Error('stitch.yaml not found')
    }
  }

  private async validateConfig(config: StitchConfig): Promise<void> {
    if (!config.kb?.repository) {
      throw new Error('KB repository path not configured')
    }

    const kbPath = config.kb.repository
    const exists = await fs.pathExists(kbPath)
    if (!exists) {
      throw new Error('Invalid KB repository path')
    }

    // Check if it's a valid git repository
    const gitPath = path.join(kbPath, '.git')
    const isGitRepo = await fs.pathExists(gitPath)
    if (!isGitRepo) {
      throw new Error('Invalid KB repository')
    }
  }

  private async syncComponents(config: StitchConfig): Promise<void> {
    for (const component of config.components) {
      const sourcePath = path.join(
        config.kb.repository,
        'docs/guidelines',
        component.category,
        component.name,
        component.variation
      )

      const targetPath = path.join(
        process.cwd(),
        'docs/guidelines',
        component.category,
        component.name,
        component.variation
      )

      const exists = await fs.pathExists(sourcePath)
      if (!exists) {
        throw new Error('Component not found in KB')
      }

      // Ensure target directory exists
      await fs.ensureDir(path.dirname(targetPath))

      // Copy component
      await fs.copy(sourcePath, targetPath, {
        overwrite: true,
        errorOnExist: false,
      })

      if (this.debug) {
        this.outputProvider.log(`Synced component: ${component.name}`)
      }
    }
  }

  private async syncTemplateDirectory(config: StitchConfig): Promise<void> {
    const sourceTemplatePath = path.join(config.kb.repository, 'docs/templates')
    const targetTemplatePath = path.join(process.cwd(), 'docs/templates')

    const exists = await fs.pathExists(sourceTemplatePath)
    if (!exists) {
      if (this.debug) {
        this.outputProvider.log(
          'Template directory not found in KB, skipping...'
        )
      }
      return
    }

    // Ensure target directory exists
    await fs.ensureDir(targetTemplatePath)

    // Copy template directory
    await fs.copy(sourceTemplatePath, targetTemplatePath, {
      overwrite: true,
      errorOnExist: false,
    })

    if (this.debug) {
      this.outputProvider.log('Synced template directory')
    }
  }

  private async syncWorkflowFile(config: StitchConfig): Promise<void> {
    const sourceFile = path.join(
      config.kb.repository,
      'docs/guidelines/ai-tools/workflow.md.mustache'
    )
    const targetFile = path.join(
      process.cwd(),
      'docs/guidelines/ai-tools/workflow.md.mustache'
    )

    const exists = await fs.pathExists(sourceFile)
    if (!exists) {
      throw new Error('Workflow file not found in KB')
    }

    // Ensure target directory exists
    await fs.ensureDir(path.dirname(targetFile))

    // Copy workflow file
    await fs.copy(sourceFile, targetFile, {
      overwrite: true,
      errorOnExist: false,
    })

    if (this.debug) {
      this.outputProvider.log('Synced workflow.md.mustache')
    }
  }
}
