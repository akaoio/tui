/**
 * Stream-based Radio component
 */

import { StreamComponent } from './base';
import { Color, color, reset } from '../../utils/colors';
import { bold } from '../../utils/styles';

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