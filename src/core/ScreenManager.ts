/**
 * Screen Manager - Full terminal control with mouse support
 * Manages screen buffer, cursor, mouse events, and rendering
 */

import * as readline from 'readline'
import { EventEmitter } from 'events'
import { OutputFilter } from './OutputFilter'

/**
 * ANSI escape codes for terminal control
 */
export const ANSI = {
    // Cursor movement
    cursorUp: (n = 1) => `\x1b[${n}A`,
    cursorDown: (n = 1) => `\x1b[${n}B`,
    cursorForward: (n = 1) => `\x1b[${n}C`,
    cursorBack: (n = 1) => `\x1b[${n}D`,
    cursorNextLine: (n = 1) => `\x1b[${n}E`,
    cursorPrevLine: (n = 1) => `\x1b[${n}F`,
    cursorPosition: (row: number, col: number) => `\x1b[${row};${col}H`,
    cursorColumn: (col: number) => `\x1b[${col}G`,
    
    // Screen control
    clearScreen: '\x1b[2J',
    clearLine: '\x1b[2K',
    clearToEndOfLine: '\x1b[0K',
    clearToBeginOfLine: '\x1b[1K',
    
    // Alternative screen buffer (for full-screen apps)
    alternateScreenEnter: '\x1b[?1049h',
    alternateScreenExit: '\x1b[?1049l',
    
    // Cursor visibility
    hideCursor: '\x1b[?25l',
    showCursor: '\x1b[?25h',
    
    // Save/restore cursor
    saveCursor: '\x1b7',
    restoreCursor: '\x1b8',
    
    // Scrolling
    scrollUp: '\x1b[S',
    scrollDown: '\x1b[T',
    
    // Mouse support
    // Only use SGR mouse protocol (1006) with click tracking (1000)
    // Don't use 1002 (motion) as it generates too many events
    mouseTrackingOn: '\x1b[?1000h\x1b[?1006h',
    mouseTrackingOff: '\x1b[?1000l\x1b[?1006l',
    
    // Colors and styles
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    italic: '\x1b[3m',
    underline: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',
    strikethrough: '\x1b[9m',
}

/**
 * Mouse event types
 */
export enum MouseEventType {
    PRESS = 'press',
    RELEASE = 'release',
    MOVE = 'move',
    SCROLL_UP = 'scrollUp',
    SCROLL_DOWN = 'scrollDown',
}

/**
 * Mouse button types
 */
export enum MouseButton {
    LEFT = 0,
    MIDDLE = 1,
    RIGHT = 2,
    NONE = 3,
}

/**
 * Mouse event data
 */
export interface MouseEvent {
    type: MouseEventType
    button: MouseButton
    x: number
    y: number
    ctrl: boolean
    shift: boolean
    meta: boolean
}

/**
 * Screen buffer cell
 */
interface Cell {
    char: string
    fg?: string  // Foreground color
    bg?: string  // Background color
    style?: string  // Style attributes
}

/**
 * Screen region for component rendering
 */
export interface Region {
    x: number
    y: number
    width: number
    height: number
}

/**
 * Renderable component interface
 */
export interface Renderable {
    render(screen: ScreenManager, region: Region): void
    handleInput?(key: string, keyInfo: readline.Key): boolean
    handleMouse?(event: MouseEvent): boolean
    onFocus?(): void
    onBlur?(): void
    isFocusable?: boolean
    getCursorPosition?(): { x: number; y: number } | null
}

/**
 * Screen Manager handles terminal screen control
 */
export class ScreenManager extends EventEmitter {
    private static instance: ScreenManager
    
