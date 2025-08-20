/**
 * Component Factory
 * Creates components with proper initialization
 * NOTE: This factory is deprecated in the new generic architecture
 * Apps should create their own components directly
 */

import { Component, ComponentProps, RenderContext } from './Component'

/**
 * Deprecated: Use app-specific components instead
 * This factory creates basic placeholder components for backward compatibility
 */
export class ComponentFactory {
    private static instance: ComponentFactory
    
    private constructor() {}
    
    static getInstance(): ComponentFactory {
        if (!ComponentFactory.instance) {
            ComponentFactory.instance = new ComponentFactory()
        }
        return ComponentFactory.instance
    }
    
    /**
     * Create a basic placeholder component
     * NOTE: Apps should create their own components instead
     */
    createComponent(type: string, options: any): Component | null {
        return new PlaceholderComponent({ type, ...options })
    }
}

/**
 * Placeholder component for backward compatibility
 */
class PlaceholderComponent extends Component {
    render(context: RenderContext): void {
        const text = `[${this.props.type || 'component'}]`
        this.writeText(context, text, 0, 0, '\x1b[90m') // Gray text
    }
}