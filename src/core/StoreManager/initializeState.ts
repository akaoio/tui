/**
 * Initialize state with default values from schema (private method)
 */

import { Store } from './types';

export function initializeState(this: any, store: Store): void {
  if (!this.schema.properties) return;

  for (const [key, prop] of Object.entries(this.schema.properties)) {
    const propDef = prop as any;
    if (propDef.default !== undefined) {
      store.state[key] = propDef.default;
    }
  }
}