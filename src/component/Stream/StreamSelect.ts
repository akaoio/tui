/**
 * Stream-based Select component - FINAL NODE.JS APPROACH
 * Sử dụng Node.js built-in cursor control methods
 */

import { StreamComponent } from './base';
import { Color, color, reset } from '../../utils/colors';
import { bold } from '../../utils/styles';

/**
 * Stream-based Select component - Final implementation
 */
export class StreamSelect extends StreamComponent {
    private options: string[];
    private currentIndex = 0;
    private rendered = false;
    private startRow = 0;
    
    constructor(options: string[]) {
        super();
        this.options = options;
    }
    
    async render(prompt: string): Promise<string> {
        // Write prompt
        process.stdout.write(prompt + '\n');
        
        // Track starting position
        this.startRow = process.stdout.rows ? process.stdout.rows - this.options.length - 1 : 0;
        
        // Render all options
        this.renderAllOptions();
        this.rendered = true;
        
        return new Promise((resolve) => {
            // Don't create readline interface in raw mode - they conflict
            let useRawMode = false;
            
            // Try to enable raw mode, but always create readline as backup
            this.rl = this.createReadline();
            
            try {
                if (process.stdin.setRawMode) {
                    process.stdin.setRawMode(true);
                    useRawMode = true;
                }
            } catch (error) {
                console.log('[DEBUG] Raw mode not available, using readline interface');
                useRawMode = false;
            }
            
            const handleKey = (chunk: Buffer) => {
                console.log(`[DEBUG] handleKey called with:`, JSON.stringify(chunk.toString()));
                const key = chunk.toString();
                
                // Filter mouse sequences
                if (this.isMouseSequence(key)) {
                    return;
                }
                
                let updated = false;
                const oldIndex = this.currentIndex;
                
                // Handle navigation
                if (key === '\x1b[A' || key === '\x1bOA') { // Up
                    if (this.currentIndex > 0) {
                        this.currentIndex--;
                        updated = true;
                    }
                } else if (key === '\x1b[B' || key === '\x1bOB') { // Down
                    if (this.currentIndex < this.options.length - 1) {
                        this.currentIndex++;
                        updated = true;
                    }
                } else if (key === '\r' || key === '\n') { // Enter
                    this.cleanup();
                    resolve(this.options[this.currentIndex]);
                    return;
                } else if (key === '\x03') { // Ctrl+C
                    this.cleanup();
                    process.exit(0);
                }
                
                // Debug output to see what keys are being received
                console.log(`[DEBUG] Key received in ${useRawMode ? 'raw' : 'normal'} mode: ${JSON.stringify(key)}`);
                
                // Update display if needed
                if (updated && oldIndex !== this.currentIndex) {
                    console.log('[DEBUG] Updating display...');
                    this.updateDisplay();
                }
            };
            
            if (useRawMode) {
                console.log('[DEBUG] Adding data listener for raw mode');
                
                // Try multiple event sources for raw mode
                process.stdin.on('data', handleKey);
                process.stdin.on('readable', () => {
                    let chunk;
                    while (null !== (chunk = process.stdin.read())) {
                        console.log('[DEBUG] readable event:', JSON.stringify(chunk.toString()));
                        handleKey(chunk);
                    }
                });
                
                // Also setup readline as backup even in raw mode
                if (this.rl) {
                    this.rl.on('line', (line: string) => {
                        console.log('[DEBUG] Raw mode line received:', JSON.stringify(line));
                        if (line === '') {
                            this.cleanup();
                            resolve(this.options[this.currentIndex]);
                        }
                    });
                }
                
                process.stdin.resume();
                console.log('[DEBUG] stdin events setup for raw mode');
            } else {
                console.log('[DEBUG] Adding readline listeners for normal mode');
                
                // Enable keypress events for readline
                const readline = require('readline');
                if (readline.emitKeypressEvents) {
                    readline.emitKeypressEvents(process.stdin);
                }
                
                // In normal mode, we need to handle line-based input
                this.rl!.on('line', (line: string) => {
                    console.log(`[DEBUG] Line received: ${JSON.stringify(line)}`);
                    // Handle Enter
                    this.cleanup();
                    resolve(this.options[this.currentIndex]);
                });
                
                // For arrow keys in non-raw mode, we still need keypress events
                process.stdin.on('keypress', (str: string, key: any) => {
                    console.log(`[DEBUG] Keypress: ${JSON.stringify(str)}, key:`, key);
                    
                    if (key && key.name) {
                        let updated = false;
                        const oldIndex = this.currentIndex;
                        
                        if (key.name === 'up' && this.currentIndex > 0) {
                            this.currentIndex--;
                            updated = true;
                        } else if (key.name === 'down' && this.currentIndex < this.options.length - 1) {
                            this.currentIndex++;
                            updated = true;
                        } else if (key.ctrl && key.name === 'c') {
                            this.cleanup();
                            process.exit(0);
                        }
                        
                        if (updated && oldIndex !== this.currentIndex) {
                            console.log('[DEBUG] Updating display via keypress...');
                            this.updateDisplay();
                        }
                    }
                });
            }
            
            console.log('[DEBUG] Event listeners setup complete');
        });
    }
    
    private renderAllOptions(): void {
        for (let i = 0; i < this.options.length; i++) {
            this.renderOption(i);
        }
    }
    
    private renderOption(index: number): void {
        const isSelected = index === this.currentIndex;
        const prefix = isSelected ? '▶ ' : '  ';
        const text = isSelected 
            ? color(Color.Cyan) + bold(this.options[index]) + reset()
            : this.options[index];
        
        process.stdout.write(prefix + text + '\n');
    }
    
    private updateDisplay(): void {
        if (!this.rendered) return;
        
        // Use raw ANSI escape sequences for maximum compatibility
        // Move cursor up to start of options
        process.stdout.write(`\x1b[${this.options.length}A`);
        
        // Redraw each option with explicit cursor control
        for (let i = 0; i < this.options.length; i++) {
            // Move to beginning of line and clear it
            process.stdout.write('\x1b[0G\x1b[2K');
            
            // Render option
            const isSelected = i === this.currentIndex;
            const prefix = isSelected ? '▶ ' : '  ';
            const text = isSelected 
                ? color(Color.Cyan) + bold(this.options[i]) + reset()
                : this.options[i];
            
            // Write option
            process.stdout.write(prefix + text);
            
            // Move to next line (except for last option)
            if (i < this.options.length - 1) {
                process.stdout.write('\r\n');
            }
        }
        
        // Multiple flush attempts to ensure immediate output
        process.stdout.write(''); // Empty write to trigger flush
        
        // Force flush using different methods
        if (typeof (process.stdout as any)._flush === 'function') {
            try {
                (process.stdout as any)._flush();
            } catch (e) {}
        }
        
        // Alternative flush methods
        try {
            process.stdout.cork();
            process.stdout.uncork();
        } catch (e) {}
        
        // Final flush using drain event
        process.stdout.write('', 'utf8', () => {
            // Callback ensures write is complete
        });
    }
    
    private cleanup(): void {
        try {
            if (process.stdin.setRawMode) {
                process.stdin.setRawMode(false);
            }
        } catch (error) {
            // Ignore cleanup errors
        }
        process.stdin.removeAllListeners('data');
        this.closeReadline();
    }
}