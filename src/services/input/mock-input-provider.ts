import { InputProvider } from './input-provider'

export class MockInputProvider implements InputProvider {
  constructor(
    private readonly returnSequence: any[],
    public debug: boolean = false
  ) {}

  setNextSequences(...args: any[]) {
    this.returnSequence.push(...args)
  }

  getNext(): any {
    if (this.returnSequence.length === 0) {
      throw new Error('No more inputs to return')
    }

    return this.returnSequence.shift()
  }

  clear() {
    this.returnSequence.length = 0
  }

  log(...args: any[]) {
    if (this.debug) {
      console.log(...args)
    }
  }

  async getKnowledgeBasePath(): Promise<string> {
    const answer = this.getNext()
    this.log('Answering getKnowledgeBasePath', answer)
    return answer
  }

  async selectMultipleFromList<T>(params: {
    message: string
    choices: { name: string; value: T }[]
    pageSize?: number
  }): Promise<T[]> {
    this.log('selectMultipleFromList: ', params.message)
    this.log('List of choices: ', params.choices)
    const answer = this.getNext()
    this.log('Answering : ', params.message, answer)
    return answer
  }

  async selectFromList<T>(params: {
    message: string
    choices: { name: string; value: T }[]
  }): Promise<T> {
    this.log('selectFromList: ', params.message)
    this.log('List of choices: ', params.choices)
    const answer = this.getNext()
    this.log('Answering: ', answer)
    return answer
  }

  async confirm(params: {
    message: string
    default: boolean
  }): Promise<boolean> {
    this.log('Confirming: ', params.message)
    const answer = this.getNext()
    this.log('Answering confirm: ', answer)
    return answer
  }
}
