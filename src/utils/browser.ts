import { platform } from 'os'
import { exec } from 'child_process'

type SupportedPlatform = 'darwin' | 'win32' | 'linux'

export async function openBrowser(url: string): Promise<void> {
  const platformCommands: Record<SupportedPlatform, string> = {
    darwin: 'open',
    win32: 'start',
    linux: 'xdg-open',
  }

  const currentPlatform = platform() as SupportedPlatform
  const command = platformCommands[currentPlatform]

  if (!command) {
    console.error('❌ Unsupported platform for opening browser')
    console.log('🔗 PR URL:', url)
    return
  }

  return new Promise((resolve, reject) => {
    exec(`${command} ${url}`, (err) => {
      if (err) {
        console.error('❌ Failed to open browser')
        console.log('🔗 PR URL:', url)
        reject(err)
        return
      }
      resolve()
    })
  })
}
