export interface OutputProvider {
  log(...args: any[]): void
  error(...args: any[]): void
}
