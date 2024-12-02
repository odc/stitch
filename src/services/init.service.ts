import * as fs from 'fs/promises'
import * as path from 'path'
import YAML from 'yaml'
import { KBComponent, StitchConfig } from '../types/kb'
import { InputProvider } from './input/input-provider'
import { KBService } from './kb.service'
import { OutputProvider } from './output/output-provider'

export class InitService {
  private kbService: KBService | null = null
  private debug: boolean

  constructor(
    readonly inputProvider: InputProvider,
    readonly outputProvider: OutputProvider,
    debug: boolean = false
  ) {
    this.debug = debug
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log(...args)
    }
  }

  private async initializeKBService(kbPath?: string): Promise<void> {
    if (!kbPath) {
      kbPath = await this.inputProvider.getKnowledgeBasePath()
    }
    this.kbService = new KBService(kbPath, this.outputProvider, this.debug)
  }

  private async validateKBRepository(): Promise<void> {
    if (!this.kbService) throw new Error('KBService not initialized')
    try {
      await this.kbService.validateRepository()
      this.log('Original repository path:', this.kbService.getOriginalPath())
      this.log('Local repository path:', this.kbService.getRepoPath())

      // Check if the guidelines directory exists
      const guidelinesPath = path.join(
        this.kbService.getRepoPath(),
        'docs/guidelines'
      )
      try {
        this.log(`Checking guidelines directory: ${guidelinesPath}`)
        const stat = await fs.stat(guidelinesPath)
        if (!stat.isDirectory()) {
          throw new Error(
            'Invalid KB repository structure: guidelines is not a directory'
          )
        }
      } catch (error) {
        throw new Error(
          'Invalid KB repository structure: guidelines directory not found'
        )
      }
    } catch (error) {
      this.outputProvider.error(error)
      throw new Error('Invalid KB repository')
    }
  }

  private async loadExistingConfig(): Promise<StitchConfig | null> {
    try {
      const content = await fs.readFile('stitch.yaml', 'utf8')
      return YAML.parse(content)
    } catch (error) {
      return null
    }
  }

  private async scanKBRepository(): Promise<{
    categories: string[]
    components: Record<string, Array<{ name: string; variations: string[] }>>
  }> {
    this.log(`Scanning KB repository: ${this.kbService!.getRepoPath()}`)
    const guidelinesPath = path.join(
      this.kbService!.getRepoPath(),
      'docs/guidelines'
    )

    try {
      const categories = await fs.readdir(guidelinesPath)
      const components: Record<
        string,
        Array<{ name: string; variations: string[] }>
      > = {}

      this.log('Found categories:', categories)

      for (const category of categories) {
        const categoryPath = path.join(guidelinesPath, category)
        const categoryStats = await fs.stat(categoryPath)

        if (!categoryStats.isDirectory()) {
          continue
        }

        const componentDirs = await fs.readdir(categoryPath)
        for (const component of componentDirs) {
          const componentPath = path.join(categoryPath, component)
          const componentStats = await fs.stat(componentPath)

          if (!componentStats.isDirectory()) {
            continue
          }

          const filesInComponent = await fs.readdir(componentPath)
          const variations: string[] = []

          for (const file of filesInComponent) {
            const filePath = path.join(componentPath, file)
            const fileStats = await fs.stat(filePath)

            if (fileStats.isDirectory()) {
              // is variation.
              variations.push(file)
            }
          }

          if (variations.length > 0) {
            components[category] = [
              ...(components[category] ?? []),
              { name: component, variations },
            ]
          }
        }
      }

      return { categories, components }
    } catch (error) {
      this.log('Error scanning KB repository:', error)
      throw new Error('Invalid KB repository')
    }
  }

  private async createEmptyConfigFile(): Promise<void> {
    const config: StitchConfig = {
      kb: {
        repository: this.kbService!.getOriginalPath(),
      },
      components: [],
    }

    await fs.writeFile('stitch.yaml', YAML.stringify(config))
  }

  private async promptForNewConfig(): Promise<
    Omit<KBComponent, 'current_version' | 'checked_version'>[] | null
  > {
    this.log('Scanning KB repository, inside promptForNewConfig()')
    const { categories, components } = await this.scanKBRepository()
    this.log('Scanned repository:')
    this.log('Categories:', categories)
    this.log('Components:', JSON.stringify(components, null, 2))

    // 선택 가능한 모든 variation을 flat하게 만듦
    const choices = categories
      .flatMap(
        (category) =>
          components[category]?.flatMap((component) =>
            component.variations.map((variation) => ({
              name: `${category}/${component.name}/${variation}`,
              value: {
                category,
                name: component.name,
                variation,
              },
            }))
          ) ?? []
      )
      .filter(Boolean)

    if (choices.length === 0) {
      this.outputProvider.error(
        'No available components found in the repository.'
      )
      this.outputProvider.log(
        'Please make sure your repository has the following structure:'
      )
      this.outputProvider.log(
        '  docs/guidelines/[category]/[component]/variations/[variation].md'
      )
      this.outputProvider.log('\nExample:')
      this.outputProvider.log('  docs/guidelines/')
      this.outputProvider.log('  └── ai-tools')
      this.outputProvider.log('      └── cursor')
      this.outputProvider.log('          └── variations')
      this.outputProvider.log('              └── default.md')
      throw new Error('No available components found')
    }

    const selectedItems = await this.inputProvider.selectMultipleFromList({
      message: 'Select components and variations to include:',
      choices,
      pageSize: 20,
    })

    if (!Array.isArray(selectedItems)) {
      throw new Error('Selected items is not an array')
    }

    if (!selectedItems.length) {
      return null
    }

    this.log('Selected items:', selectedItems)

    return selectedItems
  }

  private async promptForConfigModification(
    config: StitchConfig
  ): Promise<StitchConfig | null> {
    while (true) {
      const action = await this.inputProvider.selectFromList({
        message: 'What would you like to do?',
        choices: [
          { name: 'Add new components', value: 'add' },
          { name: 'Remove components', value: 'remove' },
          { name: 'View current configuration', value: 'view' },
          { name: 'Save and exit', value: 'save' },
          { name: 'Exit without saving', value: 'exit' },
        ],
      })
      this.log(`Action = ${action}`)

      const commitHash = await this.kbService!.getCurrentCommitHash()
      switch (action) {
        case 'add': {
          const selectedComponents = await this.promptForNewConfig()
          if (selectedComponents) {
            const messages: string[] = []

            // 동일한 component의 기존 variation을 제거하고 새로운 것으로 대체
            config.components = config.components.filter((c) => {
              const replacing =
                c.category === selectedComponents[0].category &&
                c.name === selectedComponents[0].name

              if (replacing) {
                messages.push(
                  `Replacing ${c.category}/${c.name}/${c.variation} with ${selectedComponents[0].category}/${selectedComponents[0].name}/${selectedComponents[0].variation}`
                )
              }
              return !replacing
            })

            for (const message of messages) {
              this.outputProvider.log(message)
            }

            config.components.push(
              ...selectedComponents.map((c) => ({
                ...c,
                current_version: commitHash,
                checked_version: commitHash,
              }))
            )
          }
          break
        }
        case 'remove': {
          if (config.components.length === 0) {
            this.outputProvider.log('No components to remove.')
            break
          }

          const selectedComponents =
            await this.inputProvider.selectMultipleFromList({
              message: 'Select components to remove:',
              choices: config.components.map((c) => ({
                name: `${c.category}/${c.name}/${c.variation}`,
                value: c,
              })),
              pageSize: 20,
            })
          // const { selectedComponents } = await inquirer.prompt([
          //   {
          //     type: 'checkbox',
          //     name: 'selectedComponents',
          //     message: 'Select components to remove:',
          //     choices: config.components.map((c) => ({
          //       name: `${c.category}/${c.name}/${c.variation}`,
          //       value: c,
          //     })),
          //   },
          // ])

          config.components = config.components.filter(
            (c) =>
              !selectedComponents.some(
                (s: any) =>
                  s.category === c.category &&
                  s.name === c.name &&
                  s.variation === c.variation
              )
          )
          this.outputProvider.log('Components removed successfully.')
          break
        }
        case 'view': {
          if (config.components.length === 0) {
            this.outputProvider.log('\nNo components configured.')
          } else {
            this.outputProvider.log('\nCurrent configuration:')
            this.outputProvider.log(`Repository: ${config.kb.repository}`)
            this.outputProvider.log('\nComponents:')
            config.components.forEach((c) =>
              this.outputProvider.log(
                `- ${c.category}/${c.name}/${c.variation}`
              )
            )
          }
          break
        }
        case 'save': {
          return config
        }
        case 'exit': {
          const confirm = await this.inputProvider.confirm({
            message: 'Are you sure you want to exit without saving?',
            default: false,
          })
          if (confirm) {
            return null
          }
          break
        }
      }

      this.outputProvider.log() // 빈 줄 추가로 가독성 향상
    }
  }

  private async modifyExistingConfig(): Promise<void> {
    const configPath = path.join(process.cwd(), 'stitch.yaml')
    const configFile = await fs.readFile(configPath, 'utf8')
    const config: StitchConfig = YAML.parse(configFile)

    const kbPath = config.kb.repository
    this.log(`Setting KB repository to: ${kbPath}, read from existing config`)
    await this.initializeKBService(kbPath)
    await this.validateKBRepository()

    const modifiedConfig = await this.promptForConfigModification(config)
    if (modifiedConfig) {
      await this.saveConfig(modifiedConfig)
      this.outputProvider.log('Configuration saved successfully.')
    } else {
      this.outputProvider.log('Configuration not saved.')
    }
  }

  private async saveConfig(config: StitchConfig): Promise<void> {
    await fs.writeFile('stitch.yaml', YAML.stringify(config))
  }

  private async checkExistingConfig(): Promise<boolean> {
    try {
      const configPath = path.join(process.cwd(), 'stitch.yaml')
      await fs.access(configPath)
      return true
    } catch {
      return false
    }
  }

  public async run(): Promise<void> {
    try {
      const configExists = await this.checkExistingConfig()

      if (configExists) {
        const shouldModify = await this.inputProvider.confirm({
          message: 'Found existing configuration. Would you like to modify it?',
          default: true,
        })

        if (shouldModify) {
          await this.modifyExistingConfig()
          return
        }
      }

      await this.initializeKBService()
      await this.validateKBRepository()
      await this.createEmptyConfigFile()
      await this.modifyExistingConfig()
    } catch (error) {
      this.outputProvider.error(error)
      this.outputProvider.log(
        'Error:',
        error instanceof Error ? error.message : error
      )
      throw error
    } finally {
      if (this.kbService) {
        await this.kbService.cleanup()
      }
    }
  }
}
