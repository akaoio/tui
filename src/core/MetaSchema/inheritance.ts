/**
 * Inheritance and mixin processing for MetaSchema
 */

import { MetaSchema } from './types';

/**
 * Process inheritance
 */
export function processInheritance(this: any, schema: MetaSchema,
  schemas: Map<string, MetaSchema>): void {
  const parents = Array.isArray(schema.$extends) 
    ? schema.$extends 
    : [schema.$extends!];
  
  for (const parentId of parents) {
    const parent = schemas.get(parentId);
    if (parent) {
      // Deep merge parent into schema
      deepMerge(schema, parent);
    }
  }
}

/**
 * Process mixins
 */
export function processMixins(this: any, schema: MetaSchema,
  schemas: Map<string, MetaSchema>): void {
  if (!schema.$mixins) return;
  
  for (const mixinId of schema.$mixins) {
    const mixin = schemas.get(mixinId);
    if (mixin) {
      // Merge mixin into schema
      deepMerge(schema, mixin);
    }
  }
}

/**
 * Deep merge objects
 */
export function deepMerge(this: any, target: any, source: any): any {
  for (const key in source) {
    if (key.startsWith('$')) continue; // Skip meta properties
    
    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      if (!(key in target)) {
        target[key] = source[key];
      }
    }
  }
  return target;
}