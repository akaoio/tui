/**
 * Create a reactive store from schema (private method)
 */

import { Store } from './types';
import { initializeGetters } from './getters';
import { handleMutation } from './mutations';
import { handleAction } from './actions';

export function createStore(this: any): Store {
  const store: Store = {
    state: {},
    getters: {},
    commit: (mutationName: string, payload?: any) => {
      handleMutation(this.store, this.schema, mutationName, payload, this);
    },
    dispatch: async (actionName: string, payload?: any) => {
      return handleAction(this.store, this.schema, actionName, payload, this);
    }
  };

  // Initialize state with default values
  this.initializeState(store);
  
  // Initialize getters
  initializeGetters(store, this.schema);

  return store;
}