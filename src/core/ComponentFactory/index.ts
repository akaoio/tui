/**
 * ComponentFactory - Container class
 * Creates components with proper initialization
 * NOTE: This factory is deprecated in the new generic architecture
 * Apps should create their own components directly
 */

import { Component } from '../Component'
import { getInstance } from './getInstance'
import { createComponent } from './createComponent'

export class ComponentFactory {
  private static instance: ComponentFactory
  
  private constructor() {}
  
  static getInstance(): ComponentFactory {
    return getInstance.call(ComponentFactory)
  }
  
  /**
   * Create a basic placeholder component
   * NOTE: Apps should create their own components instead
   */
  createComponent(type: string, options: any): Component | null {
    return createComponent.call(this, type, options)
  }
}

export default ComponentFactory