/**
 * Reactive state management methods
 */

import { StateChange } from './types';

/**
 * Make an object reactive with proxy
 */
export function makeReactive(this: any, obj: any,
  path: string,
  store: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  return new Proxy(obj, {
    get(target, property) {
      const value = target[property];
      const fullPath = path ? `${path}.${String(property)}` : String(property);
      
      // Track dependency for computed properties
      store.trackDependency(fullPath);
      
      if (typeof value === 'object' && value !== null) {
        return makeReactive(value, fullPath, store);
      }
      
      return value;
    },
    
    set(target, property, value) {
      const fullPath = path ? `${path}.${String(property)}` : String(property);
      const oldValue = target[property];
      
      // Check strict mode
      if (store._strict && !store._committing) {
        return false;
      }
      
      // Set value
      target[property] = value;
      
      // Track change
      store.trackChange(fullPath, oldValue, value);
      
      // Trigger watchers
      store.triggerWatchers(fullPath, value, oldValue);
      
      // Invalidate getter cache
      store._getterCache.clear();
      
      // Emit change event
      store.emit('change', { path: fullPath, oldValue, newValue: value });
      
      return true;
    },
    
    deleteProperty(target, property) {
      const fullPath = path ? `${path}.${String(property)}` : String(property);
      const oldValue = target[property];
      
      if (store._strict && !store._committing) {
        return false;
      }
      
      delete target[property];
      
      store.trackChange(fullPath, oldValue, undefined);
      store.triggerWatchers(fullPath, undefined, oldValue);
      store._getterCache.clear();
      store.emit('change', { path: fullPath, oldValue, newValue: undefined });
      
      return true;
    }
  });
}

/**
 * Track state change
 */
export function trackChange(this: any, history: StateChange[],
  maxHistory: number,
  path: string,
  oldValue: any,
  newValue: any): void {
  const change: StateChange = {
    type: 'state_change',
    path,
    oldValue,
    newValue,
    timestamp: new Date()
  };
  
  history.push(change);
  
  // Limit history size
  if (history.length > maxHistory) {
    history.shift();
  }
}