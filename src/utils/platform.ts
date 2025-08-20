import os from 'os'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

/**
 * Platform detection utilities
 */

export const isTermux = (): boolean => {
    return process.env.TERMUX_VERSION !== undefined || 
           process.env.PREFIX?.includes('com.termux') || false
}

export const isMobile = (): boolean => {
    return isTermux() || (process.stdout.columns && process.stdout.columns < 80) || false
}

export const isWindows = (): boolean => os.platform() === 'win32'
export const isMac = (): boolean => os.platform() === 'darwin'
export const isLinux = (): boolean => os.platform() === 'linux'

export const hasSudo = (): boolean => {
    if (isWindows()) return false
    if (isTermux()) return false
    try {
        execSync('which sudo', { stdio: 'ignore' })
        return true
    } catch {
        return false
    }
}

export const hasSystemd = (): boolean => {
    if (!isLinux()) return false
    if (isTermux()) return false
    try {
        execSync('systemctl --version', { stdio: 'ignore' })
        return true
    } catch {
        return false
    }
}

/**
 * Get responsive layout based on terminal size
 */
export const getLayout = () => {
    const width = process.stdout.columns || 80
    const height = process.stdout.rows || 24
    const compact = isMobile() || width < 80
    
    return {
        width,
        height,
        compact,
        padding: compact ? 1 : 2,
        margin: compact ? 0 : 1
    }
}

/**
 * Platform-specific paths for applications
 */
export interface PlatformPaths {
    config: string
    data: string
    log: string
    ssl: string
    service: string | null
}

export const getPlatformPaths = (appName = 'app'): PlatformPaths => {
    const home = os.homedir()
    
    if (isWindows()) {
        return {
            config: process.env.APPDATA || path.join(home, 'AppData', 'Roaming', appName),
            data: process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local', appName),
            log: path.join(home, 'AppData', 'Local', appName, 'logs'),
            ssl: path.join(home, 'AppData', 'Local', appName, 'ssl'),
            service: null
        }
    } else if (isMac()) {
        return {
            config: path.join(home, 'Library', 'Application Support', appName),
            data: path.join(home, 'Library', 'Application Support', appName, 'data'),
            log: path.join(home, 'Library', 'Logs', appName),
            ssl: path.join(home, 'Library', 'Application Support', appName, 'ssl'),
            service: path.join(home, 'Library', 'LaunchAgents')
        }
    } else if (isTermux()) {
        const prefix = process.env.PREFIX || '/data/data/com.termux/files/usr'
        return {
            config: path.join(prefix, 'etc', appName),
            data: path.join(prefix, 'var', 'lib', appName),
            log: path.join(prefix, 'var', 'log', appName),
            ssl: path.join(prefix, 'etc', appName, 'ssl'),
            service: null
        }
    } else {
        // Linux/Unix
        return {
            config: process.env.XDG_CONFIG_HOME || path.join(home, '.config', appName),
            data: process.env.XDG_DATA_HOME || path.join(home, '.local', 'share', appName),
            log: process.env.XDG_STATE_HOME || path.join(home, '.local', 'state', appName),
            ssl: path.join(home, '.local', 'share', appName, 'ssl'),
            service: hasSystemd() ? '/etc/systemd/system' : path.join(home, '.config', 'systemd', 'user')
        }
    }
}