/**
 * Store initialization methods
 */

import { StoreManager, StoreSchema } from '../StoreManager/index';
import { SchemaRendererState } from './types';

/**
 * Initialize store - supports both old and new format
 */
export function initializeStore(this: any, state: SchemaRendererState): void {
  if (!state.schema.store) return;
  
  // Check if it's already a StoreSchema format
  if (state.schema.store.properties || state.schema.store.getters || state.schema.store.mutations) {
    state.storeManager = new StoreManager(state.schema.store);
  } else {
    // Legacy format - create wrapper
    createReactiveStore(state, state.schema.store);
  }
}

/**
 * Create legacy store for backward compatibility
 */
export function createReactiveStore(this: any, state: SchemaRendererState, storeSchema: any): void {
  // Convert legacy format to new StoreSchema format
  const convertedSchema: StoreSchema = {
    $id: storeSchema.$id || 'store',
    properties: storeSchema.properties || {},
    getters: storeSchema.getters || {},
    mutations: storeSchema.mutations || {},
    actions: storeSchema.actions || {}
  };
  
  state.storeManager = new StoreManager(convertedSchema);
  
  // Make globally accessible for backward compatibility
  (global as any).$store = state.storeManager.getStore();
}

/**
 * Create a legacy store object for old components
 */
export function createLegacyStore(this: any, state: SchemaRendererState): any {
  if (state.storeManager) {
    return state.storeManager.getStore();
  }
  
  // Minimal store for compatibility
  return {
    state: {},
    getters: {},
    commit: () => {},
    dispatch: () => {}
  };
}