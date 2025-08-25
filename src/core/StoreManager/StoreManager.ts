/**
 * StoreManager - Container class
 * Centralized state management for schema-driven apps
 */

import { EventEmitter } from 'events';
import { Store, StoreSchema } from './types';
import { constructor } from './constructor';
import { createStore } from './createStore';
import { initializeState } from './initializeState';
import { registerGlobalStore } from './registerGlobalStore';
import { getStore } from './getStore';
import { getState } from './getState';
import { get } from './get';
import { set } from './set';
import { subscribe } from './subscribe';
import { destroy } from './destroy';

/**
 * Manages reactive store for schema-driven applications
 */
export class StoreManager extends EventEmitter {
  private store!: Store;
  private schema!: StoreSchema;

  constructor(schema: StoreSchema) {
    super();
    constructor.call(this, schema);
  }

  /**
   * Create a reactive store from schema
   */
  private createStore(): Store {
    return createStore.call(this);
  }

  /**
   * Initialize state with default values from schema
   */
  private initializeState(store: Store): void {
    return initializeState.call(this, store);
  }

  /**
   * Register store globally for backward compatibility
   */
  private registerGlobalStore(): void {
    return registerGlobalStore.call(this);
  }

  /**
   * Get the store instance
   */
  getStore(): Store {
    return getStore.call(this);
  }

  /**
   * Get current state
   */
  getState(): Record<string, any> {
    return getState.call(this);
  }

  /**
   * Get a specific state value
   */
  get(path: string): any {
    return get.call(this, path);
  }

  /**
   * Set a state value directly
   */
  set(path: string, value: any): void {
    return set.call(this, path, value);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (event: any) => void): () => void {
    return subscribe.call(this, callback);
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    return destroy.call(this);
  }
}