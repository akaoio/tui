import { Screen } from './core/screen'
import { Keyboard } from './core/keyboard'
import { Input } from './components/Input'
import { Select } from './components/Select'
import { Checkbox } from './components/Checkbox'
import { ProgressBar } from './components/ProgressBar'
import { Spinner } from './components/Spinner'
import { bold, dim } from './utils/styles'
import { drawBox, BoxStyles } from './utils/styles'
import { reset } from './utils/colors'

export interface TUIOptions {
    title?: string
    screen?: Screen
    keyboard?: Keyboard
}

export interface StatusItem {
    label: string
    value: string
    status?: 'success' | 'warning' | 'error' | 'info'
}

/**
 * High-level Terminal UI helper for building CLI applications
 * Provides convenient methods for common terminal UI patterns
 */
export class TUI {
    private screen: Screen
    private keyboard: Keyboard
    private title: string
    
    constructor(options: TUIOptions = {}) {
        this.title = options.title || ''
        this.screen = options.screen || new Screen()
        this.keyboard = options.keyboard || new Keyboard()
    }
    
    /**
     * Clear the entire screen
     */
    clear(): void {
        this.screen.clear()
    }
    
    /**
     * Create a styled header with title
     */
    createHeader(): string {
        const width = Math.min(this.screen.getWidth() - 2, 60)
        const isCompact = this.screen.getWidth() < 80
        
        if (isCompact) {
            const line = '═'.repeat(width)
            return `\x1b[36m${bold(line)}${reset()}\n` +
                   `\x1b[36m${bold(`  ${this.title}`)}${reset()}\n` +
                   `\x1b[36m${bold(line)}${reset()}`
        } else {
            const lines = drawBox(width, 3, BoxStyles.Double)
            const padding = Math.floor((width - this.title.length - 2) / 2)
            const titleLine = '║' + ' '.repeat(padding) + this.title + ' '.repeat(width - padding - this.title.length - 2) + '║'
            
            return `\x1b[36m${bold(lines[0])}${reset()}\n` +
                   `\x1b[36m${bold(titleLine)}${reset()}\n` +
                   `\x1b[36m${bold(lines[2])}${reset()}`
        }
    }
    
    /**
     * Create a status section with items
     */
    createStatusSection(title: string, items: StatusItem[]): string {
        const lines: string[] = []
        
        lines.push(`\n\x1b[35m${bold(`▶ ${title}`)}${reset()}`)
        lines.push(`\x1b[35m  ${'─'.repeat(title.length)}${reset()}\n`)
        
        items.forEach(item => {
            const statusColor = item.status ? {
                success: '\x1b[32m',
                warning: '\x1b[33m',
                error: '\x1b[31m',
                info: '\x1b[36m'
            }[item.status] : ''
            
            const icon = item.status ? {
                success: '✓',
                warning: '⚠',
                error: '✗',
                info: 'ℹ'
            }[item.status] : ''
            
            const iconStr = icon ? `${statusColor}${bold(icon)} ${reset()}` : ''
            const isCompact = this.screen.getWidth() < 80 || item.label.length + item.value.length > 50
            
            if (isCompact) {
                lines.push(`${iconStr}${statusColor}${item.label}: ${item.value}${reset()}`)
            } else {
                const spacing = ' '.repeat(Math.max(1, 20 - item.label.length))
                lines.push(`${iconStr}${statusColor}${item.label}:${spacing}${item.value}${reset()}`)
            }
        })
        
        return lines.join('\n')
    }
    
    /**
     * Prompt for text input
     */
    async prompt(label: string, defaultValue = '', password = false): Promise<string> {
        const input = new Input(this.screen, this.keyboard, {
            placeholder: label,
            value: defaultValue,
            password
        })
        
        return new Promise((resolve) => {
            input.on('submit', (value) => {
                input.clear()
                this.keyboard.stop()
                resolve(value as string)
            })
            
            this.keyboard.start()
            input.focus()
            input.render()
        })
    }
    
    /**
     * Select from a list of options
     */
    async select(label: string, options: string[], defaultIndex = 0): Promise<string> {
        const select = new Select(this.screen, this.keyboard, {
            options: options.map(opt => ({ label: opt, value: opt })),
            selected: defaultIndex
        })
        
        return new Promise((resolve) => {
            select.on('submit', (value) => {
                select.clear()
                this.keyboard.stop()
                resolve(value as string)
            })
            
            this.keyboard.start()
            select.focus()
            select.render()
        })
    }
    
    /**
     * Confirm with yes/no
     */
    async confirm(label: string, defaultValue = false): Promise<boolean> {
        const defaultStr = defaultValue ? 'Y/n' : 'y/N'
        const input = new Input(this.screen, this.keyboard, {
            placeholder: `${label} [${defaultStr}]`,
            value: ''
        })
        
        return new Promise((resolve) => {
            input.on('submit', (value) => {
                input.clear()
                this.keyboard.stop()
                
                const answer = (value as string).toLowerCase().trim()
                if (answer === '') {
                    resolve(defaultValue)
                } else if (answer === 'y' || answer === 'yes') {
                    resolve(true)
                } else if (answer === 'n' || answer === 'no') {
                    resolve(false)
                } else {
                    // Invalid input, use default
                    resolve(defaultValue)
                }
            })
            
            this.keyboard.start()
            input.focus()
            input.render()
        })
    }
    
    /**
     * Show error message
     */
    showError(message: string, details?: string): void {
        console.log(`\n\x1b[31m${bold('✗ Error:')}${reset()} ${message}`)
        if (details) {
            console.log(`  ${dim(details)}`)
        }
    }
    
    /**
     * Show success message
     */
    showSuccess(message: string): void {
        console.log(`\n\x1b[32m${bold('✓ Success:')}${reset()} ${message}`)
    }
    
    /**
     * Show warning message
     */
    showWarning(message: string): void {
        console.log(`\n\x1b[33m${bold('⚠ Warning:')}${reset()} ${message}`)
    }
    
    /**
     * Show info message
     */
    showInfo(message: string): void {
        console.log(`\n\x1b[36mℹ Info:${reset()} ${message}`)
    }
    
    /**
     * Show progress bar
     */
    showProgress(label: string, current: number, total: number): void {
        const progress = new ProgressBar(this.screen, this.keyboard, {
            total,
            width: Math.min(40, this.screen.getWidth() - 20)
        })
        progress.setValue(current)
        progress.render()
        
        if (current >= total) {
            process.stdout.write('\n')
        }
    }
    
    /**
     * Create a spinner for loading operations
     */
    createSpinner(text: string): Spinner {
        return new Spinner(this.screen, this.keyboard, { text })
    }
    
    /**
     * Clean up resources
     */
    close(): void {
        this.keyboard.stop()
    }
}