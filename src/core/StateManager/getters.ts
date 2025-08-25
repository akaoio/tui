/**
 * Getter management methods
 */

import { Getter } from './types';

/**
 * Register a getter
 */
export function registerGetter<S>(
  getters: Map<string, Getter<S>>,
  getterCache: Map<string, any>,
  name: string,
  getter: Getter<S>
): void {
  getters.set(name, getter);
  getterCache.delete(name);
}

/**
 * Compute all getters
 */
export function computeGetters<S>(
  getters: Map<string, Getter<S>>,
  getterCache: Map<string, any>,
  state: S
): Record<string, any> {
  const result: Record<string, any> = {};
  
  getters.forEach((getter, name) => {
    // Use cached value if available
    if (getterCache.has(name)) {
      result[name] = getterCache.get(name);
    } else {
      const value = getter(state, result);
      getterCache.set(name, value);
      result[name] = value;
    }
  });
  
  return result;
}