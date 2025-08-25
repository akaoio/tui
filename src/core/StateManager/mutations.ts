/**
 * Mutation management methods
 */

import { Mutation } from './types';

/**
 * Register a mutation
 */
export function registerMutation<S>(
  mutations: Map<string, Mutation<S>>,
  name: string,
  mutation: Mutation<S>
): void {
  mutations.set(name, mutation);
}

/**
 * Commit a mutation
 */
export function commitMutation<S>(
  mutations: Map<string, Mutation<S>>,
  state: S,
  type: string,
  payload: any,
  subscribers: Array<(mutation: any, state: S) => void>,
  committing: { value: boolean },
  store?: any
): void {
  const mutation = mutations.get(type);
  
  if (!mutation) {
    throw new Error(`[StateManager] Unknown mutation type: ${type}`);
  }
  
  // Set committing flag
  committing.value = true;
  
  // Execute mutation
  mutation(state, payload);
  
  // Record in history if store is provided
  if (store && store._history) {
    const historyEntry = {
      type,
      payload,
      path: '',
      oldValue: undefined,
      newValue: undefined,
      timestamp: new Date()
    };
    store._history.push(historyEntry);
    
    // Limit history size
    if (store._history.length > store._maxHistory) {
      store._history.shift();
    }
  }
  
  // Reset committing flag
  committing.value = false;
  
  // Notify subscribers
  const mutationInfo = { type, payload };
  subscribers.forEach((fn: any) => fn(mutationInfo, state));
}