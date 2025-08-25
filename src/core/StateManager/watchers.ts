/**
 * Watcher management methods
 */

import { Watcher } from './types';

/**
 * Register a watcher
 */
export function registerWatcher(this: any, watchers: Map<string, Set<Watcher>>,
  watcher: Watcher): () => void {
  const paths = Array.isArray(watcher.path) ? watcher.path : [watcher.path];
  
  paths.forEach((path: any) => {
    if (!watchers.has(path)) {
      watchers.set(path, new Set());
    }
    watchers.get(path)!.add(watcher);
  });
  
  // Return unwatch function
  return () => {
    paths.forEach((path: any) => {
      const pathWatchers = watchers.get(path);
      if (pathWatchers) {
        pathWatchers.delete(watcher);
        if (pathWatchers.size === 0) {
          watchers.delete(path);
        }
      }
    });
  };
}

/**
 * Trigger watchers for a path
 */
export function triggerWatchers(this: any, watchers: Map<string, Set<Watcher>>,
  path: string,
  newValue: any,
  oldValue: any): void {
  // Global watchers (watch all changes)
  const globalWatchers = watchers.get('*');
  if (globalWatchers) {
    globalWatchers.forEach((watcher: any) => {
      watcher.handler(newValue, oldValue, path);
    });
  }
  
  // Exact path watchers
  const exactWatchers = watchers.get(path);
  if (exactWatchers) {
    exactWatchers.forEach((watcher: any) => {
      watcher.handler(newValue, oldValue, path);
    });
  }
  
  // Deep watchers (parent paths)
  const parts = path.split('.');
  for (let i = parts.length - 1; i > 0; i--) {
    const parentPath = parts.slice(0, i).join('.');
    const parentWatchers = watchers.get(parentPath);
    
    if (parentWatchers) {
      parentWatchers.forEach((watcher: any) => {
        if (watcher.deep) {
          watcher.handler(newValue, oldValue, path);
        }
      });
    }
  }
}

/**
 * Get value by path from object
 */
export function getStateValueByPath(this: any, obj: any, path: string): any {
  const parts = path.split('.');
  let value = obj;
  
  for (const part of parts) {
    if (value === null || value === undefined) return undefined;
    value = value[part];
  }
  
  return value;
}

/**
 * Set value by path in object
 */
export function setValueByPath(this: any, obj: any, path: string, value: any): void {
  const parts = path.split('.');
  const lastPart = parts.pop()!;
  let target = obj;
  
  for (const part of parts) {
    if (!(part in target)) {
      target[part] = {};
    }
    target = target[part];
  }
  
  target[lastPart] = value;
}