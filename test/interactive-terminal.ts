#!/usr/bin/env tsx

/**
 * Interactive Terminal Emulator
 * Allows real-time interaction and visualization of terminal output
 */

import { spawn, ChildProcess } from 'child_process'
import * as readline from 'readline'
import * as fs from 'fs'

class InteractiveTerminal {
    private child: ChildProcess | null = null
    private screen: TerminalScreen
    private rl: readline.Interface
    private recording: string[] = []
    
    constructor() {
        this.screen = new TerminalScreen()
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'CMD> '
        })
        
        this.setupCommands()
    }
    
    setupCommands() {
        console.log('='.repeat(80))
        console.log('Interactive Terminal Emulator')
        console.log('='.repeat(80))
        console.log('Commands:')
        console.log('  run <command>    - Run a command (e.g., "run npm run air:install -- --check")')
        console.log('  send <text>      - Send text to running process')
        console.log('  enter            - Send Enter key to process')
        console.log('  ctrl-c           - Send Ctrl+C to process')
        console.log('  show             - Show current screen')
        console.log('  clear            - Clear screen buffer')
        console.log('  save <filename>  - Save screen to file')
        console.log('  replay           - Replay all recorded output')
        console.log('  exit             - Exit emulator')
        console.log('='.repeat(80))
        
        this.rl.prompt()
        
        this.rl.on('line', (line) => {
            this.handleCommand(line.trim())
            this.rl.prompt()
        })
    }
    
    handleCommand(command: string) {
        const parts = command.split(' ')
        const cmd = parts[0]
        
        switch (cmd) {
            case 'run':
                this.runCommand(parts.slice(1).join(' '))
                break
            case 'send':
                this.sendToProcess(parts.slice(1).join(' '))
                break
            case 'enter':
                this.sendToProcess('\n')
                break
            case 'ctrl-c':
                this.sendToProcess('\x03')
                break
            case 'show':
                this.showScreen()
                break
            case 'clear':
                this.screen = new TerminalScreen()
                console.log('Screen cleared')
                break
            case 'save':
                this.saveScreen(parts[1] || 'screen.txt')
                break
            case 'replay':
                this.replayRecording()
                break
            case 'exit':
                if (this.child) {
                    this.child.kill()
                }
                process.exit(0)
                break
            default:
                console.log('Unknown command:', cmd)
        }
    }
    
    runCommand(cmdLine: string) {
        if (this.child) {
            console.log('Process already running. Kill it first.')
            return
        }
        
        // Parse command line
        const args = cmdLine.split(' ')
        const command = args[0]
        
        console.log(`Starting: ${cmdLine}`)
        
        // Change to air directory if running air commands
        if (cmdLine.includes('air:install')) {
            process.chdir('/home/x/Projects/air')
        }
        
        this.child = spawn(command, args.slice(1), {
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
            env: { ...process.env, TERM: 'xterm-256color' }
        })
        
        this.child.stdout?.on('data', (data) => {
            const str = data.toString()
            this.recording.push(`[STDOUT] ${str}`)
            this.screen.processANSI(str)
            console.log('\n--- Output received ---')
            this.showScreen()
        })
        
        this.child.stderr?.on('data', (data) => {
            const str = data.toString()
            this.recording.push(`[STDERR] ${str}`)
            console.log('STDERR:', str)
        })
        
        this.child.on('close', (code) => {
            console.log(`\nProcess exited with code ${code}`)
            this.child = null
        })
    }
    
    sendToProcess(text: string) {
        if (!this.child) {
            console.log('No process running')
            return
        }
        
        this.child.stdin?.write(text)
        console.log(`Sent: ${JSON.stringify(text)}`)
    }
    
    showScreen() {
        console.log(this.screen.renderCompact())
        console.log('\nRaw buffer (first 5 lines):')
        console.log(this.screen.getRawBuffer().slice(0, 5))
    }
    
    saveScreen(filename: string) {
        const content = this.screen.renderCompact()
        fs.writeFileSync(filename, content)
        console.log(`Screen saved to ${filename}`)
    }
    
    replayRecording() {
        console.log('\n--- Replay Recording ---')
        this.recording.forEach((line, i) => {
            console.log(`${i}: ${line.substring(0, 100)}...`)
        })
    }
}

class TerminalScreen {
    private width: number = 80
    private height: number = 24
    private buffer: string[][]
    private cursorX: number = 0
    private cursorY: number = 0
    private savedCursorX: number = 0
    private savedCursorY: number = 0
    private colorBuffer: string[][]  // Store color codes
    
    constructor(width = 80, height = 24) {
        this.width = width
        this.height = height
        this.buffer = Array(height).fill(null).map(() => Array(width).fill(' '))
        this.colorBuffer = Array(height).fill(null).map(() => Array(width).fill(''))
    }
    
