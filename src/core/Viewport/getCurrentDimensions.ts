/**
 * Get current terminal dimensions method with robust detection
 */

import { Dimensions } from './types'
import { execSync } from 'child_process'

export function getCurrentDimensions(this: any): Dimensions {
  // Try multiple methods to get accurate terminal dimensions
  
  // Method 1: Direct TTY dimensions (most reliable when available)
  if (process.stdout.isTTY && process.stdout.columns && process.stdout.rows) {
    return {
      width: process.stdout.columns,
      height: process.stdout.rows
    }
  }
  
  // Method 2: Try tput command (works in most Unix terminals)
  try {
    const cols = parseInt(execSync('tput cols', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim())
    const lines = parseInt(execSync('tput lines', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim())
    
    if (!isNaN(cols) && !isNaN(lines) && cols > 0 && lines > 0) {
      return { width: cols, height: lines }
    }
  } catch (e) {
    // tput not available, continue to next method
  }
  
  // Method 3: Try stty command (alternative Unix method)
  try {
    const size = execSync('stty size < /dev/tty', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim()
    const [lines, cols] = size.split(' ').map(Number)
    
    if (!isNaN(cols) && !isNaN(lines) && cols > 0 && lines > 0) {
      return { width: cols, height: lines }
    }
  } catch (e) {
    // stty not available, continue to next method
  }
  
  // Method 4: Environment variables (some terminals set these)
  const envCols = parseInt(process.env.COLUMNS || '')
  const envLines = parseInt(process.env.LINES || '')
  
  if (!isNaN(envCols) && !isNaN(envLines) && envCols > 0 && envLines > 0) {
    return { width: envCols, height: envLines }
  }
  
  // Method 5: Windows-specific PowerShell method
  if (process.platform === 'win32') {
    try {
      const result = execSync(
        'powershell -command "$host.UI.RawUI.WindowSize.Width; $host.UI.RawUI.WindowSize.Height"',
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
      ).trim()
      const [width, height] = result.split('\n').map(Number)
      
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        return { width, height }
      }
    } catch (e) {
      // PowerShell not available
    }
  }
  
  // Method 6: Get from escape sequence query (ANSI terminals)
  // This would require async operation, so we skip for now
  
  // Fallback: Use reasonable defaults based on terminal type
  const termProgram = process.env.TERM_PROGRAM?.toLowerCase()
  const term = process.env.TERM?.toLowerCase()
  
  // Modern terminal defaults
  if (termProgram?.includes('vscode')) {
    return { width: 120, height: 30 }
  }
  if (termProgram?.includes('iterm') || termProgram?.includes('hyper')) {
    return { width: 100, height: 40 }
  }
  if (term?.includes('xterm') || term?.includes('256color')) {
    return { width: 100, height: 30 }
  }
  
  // Conservative fallback for truly unknown environments
  // Using VT100 standard terminal size
  return { width: 80, height: 24 }
}