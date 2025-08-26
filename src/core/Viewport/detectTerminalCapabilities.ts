/**
 * Detect terminal capabilities and features
 */

export interface TerminalCapabilities {
  supportsColor: boolean
  colorDepth: number
  supportsUnicode: boolean
  supportsMouse: boolean
  supportsResize: boolean
  terminalProgram: string | null
  terminalType: string | null
  isSSH: boolean
  isTmux: boolean
  isScreen: boolean
}

export function detectTerminalCapabilities(): TerminalCapabilities {
  const env = process.env
  
  // Detect terminal program
  const terminalProgram = env.TERM_PROGRAM || env.WT_SESSION || null
  const terminalType = env.TERM || null
  
  // Detect color support
  const supportsColor = !!(
    process.stdout.isTTY &&
    (env.COLORTERM ||
     env.TERM?.includes('color') ||
     env.TERM_PROGRAM === 'iTerm.app' ||
     env.TERM_PROGRAM === 'vscode' ||
     process.platform === 'win32')
  )
  
  // Detect color depth
  let colorDepth = 1 // monochrome
  if (env.COLORTERM === 'truecolor' || env.TERM?.includes('24bit')) {
    colorDepth = 24
  } else if (env.TERM?.includes('256color')) {
    colorDepth = 8
  } else if (supportsColor) {
    colorDepth = 4
  }
  
  // Detect Unicode support
  const supportsUnicode = !!(
    env.LC_ALL?.includes('UTF-8') ||
    env.LC_CTYPE?.includes('UTF-8') ||
    env.LANG?.includes('UTF-8') ||
    env.TERM_PROGRAM === 'vscode' ||
    env.TERM_PROGRAM === 'iTerm.app' ||
    env.WT_SESSION // Windows Terminal
  )
  
  // Detect mouse support
  const supportsMouse = !!(
    process.stdout.isTTY &&
    (env.TERM?.includes('xterm') ||
     env.TERM_PROGRAM === 'iTerm.app' ||
     env.TERM_PROGRAM === 'vscode' ||
     env.WT_SESSION)
  )
  
  // Detect resize support
  const supportsResize = !!(
    process.stdout.isTTY &&
    process.platform !== 'win32' // Unix systems support SIGWINCH
  )
  
  // Detect SSH session
  const isSSH = !!(env.SSH_CLIENT || env.SSH_TTY || env.SSH_CONNECTION)
  
  // Detect terminal multiplexers
  const isTmux = !!env.TMUX
  const isScreen = env.TERM?.startsWith('screen') || false
  
  return {
    supportsColor,
    colorDepth,
    supportsUnicode,
    supportsMouse,
    supportsResize,
    terminalProgram,
    terminalType,
    isSSH,
    isTmux,
    isScreen
  }
}

/**
 * Get adaptive terminal dimensions based on capabilities
 */
export function getAdaptiveDimensions(): { width: number; height: number } {
  const caps = detectTerminalCapabilities()
  
  // If we're in a terminal multiplexer, be conservative
  if (caps.isTmux || caps.isScreen) {
    return { width: 80, height: 24 }
  }
  
  // SSH sessions might have limited bandwidth, use moderate sizes
  if (caps.isSSH) {
    return { width: 100, height: 30 }
  }
  
  // Modern terminal programs can handle larger sizes
  if (caps.terminalProgram === 'vscode') {
    return { width: 120, height: 40 }
  }
  
  if (caps.terminalProgram === 'iTerm.app' || caps.terminalProgram?.includes('iTerm')) {
    return { width: 120, height: 50 }
  }
  
  if (caps.terminalProgram?.includes('Terminal.app')) {
    return { width: 100, height: 40 }
  }
  
  // Windows Terminal
  if (process.env.WT_SESSION) {
    return { width: 120, height: 40 }
  }
  
  // Check for high-resolution terminal types
  if (caps.terminalType?.includes('256color') || caps.colorDepth >= 8) {
    return { width: 100, height: 35 }
  }
  
  // Default fallback for unknown terminals
  return { width: 80, height: 24 }
}