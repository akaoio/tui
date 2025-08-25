/**
 * Responsive command bar component that auto-collapses based on available width
 */

import { Component, ComponentProps, RenderContext } from '../core/Component'
import { ScreenManager, Region } from '../core/ScreenManager/index'
import { Color, BgColor, color } from '../utils/colors'
import { bold } from '../utils/styles'

export interface Command {
    key: string
    label: string
    color: Color
    action?: () => void
    minWidth?: number  // Minimum width needed to show this command
}

export class ResponsiveCommands extends Component {
    private commands: Command[] = []
    private separator = ' '
    private showBrackets = true
    
    constructor(commands: Command[] = [], props?: ComponentProps) {
        super({ ...props })
        this.commands = commands
        this.focusable = false
    }
    
    setCommands(commands: Command[]): void {
        this.commands = commands
    }
    
    private calculateCommandWidth(cmd: Command): number {
        // [Key]Label format
        if (this.showBrackets) {
            return cmd.key.length + cmd.label.length + 3 // brackets + label
        }
        return cmd.key.length + cmd.label.length + 1 // key + space + label
    }
    
    private getResponsiveCommands(availableWidth: number): { visible: Command[], collapsed: number } {
        const visible: Command[] = []
        let currentWidth = 0
        let collapsed = 0
        
        // Always try to show at least the quit command
        const quitCmd = this.commands.find((c: any) => c.key.toLowerCase().includes('q') || c.key.toLowerCase().includes('esc'))
        
        for (const cmd of this.commands) {
            const cmdWidth = this.calculateCommandWidth(cmd) + this.separator.length
            const minWidth = cmd.minWidth || cmdWidth
            
            if (currentWidth + minWidth <= availableWidth) {
                visible.push(cmd)
                currentWidth += cmdWidth
            } else if (cmd === quitCmd && visible.length > 0) {
                // Replace last command with quit if we must show it
                visible[visible.length - 1] = cmd
                collapsed++
            } else {
                collapsed++
            }
        }
        
        return { visible, collapsed }
    }
    
    private renderCommand(screen: ScreenManager, cmd: Command, x: number, y: number): number {
        if (this.showBrackets) {
            screen.write('[', x, y, color(Color.BrightBlack))
            screen.write(cmd.key, x + 1, y, color(cmd.color) + bold(''))
            screen.write(']', x + cmd.key.length + 1, y, color(Color.BrightBlack))
            screen.write(cmd.label, x + cmd.key.length + 2, y, color(Color.White))
            return this.calculateCommandWidth(cmd)
        } else {
            screen.write(cmd.key, x, y, color(cmd.color) + bold(''))
            screen.write(' ' + cmd.label, x + cmd.key.length, y, color(Color.White))
            return this.calculateCommandWidth(cmd)
        }
    }
    
    render(context: RenderContext): void {
        const { screen, region } = context
        if (!this.props.visible) return
        
        const { visible, collapsed } = this.getResponsiveCommands(region.width - 4)
        
        // Clear the region
        screen.fillRegion(region, ' ')
        
        let x = region.x + 2
        const y = region.y
        
        // Render visible commands
        for (const cmd of visible) {
            const width = this.renderCommand(screen, cmd, x, y)
            x += width + this.separator.length
        }
        
        // Show ellipsis if commands are collapsed
        if (collapsed > 0) {
            const ellipsis = `... (+${collapsed})`
            screen.write(ellipsis, region.x + region.width - ellipsis.length - 2, y, color(Color.BrightBlack))
        }
    }
    
    // Remove deprecated onInput method
}

/**
 * Responsive tabs component
 */
export class ResponsiveTabs extends Component {
    private tabs: string[] = []
    private activeTab = 0
    private onChange?: (tab: string, index: number) => void
    
    constructor(tabs: string[] = [], props?: ComponentProps) {
        super({ ...props })
        this.tabs = tabs
        this.focusable = true
    }
    
    setTabs(tabs: string[]): void {
        this.tabs = tabs
        this.activeTab = Math.min(this.activeTab, tabs.length - 1)
    }
    
    setActiveTab(index: number): void {
        if (index >= 0 && index < this.tabs.length) {
            this.activeTab = index
            this.onChange?.(this.tabs[index], index)
        }
    }
    
    onTabChange(callback: (tab: string, index: number) => void): void {
        this.onChange = callback
    }
    
    private getVisibleTabs(availableWidth: number): { visible: string[], startIdx: number } {
        const tabWidths = this.tabs.map((t: any) => t.length + 4) // padding + spacing
        const totalWidth = tabWidths.reduce((sum, w) => sum + w, 0)
        
        if (totalWidth <= availableWidth) {
            return { visible: this.tabs, startIdx: 0 }
        }
        
        // Ensure active tab is visible
        let startIdx = 0
        let endIdx = this.tabs.length
        let currentWidth = totalWidth
        
        // Try to center active tab
        if (this.activeTab > 0) {
            startIdx = Math.max(0, this.activeTab - 1)
        }
        
        // Calculate visible tabs from start
        currentWidth = 0
        const visible: string[] = []
        for (let i = startIdx; i < this.tabs.length && currentWidth < availableWidth; i++) {
            if (currentWidth + tabWidths[i] <= availableWidth) {
                visible.push(this.tabs[i])
                currentWidth += tabWidths[i]
            } else {
                break
            }
        }
        
        return { visible, startIdx }
    }
    
    render(context: RenderContext): void {
        const { screen, region } = context
        if (!this.props.visible) return
        
        const { visible, startIdx } = this.getVisibleTabs(region.width)
        
        let x = region.x
        const y = region.y
        
        // Show left indicator if tabs are hidden
        if (startIdx > 0) {
            screen.write('< ', x, y, color(Color.Cyan))
            x += 2
        }
        
        // Render visible tabs
        visible.forEach((tab, idx) => {
            const actualIdx = startIdx + idx
            const isActive = actualIdx === this.activeTab
            const style = isActive 
                ? color(Color.Black, BgColor.Cyan) + bold('')
                : color(Color.BrightBlack)
            
            const text = ` ${tab.toUpperCase()} `
            screen.write(text, x, y, style)
            x += text.length + 1
        })
        
        // Show right indicator if tabs are hidden
        if (startIdx + visible.length < this.tabs.length) {
            screen.write(' >', region.x + region.width - 2, y, color(Color.Cyan))
        }
    }
    
    override handleKeypress(key: string, keyInfo: any): boolean {
        if (keyInfo?.name === 'left') {
            if (this.activeTab > 0) {
                this.setActiveTab(this.activeTab - 1)
                return true
            }
        }
        
        if (keyInfo?.name === 'right') {
            if (this.activeTab < this.tabs.length - 1) {
                this.setActiveTab(this.activeTab + 1)
                return true
            }
        }
        
        // Number keys to jump to tab
        const num = parseInt(key)
        if (!isNaN(num) && num > 0 && num <= this.tabs.length) {
            this.setActiveTab(num - 1)
            return true
        }
        
        return false
    }
}