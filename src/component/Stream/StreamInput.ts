/**
 * Stream-based Input component
 */

import { StreamComponent } from './base';

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