    processANSI(text: string): void {
        let i = 0
        let currentColor = ''
        
        while (i < text.length) {
            if (text[i] === '\x1b') {
                // ANSI escape sequence
                if (text[i + 1] === '[') {
                    let j = i + 2
                    let params = ''
                    
                    // Collect parameters
                    while (j < text.length && !/[A-Za-z]/.test(text[j])) {
                        params += text[j]
                        j++
                    }
                    
                    if (j < text.length) {
                        const command = text[j]
                        const fullSeq = text.substring(i, j + 1)
                        
                        if (command === 'm') {
                            // Color/style command
                            currentColor = fullSeq
                        } else {
                            this.handleANSICommand(command, params)
                        }
                        
                        i = j + 1
                        continue
                    }
                }
            } else if (text[i] === '\n') {
                this.cursorY++
                this.cursorX = 0
                i++
            } else if (text[i] === '\r') {
                this.cursorX = 0
                i++
            } else {
                // Regular character
                if (this.cursorY >= 0 && this.cursorY < this.height && 
                    this.cursorX >= 0 && this.cursorX < this.width) {
                    this.buffer[this.cursorY][this.cursorX] = text[i]
                    this.colorBuffer[this.cursorY][this.cursorX] = currentColor
                    this.cursorX++
                    if (this.cursorX >= this.width) {
                        this.cursorX = 0
                        this.cursorY++
                    }
                }
                i++
            }
        }
    }
    
    handleANSICommand(command: string, params: string): void {
        switch (command) {
            case 'H': // Cursor position
                const match = params.match(/(\d+);(\d+)/)
                if (match) {
                    this.cursorY = Math.max(0, Math.min(this.height - 1, parseInt(match[1]) - 1))
                    this.cursorX = Math.max(0, Math.min(this.width - 1, parseInt(match[2]) - 1))
                } else if (params === '') {
                    this.cursorY = 0
                    this.cursorX = 0
                }
                break
            
            case 'J': // Clear screen
                if (params === '2') {
                    this.buffer = Array(this.height).fill(null).map(() => Array(this.width).fill(' '))
                    this.colorBuffer = Array(this.height).fill(null).map(() => Array(this.width).fill(''))
                    this.cursorX = 0
                    this.cursorY = 0
                }
                break
            
            case 'K': // Clear line
                if (params === '2' || params === '') {
                    if (this.cursorY < this.height) {
                        for (let x = this.cursorX; x < this.width; x++) {
                            this.buffer[this.cursorY][x] = ' '
                            this.colorBuffer[this.cursorY][x] = ''
                        }
                    }
                }
                break
            
            case 's': // Save cursor
                this.savedCursorX = this.cursorX
                this.savedCursorY = this.cursorY
                break
            
            case 'u': // Restore cursor
                this.cursorX = this.savedCursorX
                this.cursorY = this.savedCursorY
                break
        }
    }
    
    renderCompact(): string {
        const lines: string[] = []
        let firstNonEmpty = -1
        let lastNonEmpty = -1
        
        // Find non-empty lines
        for (let y = 0; y < this.height; y++) {
            const line = this.buffer[y].join('').trimEnd()
            if (line.length > 0) {
                if (firstNonEmpty === -1) firstNonEmpty = y
                lastNonEmpty = y
            }
        }
        
        if (firstNonEmpty === -1) {
            return '[Empty screen]'
        }
        
        lines.push(`╔${'═'.repeat(this.width + 10)}╗`)
        lines.push(`║ Screen (rows ${firstNonEmpty + 1}-${lastNonEmpty + 1})${' '.repeat(this.width - 15)}║`)
        lines.push(`╠${'═'.repeat(this.width + 10)}╣`)
        
        for (let y = firstNonEmpty; y <= lastNonEmpty; y++) {
            const lineNum = `${(y + 1).toString().padStart(3)}:`
            const content = this.buffer[y].join('')
            lines.push(`║ ${lineNum} ${content.padEnd(this.width + 3)} ║`)
        }
        
        lines.push(`╠${'═'.repeat(this.width + 10)}╣`)
        lines.push(`║ Cursor: row ${this.cursorY + 1}, col ${this.cursorX + 1}${' '.repeat(this.width - 10)}║`)
        lines.push(`╚${'═'.repeat(this.width + 10)}╝`)
        
        return lines.join('\n')
    }
    
    getRawBuffer(): string[] {
        return this.buffer.map((row, y) => {
            const line = row.join('')
            return `${y.toString().padStart(3)}: [${line}]`
        })
    }
}

// Start the interactive terminal
const terminal = new InteractiveTerminal()