/**
 * Stream-based Spinner component
 */

import { StreamComponent } from './base';
import { Color, color, reset } from '../../utils/colors';

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