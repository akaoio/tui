/**
 * Instance creation for MetaSchema
 */

import {
  MetaSchema,
  ComponentMetaSchema,
  PropsSchema,
  StateSchema,
  PropertySchema,
  WatchHandler
} from './types';

/**
 * Initialize props
 */
export function initializeProps(this: any, instance: any,
  propsSchema: PropsSchema,
  props: Record<string, any>): void {
  instance.props = {};
  
  for (const key in propsSchema) {
    const propDef = propsSchema[key];
    const value = props[key];
    
    if (typeof propDef === 'object' && 'default' in (propDef as PropertySchema)) {
      const propSchema = propDef as PropertySchema;
      instance.props[key] = value !== undefined ? value : propSchema.default;
    } else {
      instance.props[key] = value;
    }
  }
}

/**
 * Initialize state
 */
export function initializeState(this: any, instance: any,
  stateSchema: StateSchema,
  engine: any): void {
  instance.state = {};
  
  if (stateSchema.properties) {
    for (const key in stateSchema.properties) {
      const prop = stateSchema.properties[key];
      instance.state[key] = prop.default;
    }
  }
  
  // Make state reactive
  instance.state = engine.createReactiveProxy(instance.state);
}

/**
 * Setup computed properties
 */
export function setupComputed(this: any, instance: any,
  computed: Record<string, string | Function>,
  engine: any): void {
  instance.computed = {};
  
  for (const key in computed) {
    Object.defineProperty(instance, key, {
      get() {
        // Check cache
        const cacheKey = `${instance._id}.${key}`;
        if (engine.computedCache.has(cacheKey)) {
          return engine.computedCache.get(cacheKey);
        }
        
        // Compute value
        const handler = computed[key];
        const value = typeof handler === 'function' 
          ? handler.call(instance)
          : new Function('return ' + handler).call(instance);
        
        // Cache value
        engine.computedCache.set(cacheKey, value);
        
        return value;
      }
    });
  }
}

/**
 * Setup watchers
 */
export function setupWatchers(this: any, instance: any,
  watchers: Record<string, WatchHandler>,
  engine: any): void {
  for (const key in watchers) {
    const watcher = watchers[key];
    const handler = typeof watcher.handler === 'function'
      ? watcher.handler
      : new Function('newValue', 'oldValue', watcher.handler as string);
    
    const watchKey = `${instance._id}.${key}`;
    if (!engine.watchers.has(watchKey)) {
      engine.watchers.set(watchKey, new Set());
    }
    engine.watchers.get(watchKey)!.add(handler);
    
    // Call immediately if needed
    if (watcher.immediate) {
      const value = getValueByPath(instance, key);
      handler.call(instance, value, undefined);
    }
  }
}

/**
 * Setup methods
 */
export function setupMethods(this: any, instance: any,
  methods: Record<string, Function | string>): void {
  for (const key in methods) {
    const method = methods[key];
    instance[key] = typeof method === 'function'
      ? method.bind(instance)
      : new Function(method as string).bind(instance);
  }
}

/**
 * Get value by path
 */
export function getValueByPath(this: any, obj: any, path: string): any {
  const parts = path.split('.');
  let value = obj;
  for (const part of parts) {
    value = value[part];
    if (value === undefined) break;
  }
  return value;
}