/**
 * Template and value resolution
 */

import { SchemaRendererState } from './types';

/**
 * Resolve template values
 */
export function resolveValue(this: any, state: SchemaRendererState, value: any): any {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return value;
  
  // Simple template that should return raw value
  const simpleTemplateMatch = value.match(/^\{\{([^}]+)\}\}$/);
  if (simpleTemplateMatch) {
    const path = simpleTemplateMatch[1].trim();
    const store = state.storeManager?.getStore() || (global as any).$store;
    
    if (!store) return '';
    
    // Direct getter reference
    if (store.getters && store.getters[path] !== undefined) {
      return store.getters[path];
    }
    
    // Direct state reference
    if (store.state && store.state[path] !== undefined) {
      return store.state[path];
    }
    
    // Complex path
    const parts = path.split('.');
    let current: any = { ...store.state, ...store.getters };
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return '';
      }
    }
    
    return current !== undefined ? current : '';
  }
  
  // Template interpolation for mixed content
  const store = state.storeManager?.getStore() || (global as any).$store;
  if (!store) return value;
  
  return value.replace(/\{\{([^}]+)\}\}/g, (match: string, path: string) => {
    const trimmed = path.trim();
    
    // Try getters first
    if (store.getters && store.getters[trimmed] !== undefined) {
      return String(store.getters[trimmed]);
    }
    
    // Then state
    if (store.state && store.state[trimmed] !== undefined) {
      return String(store.state[trimmed]);
    }
    
    // Complex path
    const parts = trimmed.split('.');
    let current: any = { ...store.state, ...store.getters };
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return match;
      }
    }
    
    return current !== undefined ? String(current) : match;
  });
}