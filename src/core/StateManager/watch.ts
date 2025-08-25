/**
 * Watch a path for changes method
 */

import { Watcher } from './types';
import { registerWatcher, getStateValueByPath } from './watchers';

export function watch(
  this: any, 
  watcherOrGetter: Watcher | ((state: any) => any), 
  handler?: (newVal: any, oldVal?: any) => void, 
  options?: { immediate?: boolean; deep?: boolean }
): () => void {
  let watcher: Watcher;
  
  // Check if first argument is a function (getter-based API)
  if (typeof watcherOrGetter === 'function' && handler) {
    const getter = watcherOrGetter;
    
    // Create a Watcher object from getter, handler, and options
    watcher = {
      path: '__computed__', // Special path for computed watchers
      handler: (newVal: any, oldVal: any) => {
        handler(newVal, oldVal);
      },
      immediate: options?.immediate,
      deep: options?.deep
    };
    
    // Set up computed watcher
    let currentValue = getter(this._state);
    
    // Handle immediate execution
    if (watcher.immediate) {
      handler(currentValue, undefined);
    }
    
    // Set up a special watcher that tracks the computed value
    const computedWatcher: Watcher = {
      path: '*', // Watch all state changes
      handler: () => {
        const newValue = getter(this._state);
        if (newValue !== currentValue) {
          const oldValue = currentValue;
          currentValue = newValue;
          handler(newValue, oldValue);
        }
      },
      deep: watcher.deep
    };
    
    return registerWatcher(this._watchers, computedWatcher);
  } else {
    // Original Watcher object API
    watcher = watcherOrGetter as Watcher;
    
    // Run immediately if requested
    if (watcher.immediate) {
      const paths = Array.isArray(watcher.path) ? watcher.path : [watcher.path];
      paths.forEach((path: any) => {
        const value = getStateValueByPath(this._state, path);
        watcher.handler(value, undefined, path);
      });
    }
    
    return registerWatcher(this._watchers, watcher);
  }
}