/**
 * Stream-based components that work with readline
 * These components don't use absolute positioning and work well with console.log()
 */

import * as readline from 'readline';
import { EventEmitter } from 'events';
import { Color, color, reset } from '../utils/colors';
import { bold } from '../utils/styles';

/**
 * Base class for stream-based components
 */
export abstract class StreamComponent extends EventEmitter {
    protected rl?: readline.Interface;
    
    protected createReadline(): readline.Interface {
        return readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    
    protected closeReadline(): void {
        if (this.rl) {
            this.rl.close();
            this.rl = undefined;
        }
    }
    
    /**
     * Filter mouse sequences to prevent coordinate spillage
     * Uses same logic as ScreenManager to ensure consistency
     */
    protected isMouseSequence(data: string): boolean {
        // COMPREHENSIVE mouse event filtering - same as ScreenManager
        
        // 1. Raw fragmented mouse sequences (main cause of spillage)
        if (data.match(/^[0-9]+;[0-9]+;[0-9]+[Mm]/)) return true
        if (data.match(/^(0|1|2|64|65|32|33|34|35|36|37|38|39);/)) return true
        if (data.match(/[0-9]{1,3};[0-9]{1,3};[0-9]{1,3}[Mm]/)) return true
        if (data.match(/[0-9]+;[0-9]+;[0-9]+[Mm][0-9]/)) return true
        
        // 2. Standard mouse sequences
        if (data.includes('\x1b[<')) return true
        if (data.includes('\x1b[M')) return true
        if (data.match(/\x1b\[\d*[AB]/)) return true
        if (data.match(/\x1b\[<(64|65);/)) return true
        if (data.match(/\x1b\[<[0-9]+;[0-9]+;[0-9]+[Mm]/)) return true
        if (data.match(/\x1b\[\d+;\d+;\d+[MTmt]/)) return true
        if (data.match(/\x1b\[\?\d+[hl]/)) return true
        if (data.match(/\x1b\[[0-9;]*[HfMm<>ABCDhlpqrstuxyzXYZ]/)) return true
        
        // 3. Coordinate patterns
        if (data.match(/^\d+[;,]\d+/)) return true
        if (data.match(/^\d+$/)) return true
        if (data.match(/^\d+;\d+/)) return true
        if (data.match(/(64|65);\d+;\d+/)) return true
        if (data.match(/\d+;\d+[M;]/)) return true
        if (data.match(/[0-9;]{5,}[Mm]?/)) return true
        if (data.match(/^[0-9]+;[0-9]+;[0-9]+/)) return true
        
        return false
    }
}

/**
 * Stream-based Input component
 */
export class StreamInput extends StreamComponent {
    async render(prompt: string, defaultValue = ''): Promise<string> {
        return new Promise((resolve) => {
            this.rl = this.createReadline();
            
            this.rl.question(prompt, (answer) => {
                this.closeReadline();
                resolve(answer || defaultValue);
            });
            
            if (defaultValue) {
                this.rl.write(defaultValue);
            }
        });
    }
}

/**
 * Stream-based Select component
 */
export class StreamSelect extends StreamComponent {
    private options: string[];
    private currentIndex = 0;
    
    constructor(options: string[]) {
        super();
        this.options = options;
    }
    
    async render(prompt: string): Promise<string> {
        console.log(prompt);
        
        // Display options
        this.options.forEach((option, index) => {
            const prefix = index === this.currentIndex ? '▶ ' : '  ';
            const text = index === this.currentIndex 
                ? color(Color.Cyan) + bold(option) + reset()
                : option;
            console.log(prefix + text);
        });
        
        return new Promise((resolve) => {
            this.rl = this.createReadline();
            
            // Set raw mode for arrow key handling
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
            }
            
            const handleKey = (chunk: Buffer) => {
                const key = chunk.toString();
                
                // CRITICAL: Filter mouse sequences to prevent coordinate spillage
                if (this.isMouseSequence(key)) {
                    return; // Block mouse data from leaking through
                }
                
                // Handle arrow keys
                if (key === '\x1b[A') { // Up arrow
                    this.currentIndex = Math.max(0, this.currentIndex - 1);
                    this.redrawOptions();
                } else if (key === '\x1b[B') { // Down arrow
                    this.currentIndex = Math.min(this.options.length - 1, this.currentIndex + 1);
                    this.redrawOptions();
                } else if (key === '\r' || key === '\n') { // Enter
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(false);
                    }
                    process.stdin.removeListener('data', handleKey);
                    this.closeReadline();
                    resolve(this.options[this.currentIndex]);
                } else if (key === '\x03') { // Ctrl+C
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(false);
                    }
                    process.stdin.removeListener('data', handleKey);
                    this.closeReadline();
                    process.exit(0);
                }
            };
            
            process.stdin.on('data', handleKey);
        });
    }
    
    private redrawOptions(): void {
        // Move cursor up to redraw options
        process.stdout.write(`\x1b[${this.options.length}A`);
        
        // Redraw all options
        this.options.forEach((option, index) => {
            process.stdout.write('\x1b[2K'); // Clear line
            const prefix = index === this.currentIndex ? '▶ ' : '  ';
            const text = index === this.currentIndex 
                ? color(Color.Cyan) + bold(option) + reset()
                : option;
            console.log(prefix + text);
        });
    }
}

/**
 * Stream-based Checkbox component
 */
export class StreamCheckbox extends StreamComponent {
    async render(label: string, defaultChecked = false): Promise<boolean> {
        return new Promise((resolve) => {
            this.rl = this.createReadline();
            const prompt = `${label} [${defaultChecked ? 'Y/n' : 'y/N'}] `;
            
            this.rl.question(prompt, (answer) => {
                this.closeReadline();
                const normalized = answer.toLowerCase().trim();
                
                if (normalized === '') {
                    resolve(defaultChecked);
                } else if (normalized === 'y' || normalized === 'yes') {
                    resolve(true);
                } else if (normalized === 'n' || normalized === 'no') {
                    resolve(false);
                } else {
                    resolve(defaultChecked);
                }
            });
        });
    }
}

/**
 * Stream-based Radio component
 */
export class StreamRadio extends StreamComponent {
    private options: string[];
    private currentIndex: number;
    
    constructor(options: string[], defaultIndex = 0) {
        super();
        this.options = options;
        this.currentIndex = defaultIndex;
    }
    
    async render(prompt: string): Promise<string> {
        console.log(prompt);
        
        // Display radio options
        this.options.forEach((option, index) => {
            const selected = index === this.currentIndex;
            const radio = selected ? '◉' : '○';
            const text = selected 
                ? color(Color.Cyan) + bold(option) + reset()
                : option;
            console.log(`  ${radio} ${text}`);
        });
        
        return new Promise((resolve) => {
            if (process.stdin.isTTY) {
                process.stdin.setRawMode(true);
            }
            
            const handleKey = (chunk: Buffer) => {
                const key = chunk.toString();
                
                // CRITICAL: Filter mouse sequences to prevent coordinate spillage
                if (this.isMouseSequence(key)) {
                    return; // Block mouse data from leaking through
                }
                
                if (key === '\x1b[A') { // Up arrow
                    this.currentIndex = Math.max(0, this.currentIndex - 1);
                    this.redrawRadio();
                } else if (key === '\x1b[B') { // Down arrow
                    this.currentIndex = Math.min(this.options.length - 1, this.currentIndex + 1);
                    this.redrawRadio();
                } else if (key === ' ') { // Space to select
                    this.redrawRadio();
                } else if (key === '\r' || key === '\n') { // Enter
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(false);
                    }
                    process.stdin.removeListener('data', handleKey);
                    resolve(this.options[this.currentIndex]);
                } else if (key === '\x03') { // Ctrl+C
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(false);
                    }
                    process.stdin.removeListener('data', handleKey);
                    process.exit(0);
                }
            };
            
            process.stdin.on('data', handleKey);
        });
    }
    
    private redrawRadio(): void {
        // Move cursor up to redraw options
        process.stdout.write(`\x1b[${this.options.length}A`);
        
        // Redraw all options
        this.options.forEach((option, index) => {
            process.stdout.write('\x1b[2K'); // Clear line
            const selected = index === this.currentIndex;
            const radio = selected ? '◉' : '○';
            const text = selected 
                ? color(Color.Cyan) + bold(option) + reset()
                : option;
            console.log(`  ${radio} ${text}`);
        });
    }
}

/**
 * Stream-based Progress Bar
 */
export class StreamProgressBar extends StreamComponent {
    private total: number;
    private current = 0;
    private width: number;
    private label: string;
    
    constructor(label: string, total: number, width = 30) {
        super();
        this.label = label;
        this.total = total;
        this.width = width;
    }
    
    update(value: number): void {
        this.current = Math.min(value, this.total);
        this.draw();
    }
    
    private draw(): void {
        const percentage = Math.floor((this.current / this.total) * 100);
        const filled = Math.floor((this.current / this.total) * this.width);
        const empty = this.width - filled;
        
        const bar = '#'.repeat(filled) + '-'.repeat(empty);
        const text = `\r${this.label}: [${color(Color.Green)}${bar}${reset()}] ${percentage}%`;
        
        process.stdout.write(text);
        
        if (this.current >= this.total) {
            console.log(); // New line when complete
        }
    }
    
    async render(): Promise<void> {
        this.draw();
    }
}

/**
 * Stream-based Spinner
 */
export class StreamSpinner extends StreamComponent {
    private frames = ['|', '/', '-', '\\', '|', '/', '-', '\\'];
    private currentFrame = 0;
    private interval?: NodeJS.Timeout;
    private text: string;
    
    constructor(text: string) {
        super();
        this.text = text;
    }
    
    start(): void {
        this.interval = setInterval(() => {
            const frame = this.frames[this.currentFrame];
            process.stdout.write(`\r${color(Color.Cyan)}${frame}${reset()} ${this.text}`);
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }, 80);
    }
    
    stop(finalText?: string): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        
        process.stdout.write('\r\x1b[2K'); // Clear line
        if (finalText) {
            console.log(finalText);
        }
    }
    
}