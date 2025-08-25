import { Screen } from './core/screen'
import { Keyboard } from './core/keyboard'
import { RenderMode } from './core/RenderMode'
import { bold, dim } from './utils/styles'
import { reset } from './utils/colors'
import * as readline from 'readline'

// Import stream components
import {
    StreamInput,
    StreamSelect,
    StreamCheckbox,
    StreamRadio,
    StreamProgressBar,
    StreamSpinner
} from './component/Stream'

export interface TUIOptions {
    title?: string
    screen?: Screen
    keyboard?: Keyboard
    renderMode?: RenderMode
}

export class TUI {
    private title: string
    private screen: Screen
    private keyboard: Keyboard
    private renderMode: RenderMode
    
    constructor(options: TUIOptions = {}) {
        this.title = options.title || ''
        this.screen = options.screen || new Screen()
        this.keyboard = options.keyboard || new Keyboard()
        this.renderMode = options.renderMode || RenderMode.STREAM
    }
    
    /**
     * Set render mode
     */
    setRenderMode(mode: RenderMode): void {
        this.renderMode = mode
    }
    
    /**
     * Get current render mode
     */
    getRenderMode(): RenderMode {
        return this.renderMode
    }
    
    /**
     * Check if in stream mode
     */
    isStreamMode(): boolean {
        return this.renderMode === RenderMode.STREAM || this.renderMode === RenderMode.AUTO
    }
    
    /**
     * Check if in absolute mode
     */
    isAbsoluteMode(): boolean {
        return this.renderMode === RenderMode.ABSOLUTE
    }
    
    /**
     * Clear the entire screen
     */
    clear(): void {
        if (this.isStreamMode()) {
            // In stream mode, just add some newlines for clarity
            console.log('\n'.repeat(3))
        } else {
            // In absolute mode, clear the screen
            this.screen.clear()
        }
    }
    
    /**
     * Create a header with title
     */
    createHeader(): string {
        const width = 62
        const titleWidth = this.title.length
        const padding = Math.floor((width - titleWidth - 2) / 2)
        const paddedTitle = ' '.repeat(padding) + this.title + ' '.repeat(width - padding - titleWidth - 2)
        
        const top = '\x1b[36m\x1b[1m╔' + '═'.repeat(width - 2) + '╗\x1b[22m\x1b[0m'
        const middle = '\x1b[36m\x1b[1m║' + paddedTitle + '║\x1b[22m\x1b[0m'
        const bottom = '\x1b[36m\x1b[1m╚' + '═'.repeat(width - 2) + '╝\x1b[22m\x1b[0m'
        
        return [top, middle, bottom].join('\n')
    }
    
    /**
     * Create a status section
     */
    createStatusSection(title: string, items: Array<{
        label: string
        value: string
        status?: 'info' | 'success' | 'warning' | 'error'
    }>, isCompact = false): string {
        const lines: string[] = []
        
        // Title
        lines.push('')
        lines.push(`\x1b[35m${bold('> ' + title)}\x1b[0m`)
        lines.push(`\x1b[35m  ${'─'.repeat(title.length + 2)}\x1b[0m`)
        lines.push('')
        
        // Items
        items.forEach((item: any) => {
            let iconStr = ''
            let statusColor = ''
            
            switch (item.status) {
                case 'info':
                    iconStr = '\x1b[36m\x1b[1m[i]\x1b[22m \x1b[0m'
                    statusColor = '\x1b[36m'
                    break
                case 'success':
                    iconStr = '\x1b[32m\x1b[1m[OK]\x1b[22m \x1b[0m'
                    statusColor = '\x1b[32m'
                    break
                case 'warning':
                    iconStr = '\x1b[33m\x1b[1m[!]\x1b[22m \x1b[0m'
                    statusColor = '\x1b[33m'
                    break
                case 'error':
                    iconStr = '\x1b[31m\x1b[1m[X]\x1b[22m \x1b[0m'
                    statusColor = '\x1b[31m'
                    break
                default:
                    iconStr = '  '
                    statusColor = ''
            }
            
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
        if (this.isStreamMode()) {
            const input = new StreamInput()
            const prompt = password ? `${label} (hidden): ` : `${label}: `
            return await input.render(prompt, defaultValue)
        } else {
            // Use absolute mode Input component
            // This would use the new Input.new component
            throw new Error('Absolute mode prompt not yet implemented')
        }
    }
    
    /**
     * Select from options
     */
    async select(label: string, options: string[], defaultIndex = 0): Promise<string> {
        if (this.isStreamMode()) {
            const select = new StreamSelect(options)
            return await select.render(label)
        } else {
            // Use absolute mode Select component
            throw new Error('Absolute mode select not yet implemented')
        }
    }
    
    /**
     * Confirm with yes/no - already fixed to use readline
     */
    async confirm(label: string, defaultValue = false): Promise<boolean> {
        if (this.isStreamMode()) {
            const checkbox = new StreamCheckbox()
            return await checkbox.render(label, defaultValue)
        } else {
            // For absolute mode, could use a different approach
            const checkbox = new StreamCheckbox()
            return await checkbox.render(label, defaultValue)
        }
    }
    
    /**
     * Radio button selection
     */
    async radio(label: string, options: string[], defaultIndex = 0): Promise<string> {
        if (this.isStreamMode()) {
            const radio = new StreamRadio(options, defaultIndex)
            return await radio.render(label)
        } else {
            throw new Error('Absolute mode radio not yet implemented')
        }
    }
    
    /**
     * Show error message
     */
    showError(message: string, details?: string): void {
        console.log(`\n\x1b[31m${bold('[X] Error:')}${reset()} ${message}`)
        if (details) {
            console.log(`  ${dim(details)}`)
        }
    }
    
    /**
     * Show success message
     */
    showSuccess(message: string): void {
        console.log(`\n\x1b[32m${bold('[OK] Success:')}${reset()} ${message}`)
    }
    
    /**
     * Show warning message
     */
    showWarning(message: string): void {
        console.log(`\n\x1b[33m${bold('[!] Warning:')}${reset()} ${message}`)
    }
    
    /**
     * Show info message
     */
    showInfo(message: string): void {
        console.log(`\n\x1b[36m[i] Info:${reset()} ${message}`)
    }
    
    /**
     * Show progress bar
     */
    showProgress(label: string, current: number, total: number): StreamProgressBar {
        const progress = new StreamProgressBar(label, total)
        progress.update(current)
        return progress
    }
    
    /**
     * Create a spinner for loading operations
     */
    createSpinner(text: string): StreamSpinner {
        return new StreamSpinner(text)
    }
    
    /**
     * Clean up resources
     */
    close(): void {
        this.keyboard.stop()
    }
}