    private buffer: Cell[][]
    private width: number
    private height: number
    private cursorX = 0
    private cursorY = 0
    private cursorVisible = true
    private isAlternateScreen = false
    private isMouseEnabled = false
    private inputHandler?: readline.Interface
    private renderQueue: Array<() => void> = []
    private isRendering = false
    private components: Map<string, { component: Renderable, region: Region }> = new Map()
    private focusedComponent?: string
    private focusOrder: string[] = []
    private mouseBuffer = ''
    private lastMouseX = 0
    private lastMouseY = 0
    private cursorMode = false // Ctrl+K cursor navigation mode
    private debugMode = false
    private debugFile?: import('fs').WriteStream
    private outputFilter: OutputFilter
    
    private constructor() {
        super()
        this.width = process.stdout.columns || 80
        this.height = process.stdout.rows || 24
        this.buffer = this.createBuffer()
        this.outputFilter = OutputFilter.getInstance()
        this.setupResizeHandler()
        this.setupInputHandler()
    }
    
    /**
     * Get singleton instance
     */
    static getInstance(): ScreenManager {
        if (!ScreenManager.instance) {
            ScreenManager.instance = new ScreenManager()
        }
        return ScreenManager.instance
    }
    
    /**
     * Create empty buffer
     */
    private createBuffer(): Cell[][] {
        const buffer: Cell[][] = []
        for (let y = 0; y < this.height; y++) {
            buffer[y] = []
            for (let x = 0; x < this.width; x++) {
                buffer[y][x] = { char: ' ' }
            }
        }
        return buffer
    }
    
    /**
     * Setup terminal resize handler
     */
    private setupResizeHandler(): void {
        if (process.stdout.isTTY) {
            process.stdout.on('resize', () => {
                this.width = process.stdout.columns || 80
                this.height = process.stdout.rows || 24
                this.buffer = this.createBuffer()
                
                // Re-render immediately after resize
                setImmediate(() => {
                    this.emit('resize', this.width, this.height)
                    this.clear()
                    this.render()
                })
            })
        }
    }
    
    /**
     * Parse SGR mouse events
     */
    private parseMouseEvent(data: string): MouseEvent | null {
        // SGR format: \x1b[<button>;x;yM (press) or m (release)
        const match = data.match(/\x1b\[<(\d+);(\d+);(\d+)([Mm])/)
        if (!match) return null
        
        const [, buttonStr, xStr, yStr, type] = match
        const buttonCode = parseInt(buttonStr)
        const x = parseInt(xStr) - 1  // Convert to 0-based
        const y = parseInt(yStr) - 1
        
        // Parse button and modifiers
        const button = buttonCode & 3
        const shift = !!(buttonCode & 4)
        const meta = !!(buttonCode & 8)
        const ctrl = !!(buttonCode & 16)
        const move = !!(buttonCode & 32)
        const scroll = buttonCode & 64
        
        let eventType: MouseEventType
        let mouseButton: MouseButton
        
        if (scroll) {
            eventType = button === 0 ? MouseEventType.SCROLL_UP : MouseEventType.SCROLL_DOWN
            mouseButton = MouseButton.NONE
        } else if (move) {
            eventType = MouseEventType.MOVE
            mouseButton = button as MouseButton
        } else {
            eventType = type === 'M' ? MouseEventType.PRESS : MouseEventType.RELEASE
            mouseButton = button as MouseButton
        }
        
        return {
            type: eventType,
            button: mouseButton,
            x,
            y,
            ctrl,
            shift,
            meta
        }
    }
    
    /**
     * Setup input handler
     */
    private setupInputHandler(): void {
        // CRITICAL: Check if we're in a proper TTY environment
        // Without TTY, we cannot enable raw mode and terminal will echo mouse sequences
        if (!process.stdin.isTTY) {
            // Minimal setup for non-TTY environments
            // Skip mouse handling entirely to prevent coordinate spillage
            this.inputHandler = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            })
            
            // Basic keyboard support only
            process.stdin.on('keypress', (char: string, key: readline.Key) => {
                this.emit('keypress', char, key)
                if (key?.ctrl && key.name === 'c') {
                    this.cleanup()
                    process.exit(0)
                }
            })
            return // Skip all mouse setup
        }
        
