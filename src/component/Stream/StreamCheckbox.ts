/**
 * Stream-based Checkbox component
 */

import { StreamComponent } from './base';

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