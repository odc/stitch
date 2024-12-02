import * as fs from 'fs/promises'
import inquirer from 'inquirer'
// @ts-ignore
import inquirerRecursive from 'inquirer-recursive'
import * as path from 'path'
import { InputProvider } from './input-provider'

inquirer.registerPrompt('recursive', inquirerRecursive)

export class CLIInputProvider implements InputProvider {
  async getInput(prompt: string): Promise<string> {
    return prompt
  }

  async getKnowledgeBasePath(): Promise<string> {
    const { kbPath } = await inquirer.prompt([
      {
        type: 'input',
        name: 'kbPath',
        message:
          'Enter the path to your knowledge base repository:\n' +
          '  - Local directory (e.g., ./my-kb)\n' +
          '  - GitHub repository (e.g., odc/odcode-kb)\n' +
          '  - Git URL (e.g., https://github.com/odc/odcode-kb.git)\n' +
          'Path: ',
        validate: async (input) => {
          // 완전한 git URL은 바로 통과
          if (input.startsWith('git@') || input.startsWith('https://')) {
            return true
          }

          try {
            // 먼저 로컬 디렉토리인지 확인
            const resolvedPath = path.resolve(input)
            const stat = await fs.stat(resolvedPath)
            if (stat.isDirectory()) {
              return true
            }
          } catch (error) {
            // 로컬 디렉토리가 아닌 경우, GitHub org/repo 형식인지 확인
            const parts = input.split('/')
            if (
              parts.length === 2 &&
              parts[0].length > 0 &&
              parts[1].length > 0
            ) {
              return true
            }
            return 'Please enter a valid directory path, GitHub repository (org/repo), or git URL'
          }
          return 'Path exists but is not a directory'
        },
      },
    ])
    return kbPath
  }

  async selectMultipleFromList<T>(params: {
    message: string
    choices: {
      name: string
      value: T
    }[]
    pageSize?: number
  }): Promise<T[]> {
    const { selectedItems } = await inquirer.prompt<{
      selectedItems: Array<T>
    }>([
      {
        type: 'checkbox',
        name: 'selectedItems',
        message: params.message,
        choices: params.choices,
        pageSize: params.pageSize,
      },
    ])

    return selectedItems
  }

  async selectFromList<T>(params: {
    message: string
    choices: {
      name: string
      value: T
    }[]
  }): Promise<T> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: params.message,
        choices: params.choices,
      },
    ])
    return action
  }

  async confirm(params: {
    message: string
    default: boolean
  }): Promise<boolean> {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: params.message,
        default: params.default,
      },
    ])

    return confirm
  }
}