        this.inputHandler = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        
        // CRITICAL: Handle raw data FIRST before readline processes it
        // This must come before readline.emitKeypressEvents!
        process.stdin.on('data', (chunk: Buffer) => {
            const data = chunk.toString()
            
            // COMPREHENSIVE mouse event filtering - block ALL mouse sequences
            let isMouseSequence = false
            
            // PRIORITY 1: Block raw fragmented mouse sequences (USER'S EXACT BUG!)
            // Pattern: "65;87;26M" or "0;69;23M" (missing \x1b[< prefix)
            if (data.match(/^[0-9]+;[0-9]+;[0-9]+[Mm]/)) {
                isMouseSequence = true
            }
            
            // PRIORITY 2: Block any sequence that starts with mouse button codes
            if (data.match(/^(0|1|2|64|65|32|33|34|35|36|37|38|39);/)) {  
                isMouseSequence = true
            }
            
            // PRIORITY 3: Block the exact patterns from user's bug report
            // "65;87;26M65;87;26M" or "0;69;23M0;145;28m"
            if (data.match(/[0-9]{1,3};[0-9]{1,3};[0-9]{1,3}[Mm]/)) {
                isMouseSequence = true
            }
            
            // PRIORITY 4: Block any data that contains multiple coordinate-like patterns
            if (data.match(/[0-9]+;[0-9]+;[0-9]+[Mm][0-9]/)) {  // Repeating patterns
                isMouseSequence = true
            }
            
            // Debug what we're receiving (only if debug mode is on)
            if (this.debugMode && (data.includes('\x1b[<') || isMouseSequence)) {
                this.writeDebugInfo('MOUSE_RAW', { 
                    raw: data.replace(/\x1b/g, '\\x1b'), 
                    bytes: Array.from(chunk).map(b => b.toString(16)).join(' ')
                })
            }
            
            // 1. SGR mouse format: \x1b[<button;x;yM or \x1b[<button;x;ym
            if (data.includes('\x1b[<')) {
                const mouseEvent = this.parseMouseEvent(data)
                if (mouseEvent) {
                    this.handleMouseEvent(mouseEvent)
                }
                isMouseSequence = true
            }
            
            // 2. Legacy VT200 mouse format: \x1b[Mbbb (3 bytes after M)
            if (data.includes('\x1b[M')) {
                isMouseSequence = true
            }
            
            // 3. Mouse wheel scroll events (various formats)
            if (data.match(/\x1b\[\d*[AB]/)) {  // \x1b[A, \x1b[B, \x1b[1A, etc.
                isMouseSequence = true
            }
            
            // 3a. Specific scroll wheel sequences that cause coordinate spillage
            if (data.match(/\x1b\[<(64|65);/)) {  // Scroll up (64) and scroll down (65)
                isMouseSequence = true
            }
            
            // 3b. All mouse button sequences (left=0, middle=1, right=2, etc.)
            if (data.match(/\x1b\[<[0-9]+;[0-9]+;[0-9]+[Mm]/)) {  // All button press/release
                isMouseSequence = true
            }
            
            // 4. Extended mouse sequences for drag, double-click, etc.
            if (data.match(/\x1b\[\d+;\d+;\d+[MTmt]/)) {
                isMouseSequence = true
            }
            
            // 5. X10 mouse format: \x1b[?\d+[hl]
            if (data.match(/\x1b\[\?\d+[hl]/)) {
                isMouseSequence = true
            }
            
            // 6. Comprehensive catch-all for ANY escape sequence with coordinates
            // This catches sequences like: \x1b[32;45H, \x1b[200;300M, etc.
            if (data.match(/\x1b\[[0-9;]*[HfMm<>ABCDhlpqrstuxyzXYZ]/)) {
                isMouseSequence = true
            }
            
            // 6a. Additional patterns for common spillage
            if (data.match(/^\d+[;,]\d+/)) {  // Numbers with semicolon or comma
                isMouseSequence = true
            }
            
            // 6b. Catch partial sequences that might split across buffers
            if (data.match(/^\d+$/)) {  // Just numbers that might be coordinates
                isMouseSequence = true
            }
            
            // 7. Block any raw coordinate data that might leak (numbers followed by semicolons)
            if (data.match(/^\d+;\d+/)) {
                isMouseSequence = true
            }
            
            // 8. CRITICAL: Block fragmented mouse sequences without escape prefix
            // This catches patterns like "65;80;33M" which are corrupted/fragmented mouse events
            if (data.match(/\d{1,3};\d{1,3};\d{1,3}[Mm]/)) {  // button;x;y[Mm]
                isMouseSequence = true
            }
            
            // 9. Block any sequence with mouse button codes (64, 65 = scroll wheel)
            if (data.match(/(64|65);\d+;\d+/)) {  // Scroll wheel coordinates
                isMouseSequence = true
            }
            
            // 10. Ultra-aggressive: Block ANY string that looks like coordinates
            if (data.match(/\d+;\d+[M;]/)) {  // Any coordinate-like pattern
                isMouseSequence = true
            }
            
            // 11. NUCLEAR OPTION: Block anything with multiple numbers and semicolons
            // This is the pattern from the user's bug report: "65;80;33M"
            if (data.match(/[0-9;]{5,}[Mm]?/)) {  // 5+ chars of numbers/semicolons
                isMouseSequence = true  
            }
            
            // 12. Block common mouse button sequences by number
            if (data.match(/^[0-9]+;[0-9]+;[0-9]+/)) {  // Starts with num;num;num
                isMouseSequence = true
            }
            
            // BLOCK only mouse sequences, let other escape sequences through
            if (isMouseSequence) {
                // Log blocked sequence for debugging
                if (this.debugMode) {
                    this.writeDebugInfo('MOUSE_BLOCKED', data.replace(/\x1b/g, '\\x1b'))
                }
                // Completely consume the data by not letting it propagate further
                chunk.fill(0) // Clear the buffer to prevent any leakage
                return // Block mouse sequences that cause spillage
            }
            
            // Don't process this data further - let keypress handler deal with it
            // This prevents double processing
        })
        
        // Enable keypress events AFTER mouse filtering is set up
        readline.emitKeypressEvents(process.stdin)
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true)
        }
        
        process.stdin.on('keypress', (char: string, key: readline.Key) => {
            // Debug key events
            this.writeDebugInfo('KEYPRESS', { char, key: key ? { name: key.name, ctrl: key.ctrl, shift: key.shift, meta: key.meta } : null })
            
            // Emit global key event FIRST so listeners get all keys
            this.emit('keypress', char, key)
            
            // Handle special keys
            if (key) {
                // Ctrl+C - quit
                if (key.ctrl && key.name === 'c') {
                    this.cleanup()
                    process.exit(0)
                }
                
                // Ctrl+K - toggle cursor mode (changed from Ctrl+M to avoid terminal conflicts)
                if (key.ctrl && key.name === 'k') {
                    this.cursorMode = !this.cursorMode
                    this.writeDebugInfo('CURSOR_MODE_TOGGLE', { enabled: this.cursorMode })
                    this.emit('cursor-mode-toggle', this.cursorMode)
                    
                    if (this.cursorMode) {
                        this.setCursorPosition(this.lastMouseX || Math.floor(this.width/2), this.lastMouseY || Math.floor(this.height/2))
                    }
                    
                    // Don't call this.render() here - let SchemaRenderer handle it
                    return
                }
                
                // Cursor mode navigation
                if (this.cursorMode) {
                    this.handleCursorModeInput(char, key)
                    return
                }
                
                // ESC key
                if (key.name === 'escape') {
                    // First send to focused component
                    if (this.focusedComponent) {
                        const comp = this.components.get(this.focusedComponent)
                        if (comp?.component.handleInput) {
                            const handled = comp.component.handleInput(char || '', key)
                            if (handled) {
                                this.render()
                                return
                            }
                        }
                    }
                    // Then emit global event
                    this.emit('escape')
                    return
                }
                
                // Tab navigation between components
                if (key.name === 'tab') {
                    // First try to let focused component handle it
                    if (this.focusedComponent) {
                        const comp = this.components.get(this.focusedComponent)
                        if (comp?.component.handleInput) {
                            const handled = comp.component.handleInput(char || '', key)
                            if (handled) {
                                this.render()
                                return
                            }
                        }
                    }
                    
                    // If not handled, navigate between components
                    if (key.shift) {
                        this.focusPrevious()
                    } else {
                        this.focusNext()
                    }
                    this.render()
                    return
                }
            }
            
            // Send to focused component
            if (this.focusedComponent) {
                const comp = this.components.get(this.focusedComponent)
                if (comp?.component.handleInput) {
                    const handled = comp.component.handleInput(char || '', key)
                    if (handled) {
                        this.render()
                        return
                    }
                }
            }
        })
    }
    
    /**
     * Handle mouse event
     */
    private handleMouseEvent(event: MouseEvent): void {
        // Update mouse position for cursor synchronization
        this.lastMouseX = Math.max(0, Math.min(event.x, this.width - 1))
        this.lastMouseY = Math.max(0, Math.min(event.y, this.height - 1))
        
        this.writeDebugInfo('MOUSE_EVENT', {
            type: event.type,
            button: event.button,
            position: { x: event.x, y: event.y },
            modifiers: { ctrl: event.ctrl, shift: event.shift, meta: event.meta }
        })
        
        // In cursor mode, just update cursor position
        if (this.cursorMode) {
            this.setCursorPosition(this.lastMouseX, this.lastMouseY)
            this.render()
            return
        }
        
        // Find component at mouse position
        for (const [id, { component, region }] of this.components) {
            if (event.x >= region.x && event.x < region.x + region.width &&
                event.y >= region.y && event.y < region.y + region.height) {
                
                // Focus component on click and sync cursor
                if (event.type === MouseEventType.PRESS && event.button === MouseButton.LEFT) {
                    if (component.isFocusable !== false) {
                        this.focusComponent(id)
                        // Set cursor to click position within the component
                        this.setCursorPosition(event.x, event.y)
                    }
                }
                
                // Send mouse event to component
                if (component.handleMouse) {
                    // Convert to component-relative coordinates
                    const relativeEvent = {
                        ...event,
                        x: event.x - region.x,
                        y: event.y - region.y
                    }
                    const handled = component.handleMouse(relativeEvent)
                    if (handled) {
                        this.render()
                        return
                    }
                }
            }
        }
        
        // Emit global mouse event
        this.emit('mouse', event)
    }
    
    /**
     * Handle cursor mode input (Ctrl+K mode)
     */
    private handleCursorModeInput(char: string, key: readline.Key): void {
          
        let newX = this.cursorX
        let newY = this.cursorY
        let click = false
        let rightClick = false
        
        // Movement keys
        if (key.name === 'up' || char === 'w' || char === 'W' || char === '8') {
            newY = Math.max(0, newY - 1)
        } else if (key.name === 'down' || char === 's' || char === 'S' || char === '2' || char === '5') {
            newY = Math.min(this.height - 1, newY + 1)
        } else if (key.name === 'left' || char === 'a' || char === 'A' || char === '4') {
            newX = Math.max(0, newX - 1)
        } else if (key.name === 'right' || char === 'd' || char === 'D' || char === '6') {
            newX = Math.min(this.width - 1, newX + 1)
        }
        // Click actions
        else if (char === ' ' || key.name === 'return' || key.name === 'enter' || char === 'q' || char === 'Q' || char === '7') {
            click = true
        } else if (char === 'e' || char === 'E' || char === '9') {
            rightClick = true
        }
        
        // Update cursor position
        if (newX !== this.cursorX || newY !== this.cursorY) {
            this.setCursorPosition(newX, newY)
            this.lastMouseX = newX
            this.lastMouseY = newY
            this.render()
        }
        
        // Handle clicks
        if (click || rightClick) {
            const mouseEvent: MouseEvent = {
                type: MouseEventType.PRESS,
                button: rightClick ? MouseButton.RIGHT : MouseButton.LEFT,
                x: this.cursorX,
                y: this.cursorY,
                ctrl: false,
                shift: false,
                meta: false
            }
            this.handleMouseEvent(mouseEvent)
        }
    }
    
    /**
     * Enable mouse tracking
     */
    enableMouse(): void {
        // CRITICAL: Only enable mouse if we have TTY with raw mode
        // Without raw mode, terminal echoes mouse sequences as text!
        if (!process.stdin.isTTY) {
            // Cannot use mouse without TTY - would cause coordinate spillage
            return
        }
        
        if (!this.isMouseEnabled) {
            process.stdout.write(ANSI.mouseTrackingOn)
            this.isMouseEnabled = true
        }
    }
    
    /**
     * Disable mouse tracking
     */
    disableMouse(): void {
        if (this.isMouseEnabled) {
            process.stdout.write(ANSI.mouseTrackingOff)
            this.isMouseEnabled = false
        }
    }
    
    /**
     * Enter alternate screen (full-screen mode)
     */
    enterAlternateScreen(): void {
        // Enable output filtering to prevent ANY mouse spillage
        this.outputFilter.enable()
        
        // Only use alternate screen if we have proper TTY
        if (!process.stdout.isTTY) {
            return // Cannot use alternate screen without TTY
        }
        
        if (!this.isAlternateScreen) {
            process.stdout.write(ANSI.alternateScreenEnter)
            process.stdout.write(ANSI.hideCursor)
            this.isAlternateScreen = true
            this.cursorVisible = false
            // Don't call clear() here - let the renderer handle it
        }
    }
    
    /**
     * Exit alternate screen
     */
    exitAlternateScreen(): void {
        if (this.isAlternateScreen) {
            process.stdout.write(ANSI.showCursor)
            process.stdout.write(ANSI.alternateScreenExit)
            this.isAlternateScreen = false
            this.cursorVisible = true
        }
    }
    
    /**
     * Set cursor visibility
     */
    setCursorVisible(visible: boolean): void {
        this.cursorVisible = visible
        process.stdout.write(visible ? ANSI.showCursor : ANSI.hideCursor)
    }
    
    /**
     * Set cursor position
     */
    setCursorPosition(x: number, y: number): void {
        // Ensure cursor is within bounds
        this.cursorX = Math.max(0, Math.min(x, this.width - 1))
        this.cursorY = Math.max(0, Math.min(y, this.height - 1))
        process.stdout.write(ANSI.cursorPosition(this.cursorY + 1, this.cursorX + 1))
    }
    
    /**
     * Clear screen and buffer
     */
    clear(): void {
        this.buffer = this.createBuffer()
        process.stdout.write(ANSI.clearScreen)
        process.stdout.write(ANSI.cursorPosition(1, 1))
    }
    
    /**
     * Write text at position
     */
    write(text: string, x: number, y: number, style?: string): void {
        if (y < 0 || y >= this.height || x < 0) return
        if (!text || typeof text !== 'string') return
        
        let currentX = x
        for (const char of text) {
            if (currentX >= this.width) break
            if (char === '\n') {
                y++
                currentX = x
                continue
            }
            
            if (y < this.height) {
                this.buffer[y][currentX] = {
                    char,
                    style
                }
                currentX++
            }
        }
    }
    
    /**
     * Draw a box
     */
    drawBox(x: number, y: number, width: number, height: number, style = 'single'): void {
        const boxChars = {
            single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
            double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
            rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
            bold: { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
            ascii: { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' }
        }
        const chars = boxChars[style as keyof typeof boxChars] || boxChars.single
        
        // Top border
        this.write(chars.tl, x, y)
        this.write(chars.h.repeat(width - 2), x + 1, y)
        this.write(chars.tr, x + width - 1, y)
        
        // Vertical borders
        for (let i = 1; i < height - 1; i++) {
            this.write(chars.v, x, y + i)
            this.write(chars.v, x + width - 1, y + i)
        }
        
        // Bottom border
        this.write(chars.bl, x, y + height - 1)
        this.write(chars.h.repeat(width - 2), x + 1, y + height - 1)
        this.write(chars.br, x + width - 1, y + height - 1)
    }
    
    /**
     * Fill region with character
     */
    fillRegion(region: Region, char = ' ', style?: string): void {
        for (let y = region.y; y < region.y + region.height; y++) {
            for (let x = region.x; x < region.x + region.width; x++) {
                if (y < this.height && x < this.width) {
                    this.buffer[y][x] = { char, style }
                }
            }
        }
    }
    
    /**
     * Register a component
     */
    registerComponent(id: string, component: Renderable, region: Region): void {
        this.components.set(id, { component, region })
        if (component.isFocusable !== false) {
            this.focusOrder.push(id)
            if (!this.focusedComponent) {
                this.focusComponent(id)
            }
        }
    }
    
    /**
     * Unregister a component
     */
    unregisterComponent(id: string): void {
        this.components.delete(id)
        const index = this.focusOrder.indexOf(id)
        if (index > -1) {
            this.focusOrder.splice(index, 1)
        }
        if (this.focusedComponent === id) {
            this.focusNext()
        }
    }
    
    /**
     * Update component region
     */
    updateComponentRegion(id: string, region: Region): void {
        const comp = this.components.get(id)
        if (comp) {
            comp.region = region
        }
    }
    
    /**
     * Focus a component
     */
    focusComponent(id: string): void {
        if (this.focusedComponent === id) return
        
        if (this.focusedComponent) {
            const prev = this.components.get(this.focusedComponent)
            prev?.component.onBlur?.()
        }
        
        this.focusedComponent = id
        const comp = this.components.get(id)
        comp?.component.onFocus?.()
        this.render()
    }
    
    /**
     * Focus next component
     */
    focusNext(): void {
        if (this.focusOrder.length === 0) return
        
        const currentIndex = this.focusedComponent 
            ? this.focusOrder.indexOf(this.focusedComponent)
            : -1
        
        const nextIndex = (currentIndex + 1) % this.focusOrder.length
        this.focusComponent(this.focusOrder[nextIndex])
    }
    
    /**
     * Focus previous component
     */
    focusPrevious(): void {
        if (this.focusOrder.length === 0) return
        
        const currentIndex = this.focusedComponent 
            ? this.focusOrder.indexOf(this.focusedComponent)
            : 0
        
        const prevIndex = currentIndex === 0 
            ? this.focusOrder.length - 1
            : currentIndex - 1
        
        this.focusComponent(this.focusOrder[prevIndex])
    }
    
    /**
     * Get focused component
     */
    getFocusedComponent(): string | undefined {
        return this.focusedComponent
    }
    
    /**
     * Render all components and flush to screen
     */
    render(): void {
        if (this.isRendering) {
            // Queue render for next tick
            return
        }
        
        this.isRendering = true
        
        // Clear buffer
        this.buffer = this.createBuffer()
        
        // Render all components
        for (const [id, { component, region }] of this.components) {
            component.render(this, region)
        }
        
        // Update cursor position from focused component
        if (this.focusedComponent) {
            const comp = this.components.get(this.focusedComponent)
            if (comp?.component.getCursorPosition) {
                const cursorPos = comp.component.getCursorPosition()
                if (cursorPos) {
                    // Cursor position is already absolute from component
                    this.cursorX = cursorPos.x
                    this.cursorY = cursorPos.y
                }
            }
        }
        
        // Flush to terminal
        this.flush()
        
        // Capture screen state for debug
        this.captureScreenState()
        
        this.isRendering = false
    }
    
    /**
     * Flush buffer to terminal
     */
    private flush(): void {
        let output = ''
        
        // Hide cursor during render
        output += ANSI.hideCursor
        
        for (let y = 0; y < this.height; y++) {
            output += ANSI.cursorPosition(y + 1, 1)
            let currentStyle = ''
            for (let x = 0; x < this.width; x++) {
                const cell = this.buffer[y][x]
                
                // Only add style if it's different from current
                if (cell.style !== currentStyle) {
                    if (currentStyle) {
                        output += ANSI.reset
                    }
                    if (cell.style) {
                        output += cell.style
                    }
                    currentStyle = cell.style || ''
                }
                
                output += cell.char
            }
            // Reset at end of line if we have style
            if (currentStyle) {
                output += ANSI.reset
            }
        }
        
        // Position cursor and show if needed
        if (this.cursorVisible && this.focusedComponent) {
            output += ANSI.cursorPosition(this.cursorY + 1, this.cursorX + 1)
            output += ANSI.showCursor
        }
        
        process.stdout.write(output)
    }
    
    /**
     * Cleanup and restore terminal
     */
    cleanup(): void {
        this.disableMouse()
        this.exitAlternateScreen()
        this.outputFilter.disable() // Disable output filtering on cleanup
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(false)
        }
        this.inputHandler?.close()
        process.stdout.write(ANSI.showCursor)
        process.stdout.write(ANSI.reset)
    }
    
    /**
     * Enable debug mode with file output
     */
    enableDebugMode(debugFilePath: string = 'tui-debug.log'): void {
        this.debugMode = true
        const fs = require('fs')
        this.debugFile = fs.createWriteStream(debugFilePath, { flags: 'w' })
        if (this.debugFile) {
            this.debugFile.write(`[${new Date().toISOString()}] Debug mode enabled\n`)
            this.debugFile.write(`Screen size: ${this.width}x${this.height}\n`)
            this.debugFile.write('='.repeat(80) + '\n')
        }
    }
    
    /**
     * Disable debug mode
     */
    disableDebugMode(): void {
        if (this.debugFile) {
            this.debugFile.write(`[${new Date().toISOString()}] Debug mode disabled\n`)
            this.debugFile.end()
            this.debugFile = undefined
        }
        this.debugMode = false
    }
    
    /**
     * Write debug information
     */
    private writeDebugInfo(event: string, data?: any): void {
        if (!this.debugMode || !this.debugFile) return
        
        const timestamp = new Date().toISOString()
        this.debugFile.write(`[${timestamp}] ${event}`)
        if (data) {
            this.debugFile.write(`: ${JSON.stringify(data)}`)
        }
        this.debugFile.write('\n')
    }
    
    /**
     * Capture current screen state for debug
     */
    private captureScreenState(): void {
        if (!this.debugMode || !this.debugFile) return
        
        this.debugFile.write('SCREEN STATE:\n')
        for (let y = 0; y < this.height; y++) {
            let line = ''
            for (let x = 0; x < this.width; x++) {
                const cell = this.buffer[y][x]
                line += cell.char
            }
            this.debugFile.write(`${y.toString().padStart(2, '0')}: ${line}\n`)
        }
        this.debugFile.write(`Cursor: (${this.cursorX}, ${this.cursorY})\n`)
        this.debugFile.write(`Cursor Mode: ${this.cursorMode}\n`)
        this.debugFile.write(`Mouse: (${this.lastMouseX}, ${this.lastMouseY})\n`)
        this.debugFile.write('-'.repeat(80) + '\n')
    }
    
    /**
     * Get screen dimensions
     */
    getDimensions(): { width: number; height: number } {
        return { width: this.width, height: this.height }
    }
}