import { execSync } from 'child_process'
import {
  execSyncSafe,
  getCurrentBranch,
  hasLocalChanges,
  isBranchProtected,
} from '../git'

// Mock child_process
jest.mock('child_process')

describe('Git Utilities', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('execSyncSafe', () => {
    it('should return trimmed output on success', () => {
      const mockOutput = Buffer.from('  test output  \n')
      ;(execSync as jest.Mock).mockReturnValue(mockOutput)

      const result = execSyncSafe('test command')
      expect(result).toBe('test output')
    })

    it('should return empty string on error', () => {
      ;(execSync as jest.Mock).mockImplementation(() => {
        throw new Error('Command failed')
      })

      const result = execSyncSafe('test command')
      expect(result).toBe('')
    })
  })

  describe('getCurrentBranch', () => {
    it('should return current branch name', () => {
      const mockOutput = Buffer.from('main\n')
      ;(execSync as jest.Mock).mockReturnValue(mockOutput)

      const result = getCurrentBranch()
      expect(result).toBe('main')
      expect(execSync).toHaveBeenCalledWith('git branch --show-current', {
        stdio: 'pipe',
      })
    })
  })

  describe('hasLocalChanges', () => {
    it('should return true when there are local changes', () => {
      const mockOutput = Buffer.from(' M file.txt\n')
      ;(execSync as jest.Mock).mockReturnValue(mockOutput)

      const result = hasLocalChanges()
      expect(result).toBe(true)
    })

    it('should return false when working directory is clean', () => {
      const mockOutput = Buffer.from('')
      ;(execSync as jest.Mock).mockReturnValue(mockOutput)

      const result = hasLocalChanges()
      expect(result).toBe(false)
    })
  })

  describe('isBranchProtected', () => {
    it('should return true for exact match', () => {
      const result = isBranchProtected('main', ['main', 'develop'])
      expect(result).toBe(true)
    })

    it('should return true for wildcard match', () => {
      const result = isBranchProtected('feature/123', ['feature/*'])
      expect(result).toBe(true)
    })

    it('should return false for non-matching branch', () => {
      const result = isBranchProtected('test', ['main', 'develop'])
      expect(result).toBe(false)
    })
  })
})
