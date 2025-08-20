/**
 * Render modes for TUI components
 */
export enum RenderMode {
    /**
     * Stream mode - components render inline at current cursor position
     * Use this when mixing with console.log() or other stream output
     */
    STREAM = 'stream',
    
    /**
     * Absolute mode - components use absolute positioning
     * Use this for full-screen TUI applications
     */
    ABSOLUTE = 'absolute',
    
    /**
     * Auto mode - automatically detect best mode
     * Defaults to STREAM for safety
     */
    AUTO = 'auto'
}

/**
 * Position configuration for components
 */
export interface Position {
    x?: number
    y?: number
    mode?: RenderMode
}

/**
 * Renderer that handles both stream and absolute positioning
 */
export class Renderer {
    private mode: RenderMode
    private currentLine: number = 0
    
    constructor(mode: RenderMode = RenderMode.STREAM) {
        this.mode = mode
    }
    
    /**
     * Get current render mode
     */
    getMode(): RenderMode {
        return this.mode
    }
    
    /**
     * Set render mode
     */
    setMode(mode: RenderMode): void {
        this.mode = mode
    }
    
    /**
     * Check if in stream mode
     */
    isStreamMode(): boolean {
        return this.mode === RenderMode.STREAM || this.mode === RenderMode.AUTO
    }
    
    /**
     * Check if in absolute mode
     */
    isAbsoluteMode(): boolean {
        return this.mode === RenderMode.ABSOLUTE
    }
    
    /**
     * Track current line in stream mode
     */
    trackLine(): void {
        if (this.isStreamMode()) {
            this.currentLine++
        }
    }
    
    /**
     * Get current line for stream mode
     */
    getCurrentLine(): number {
        return this.currentLine
    }
    
    /**
     * Reset line tracking
     */
    resetTracking(): void {
        this.currentLine = 0
    }
}