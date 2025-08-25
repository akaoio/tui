/**
 * Getter initialization and execution
 */

import { Store, StoreSchema } from './types';

/**
 * Initialize reactive getters
 */
export function initializeGetters(this: any, store: Store, schema: StoreSchema): void {
  if (!schema.getters) return;

  for (const [name, getter] of Object.entries(schema.getters)) {
    const getterDef = getter as any;
    Object.defineProperty(store.getters, name, {
      get: () => {
        try {
          return executeGetter(store, getterDef.handler);
        } catch (error) {
          console.error(`Getter error (${name}):`, error);
          return undefined;
        }
      },
      enumerable: true
    });
  }
}

/**
 * Execute a getter function
 */
function executeGetter(store: Store, handler: string | Function): any {
  if (typeof handler === 'function') {
    return handler.call({ state: store.state, getters: store.getters });
  }

  if (typeof handler === 'string' && handler.startsWith('function')) {
    const match = handler.match(/function\s*\([^)]*\)\s*\{([\s\S]*)\}$/);
    if (match) {
      const funcBody = match[1];
      const func = new Function(funcBody);
      return func.call({ state: store.state, getters: store.getters });
    }
  }

  return undefined;
}