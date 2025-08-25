/**
 * ComponentAdapter - Main class
 * Bridge between Schema-driven and Component-based rendering
 */

import { EventEmitter } from 'events';
import { Component } from '../../component/Component';
import { Key, KeyEvent } from '../keyboard';
import { 
  SchemaComponentDefinition, 
  AdapterContext, 
  ComponentRegion,
  ComponentEventData 
} from './types';
import {
  createInput,
  createSelect,
  createCheckbox,
  createRadio,
  createProgressBar,
  createSpinner,
  createBaseOptions
} from './createComponent';

/**
 * Adapts schema definitions to actual Component instances
 */
export class ComponentAdapter extends EventEmitter {
  private components: Map<string, Component> = new Map();
  private context: AdapterContext;

  constructor(screen: any, keyboard: any, context?: Partial<AdapterContext>) {
    super();
    this.context = {
      screen,
      keyboard,
      resolveValue: (v) => v,
      ...context
    };
  }

  /**
   * Create a Component instance from schema definition
   */
  createComponent(
    id: string, 
    schema: SchemaComponentDefinition, 
    region?: ComponentRegion
  ): Component | null {
    const existingComponent = this.components.get(id);
    if (existingComponent) {
      this.updateComponent(existingComponent, schema, region);
      return existingComponent;
    }

    const baseOptions = createBaseOptions(region);
    let component: Component | null = null;

    switch (schema.type) {
      case 'input':
      case 'text':
        component = createInput(schema, baseOptions, this.context);
        break;
      
      case 'select':
      case 'list':
        component = createSelect(schema, baseOptions, this.context);
        break;
      
      case 'checkbox':
        component = createCheckbox(schema, baseOptions, this.context);
        break;
      
      case 'radio':
      case 'buttonGroup':
        component = createRadio(schema, baseOptions, this.context);
        break;
      
      case 'progressBar':
      case 'progress':
        component = createProgressBar(schema, baseOptions, this.context);
        break;
      
      case 'spinner':
      case 'loading':
        component = createSpinner(schema, baseOptions, this.context);
        break;
      
      default:
        // For unknown types, return null
        return null;
    }

    if (component) {
      this.components.set(id, component);
      this.setupEventHandlers(component, schema);
    }

    return component;
  }

  /**
   * Update an existing component with new schema data
   */
  private updateComponent(
    component: Component, 
    schema: SchemaComponentDefinition, 
    region?: ComponentRegion
  ): void {
    // Update position and size if provided
    if (region) {
      component.setPosition(region.x, region.y);
      component.setSize(region.width, region.height);
    }

    // Update value based on schema type
    if (schema.props?.value !== undefined) {
      const resolvedValue = this.context.resolveValue(schema.props.value);
      component.setValue(resolvedValue);
    }

    // Update data for list-based components
    if (schema.data !== undefined) {
      const resolvedData = this.context.resolveValue(schema.data);
      if ('setOptions' in component && typeof (component as any).setOptions === 'function') {
        (component as any).setOptions(resolvedData);
      }
    }
  }

  /**
   * Setup event handlers from schema
   */
  private setupEventHandlers(component: Component, schema: SchemaComponentDefinition): void {
    if (!schema.events) return;

    for (const [event, handler] of Object.entries(schema.events)) {
      component.on(event, (...args) => {
        const eventData: ComponentEventData = {
          component,
          event,
          handler,
          args
        };
        this.emit('component-event', eventData);
      });
    }
  }

  /**
   * Render a component
   */
  renderComponent(id: string): void {
    const component = this.components.get(id);
    if (component && component.isVisible()) {
      component.render();
    }
  }

  /**
   * Handle keyboard input for a component
   */
  handleKeyboardInput(id: string, key: Key, event: KeyEvent): boolean {
    const component = this.components.get(id);
    if (component && component.isFocused()) {
      component.handleKey(key, event);
      return true;
    }
    return false;
  }

  /**
   * Focus a component
   */
  focusComponent(id: string): void {
    // Blur all other components
    for (const [compId, comp] of this.components) {
      if (compId !== id && comp.isFocused()) {
        comp.blur();
      }
    }

    // Focus target component
    const component = this.components.get(id);
    if (component) {
      component.focus();
    }
  }

  /**
   * Get a component by ID
   */
  getComponent(id: string): Component | undefined {
    return this.components.get(id);
  }

  /**
   * Clear all components
   */
  clearAll(): void {
    for (const component of this.components.values()) {
      component.clear();
    }
  }

  /**
   * Update context
   */
  updateContext(context: Partial<AdapterContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Destroy all components and cleanup
   */
  destroy(): void {
    this.clearAll();
    this.components.clear();
    this.removeAllListeners();
  }
}