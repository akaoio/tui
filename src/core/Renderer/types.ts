/**
 * Renderer types
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