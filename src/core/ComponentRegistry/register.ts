/**
 * ComponentRegistry register method
 */

import { Component } from '../Component';
import {
  ComponentMetadata,
  ComponentRef,
  RegisterOptions
} from './types';
import { generateId } from './utils';
import { setupComponentEvents } from './setupComponentEvents';
import { updateComponentTree } from './updateComponentTree';

export function register(
  this: any,
  component: Component,
  options: RegisterOptions = {}
): string {
  // Handle null/undefined gracefully
  if (!component) {
    return '';
  }
  
  const id = options.id || component.id || generateId(options.type || component.constructor?.name);
  
  // Check for duplicate ID
  if (this.components.has(id)) {
    // Generate new ID instead of throwing
    const newId = generateId(options.type || component.constructor?.name);
    return register.call(this, component, { ...options, id: newId });
  }
  
  // Create metadata
  const metadata: ComponentMetadata = {
    id,
    type: options.type || (component as any).type || component.constructor?.name || 'Component',
    name: options.name,
    parent: options.parent,
    children: [],
    props: options.props || {},
    state: options.state || {},
    createdAt: new Date(),
    updatedAt: new Date(),
    mounted: false
  };
  
  // Create component reference
  const ref: ComponentRef = {
    id,
    component,
    metadata
  };
  
  // Store component
  this.components.set(id, ref);
  
  // Update type index
  if (!this.componentsByType.has(metadata.type)) {
    this.componentsByType.set(metadata.type, new Set());
  }
  this.componentsByType.get(metadata.type)!.add(id);
  
  // Update parent-child relationship
  if (options.parent) {
    const parent = this.components.get(options.parent);
    if (parent) {
      parent.metadata.children.push(id);
    }
  }
  
  // Setup event forwarding
  setupComponentEvents.call(this, id, component);
  
  // Update component tree
  updateComponentTree.call(this);
  
  // Emit event
  this.emit('register', { id, component, metadata });
  
  return id;
}