import { StitchConfig } from '@/types/kb'
import { WorkflowContext } from '@/types/workflow'
import fs from 'fs-extra'
import Mustache from 'mustache'
import * as path from 'path'
import YAML from 'yaml'
import { InputProvider } from './input/input-provider'
import { KBService } from './kb.service'
import { OutputProvider } from './output/output-provider'

export class SyncService {
  private kbService: KBService | null = null

  constructor(
    private inputProvider: InputProvider,
    private outputProvider: OutputProvider,
    private debug: boolean = false
  ) {}

  async run(): Promise<void> {
    try {
      // 1. Read and validate stitch.yaml
      const config = await this.readConfig()

      // 2. Initialize KB service and validate repository
      this.kbService = new KBService(
        config.kb.repository,
        this.outputProvider,
        this.debug
      )
      await this.kbService.validateRepository()

      // Update config with validated repository path
      config.kb.repository = this.kbService.getRepoPath()

      // 3. Sync components
      await this.syncComponents(config)

      // 4. Sync template directory
      await this.syncTemplateDirectory(config)

      // 5. Sync workflow.md.mustache
      await this.syncWorkflowFile(config)

      this.outputProvider.log('✨ Sync completed successfully!')
    } finally {
      // Clean up temporary directory if needed
      if (this.kbService) {
        await this.kbService.cleanup()
      }
    }
  }

  private async readConfig(): Promise<StitchConfig> {
    const configPath = path.join(process.cwd(), 'stitch.yaml')

    try {
      const configContent = await fs.readFile(configPath, 'utf-8')
      return YAML.parse(configContent)
    } catch (error) {
      this.outputProvider.error(error)
      throw new Error('stitch.yaml not found or invalid')
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
        component.name
        // variation is not included in targetPath
        // component.variation
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

  private async generateRenderingContext(): Promise<WorkflowContext> {
    const guidelinesPath = path.join(process.cwd(), 'docs/guidelines')

    try {
      const categories = await fs.readdir(guidelinesPath)
      const validCategories = await Promise.all(
        categories
          .filter((category) => category !== 'ai-tools') // Exclude ai-tools directory
          .map(async (category) => {
            const categoryPath = path.join(guidelinesPath, category)
            const stat = await fs.stat(categoryPath)
            if (!stat.isDirectory()) return null

            try {
              const components = await fs.readdir(categoryPath)
              const validComponents = await Promise.all(
                components.map(async (component) => {
                  const componentPath = path.join(categoryPath, component)
                  const stat = await fs.stat(componentPath)
                  if (!stat.isDirectory()) return null

                  return {
                    name: component,
                    relative_path: path
                      .join('docs/guidelines', category, component)
                      .replace(/\\/g, '/'), // Normalize path separators
                  }
                })
              )

              return {
                name: category,
                components: validComponents.filter(
                  (comp): comp is NonNullable<typeof comp> => comp !== null
                ),
              }
            } catch (error) {
              if (this.debug) {
                this.outputProvider.log(
                  `Error reading components in category ${category}:`,
                  error
                )
              }
              return null
            }
          })
      )

      return {
        categories: validCategories.filter(
          (cat): cat is NonNullable<typeof cat> => cat !== null
        ),
      }
    } catch (error) {
      if (this.debug) {
        this.outputProvider.log('Error generating rendering context:', error)
      }
      throw new Error('Failed to generate workflow rendering context')
    }
  }

  private async syncWorkflowFile(config: StitchConfig): Promise<void> {
    const sourceFile = path.join(
      config.kb.repository,
      'docs/guidelines/ai-tools/workflow.md.mustache'
    )
    const targetMustacheFile = path.join(
      process.cwd(),
      'docs/guidelines/ai-tools/workflow.md.mustache'
    )
    const targetFile = path.join(
      process.cwd(),
      'docs/guidelines/ai-tools/workflow.md'
    )

    const exists = await fs.pathExists(sourceFile)
    if (!exists) {
      throw new Error('Workflow template not found in KB')
    }

    try {
      // 1. Copy mustache template
      await fs.ensureDir(path.dirname(targetMustacheFile))
      await fs.copy(sourceFile, targetMustacheFile, {
        overwrite: true,
        errorOnExist: false,
      })

      // 2. Generate rendering context
      const context = await this.generateRenderingContext()

      // 3. Read and render template
      const template = await fs.readFile(targetMustacheFile, 'utf-8')
      const rendered = Mustache.render(
        template,
        context,
        {},
        { escape: (text) => text }
      )

      // 4. Save rendered file
      await fs.writeFile(targetFile, rendered)

      // 5. Remove mustache template
      await fs.remove(targetMustacheFile)

      if (this.debug) {
        this.outputProvider.log('Successfully rendered workflow.md')
      }
    } catch (error) {
      // Clean up mustache template in case of error
      try {
        await fs.remove(targetMustacheFile)
      } catch (cleanupError) {
        if (this.debug) {
          this.outputProvider.log(
            'Error cleaning up mustache template:',
            cleanupError
          )
        }
      }

      if (this.debug) {
        this.outputProvider.log('Error rendering workflow:', error)
      }
      throw new Error('Failed to render workflow.md')
    }
  }
}
