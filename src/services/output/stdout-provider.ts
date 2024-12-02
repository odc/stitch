import { OutputProvider } from './output-provider'

export class StdoutProvider implements OutputProvider {
  log(...args: any[]): void {
    console.log(...args)
  }

  error(...args: any[]): void {
    console.error(...args)
  }
}
