/**
 * Stream-based Progress Bar component
 */

import { StreamComponent } from './base';
import { Color, color, reset } from '../../utils/colors';

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