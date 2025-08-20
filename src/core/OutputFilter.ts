/**
 * Output Filter - Nuclear option to prevent ANY mouse spillage
 * Intercepts and filters ALL output to remove mouse sequences
 */

export class OutputFilter {
    private static instance: OutputFilter
    private originalWrite: typeof process.stdout.write
    private originalErrorWrite: typeof process.stderr.write
    private enabled = false
    
    private constructor() {
        this.originalWrite = process.stdout.write.bind(process.stdout)
        this.originalErrorWrite = process.stderr.write.bind(process.stderr)
    }
    
    static getInstance(): OutputFilter {
        if (!OutputFilter.instance) {
            OutputFilter.instance = new OutputFilter()
        }
        return OutputFilter.instance
    }
    
    /**
     * Enable output filtering - nuclear option
     */
    enable(): void {
        if (this.enabled) return
        this.enabled = true
        
        // Override stdout.write to filter mouse sequences
        process.stdout.write = (chunk: any, encoding?: any, callback?: any): boolean => {
            const str = chunk.toString()
            
            // Filter out ANY potential mouse coordinate patterns
            const filtered = this.filterMouseSequences(str)
            
            if (filtered !== str) {
                // Mouse data was filtered - write cleaned version
                return this.originalWrite(filtered, encoding, callback)
            }
            
            return this.originalWrite(chunk, encoding, callback)
        }
        
        // Also filter stderr just in case
        process.stderr.write = (chunk: any, encoding?: any, callback?: any): boolean => {
            const str = chunk.toString()
            const filtered = this.filterMouseSequences(str)
            
            if (filtered !== str) {
                return this.originalErrorWrite(filtered, encoding, callback)
            }
            
            return this.originalErrorWrite(chunk, encoding, callback)
        }
    }
    
    /**
     * Disable output filtering
     */
    disable(): void {
        if (!this.enabled) return
        this.enabled = false
        
        process.stdout.write = this.originalWrite
        process.stderr.write = this.originalErrorWrite
    }
    
    /**
     * Filter mouse sequences from output
     */
    private filterMouseSequences(str: string): string {
        // NUCLEAR FILTERING - remove ANY pattern that could be mouse coordinates
        
        // 1. Remove complete SGR mouse sequences
        str = str.replace(/\x1b\[<[0-9]+;[0-9]+;[0-9]+[Mm]/g, '')
        
        // 2. Remove legacy mouse sequences
        str = str.replace(/\x1b\[M.{3}/g, '')
        
        // 3. Remove raw coordinate patterns (the main culprit!)
        // Pattern: digits;digits;digits followed by M or m
        str = str.replace(/[0-9]+;[0-9]+;[0-9]+[Mm]/g, '')
        
        // 4. Remove partial patterns that start with mouse button codes
        str = str.replace(/\b(0|1|2|32|33|34|35|64|65);[0-9]+;[0-9]+[Mm]?/g, '')
        
        // 5. Remove any standalone coordinate-like patterns
        // This is aggressive but necessary
        str = str.replace(/\b[0-9]{1,3};[0-9]{1,3};[0-9]{1,3}[Mm]\b/g, '')
        
        // 6. Remove repeated patterns (like 65;80;33M65;80;33M)
        str = str.replace(/([0-9]+;[0-9]+;[0-9]+[Mm]){2,}/g, '')
        
        // 7. Clean up any orphaned escape sequences
        str = str.replace(/\x1b\[<$/g, '')
        str = str.replace(/\x1b\[$/g, '')
        
        return str
    }
}