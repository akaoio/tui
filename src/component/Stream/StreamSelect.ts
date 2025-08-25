/**
 * Stream-based Select component
 */

import { StreamComponent } from './base';
import { Color, color, reset } from '../../utils/colors';
import { bold } from '../../utils/styles';

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