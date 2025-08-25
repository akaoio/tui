/**
 * Mutation handling methods
 */

import { Store, StoreSchema } from './types';
import { EventEmitter } from 'events';

/**
 * Handle mutation execution
 */
export function handleMutation(this: any, store: Store,
  schema: StoreSchema,
  mutationName: string,
  payload: any,
  emitter: EventEmitter): void {
  const mutation = schema.mutations?.[mutationName];
  if (!mutation) {
    console.warn(`Mutation not found: ${mutationName}`);
    return;
  }

  try {
    const handler = mutation.handler;
    if (typeof handler === 'function') {
      handler(store.state, payload);
    } else if (typeof handler === 'string' && handler.startsWith('function')) {
      executeMutationFromString(store, handler, payload);
    }

    // Emit state change event
    emitter.emit('state-change', {
      mutation: mutationName,
      payload,
      state: store.state
    });
  } catch (error) {
    console.error(`Mutation error (${mutationName}):`, error);
  }
}

/**
 * Execute mutation from string definition
 */
export function executeMutationFromString(this: any, store: Store,
  handler: string,
  payload?: any): void {
  const match = handler.match(/function\s*\(([^)]*)\)\s*\{([\s\S]*)\}$/);
  if (!match) return;

  const params = match[1].split(',').map((p: string) => p.trim());
  const funcBody = match[2];

  if (params.length === 1) {
    // Single parameter (state)
    const func = new Function('state', funcBody);
    func.call({ state: store.state, getters: store.getters }, store.state);
  } else if (params.length === 2) {
    // Two parameters (state, payload)
    const func = new Function('state', params[1], funcBody);
    func.call({ state: store.state, getters: store.getters }, store.state, payload);
  }
}