#!/usr/bin/env tsx

import { spawn } from 'child_process'
import * as fs from 'fs'

// Simple screen buffer
class ScreenBuffer {
    private lines: string[] = []
    private currentLine = ''
    
    process(data: Buffer) {
        const text = data.toString()
        
        // Remove ANSI color codes but keep positioning
        const cleaned = text
            .replace(/\x1b\[[0-9;]*m/g, '') // Remove color codes
            .replace(/\x1b\[2J/g, '[CLEAR]') // Mark clear screen
            .replace(/\x1b\[(\d+);(\d+)H/g, '[MOVE:$1,$2]') // Mark cursor moves
            .replace(/\x1b\[s/g, '[SAVE_CURSOR]')
            .replace(/\x1b\[u/g, '[RESTORE_CURSOR]')
            .replace(/\x1b\[\?25[lh]/g, '') // Remove cursor show/hide
        
        // Process character by character
        for (const char of cleaned) {
            if (char === '\n') {
                this.lines.push(this.currentLine)
                this.currentLine = ''
            } else if (char === '\r') {
                // Carriage return - ignore for now
            } else {
                this.currentLine += char
            }
        }
    }
    
    getOutput(): string {
        const allLines = [...this.lines]
        if (this.currentLine) {
            allLines.push(this.currentLine)
        }
        return allLines.join('\n')
    }
}

// Run the air installer
async function captureAirInstaller() {
    return new Promise<void>((resolve) => {
        console.log('Running Air installer and capturing output...\n')
        
        process.chdir('/home/x/Projects/air')
        
        const child = spawn('npm', ['run', 'air:install', '--', '--check'], {
            stdio: ['pipe', 'pipe', 'pipe']
        })
        
        const buffer = new ScreenBuffer()
        let rawOutput = ''
        let iteration = 0
        
        child.stdout.on('data', (data) => {
            rawOutput += data.toString()
            buffer.process(data)
            
            iteration++
            console.log(`\n=== Iteration ${iteration} ===`)
            console.log('Raw bytes received:', data.length)
            console.log('\nScreen content:')
            console.log('---START---')
            console.log(buffer.getOutput())
            console.log('---END---')
            
            // Show ANSI sequences
            const ansiSeqs = data.toString().match(/\x1b\[[^m]*[A-Za-z]/g) || []
            if (ansiSeqs.length > 0) {
                console.log('\nANSI sequences in this chunk:')
                ansiSeqs.forEach(seq => {
                    const decoded = seq
                        .replace(/\x1b\[2J/, 'CLEAR_SCREEN')
                        .replace(/\x1b\[(\d+);(\d+)H/, 'MOVE_TO($1,$2)')
                        .replace(/\x1b\[s/, 'SAVE_CURSOR')
                        .replace(/\x1b\[u/, 'RESTORE_CURSOR')
                        .replace(/\x1b\[\?25l/, 'HIDE_CURSOR')
                        .replace(/\x1b\[\?25h/, 'SHOW_CURSOR')
                    console.log(`  ${JSON.stringify(seq)} => ${decoded}`)
                })
            }
        })
        
        // Answer the prompt after 1 second
        setTimeout(() => {
            console.log('\n>>> Sending Enter key <<<')
            child.stdin.write('\n')
            child.stdin.end()
        }, 1000)
        
        child.on('close', (code) => {
            console.log(`\n=== Process exited with code ${code} ===`)
            
            // Save raw output
            fs.writeFileSync('air-installer-raw.txt', rawOutput)
            fs.writeFileSync('air-installer-clean.txt', buffer.getOutput())
            
            console.log('\nFinal screen output saved to air-installer-clean.txt')
            console.log('Raw output saved to air-installer-raw.txt')
            
            resolve()
        })
        
        // Timeout after 5 seconds
        setTimeout(() => {
            child.kill()
            resolve()
        }, 5000)
    })
}

captureAirInstaller().catch(console.error)