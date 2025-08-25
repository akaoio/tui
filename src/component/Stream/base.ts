/**
 * Base class for stream-based components
 */

import * as readline from 'readline';
import { EventEmitter } from 'events';

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