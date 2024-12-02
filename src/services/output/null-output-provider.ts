import { OutputProvider } from './output-provider'

export class NullOutputProvider implements OutputProvider {
  log(...args: any[]): void {
    // Do nothing
  }

  error(...args: any[]): void {
    // Do nothing
  }
}
