export interface InputProvider {
  getKnowledgeBasePath(): Promise<string>

  selectMultipleFromList<T>(params: {
    message: string
    choices: {
      name: string
      value: T
    }[]
    pageSize?: number
  }): Promise<T[]>

  selectFromList<T>(params: {
    message: string
    choices: {
      name: string
      value: T
    }[]
  }): Promise<T>

  confirm(params: { message: string; default: boolean }): Promise<boolean>
}
