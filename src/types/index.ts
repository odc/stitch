export interface CommandOptions {
  debug?: boolean
}

export interface GitContext {
  branch: string
  repository: string
  changes: string[]
}
