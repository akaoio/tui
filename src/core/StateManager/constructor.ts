/**
 * Store constructor method
 */

import { StoreOptions } from './types';
import { makeReactive } from './reactive';
import { registerWatcher } from './watchers';
import { registerMutation } from './mutations';
import { registerAction } from './actions';
import { registerGetter } from './getters';

export function constructor<S>(this: any, options: StoreOptions<S>) {
  // Initialize state
  this._state = typeof options.state === 'function' 
    ? (options.state as () => S)() 
    : JSON.parse(JSON.stringify(options.state));
  
  this._strict = options.strict || false;
  
  // Make state reactive
  this._state = makeReactive(this._state, '', this);
  
  // Register mutations
  if (options.mutations) {
    Object.entries(options.mutations).forEach(([name, mutation]) => {
      registerMutation(this._mutations, name, mutation);
    });
  }
  
  // Register actions
  if (options.actions) {
    Object.entries(options.actions).forEach(([name, action]) => {
      registerAction(this._actions, name, action);
    });
  }
  
  // Register getters
  if (options.getters) {
    Object.entries(options.getters).forEach(([name, getter]) => {
      registerGetter(this._getters, this._getterCache, name, getter);
    });
  }
  
  // Register modules
  if (options.modules) {
    Object.entries(options.modules).forEach(([name, module]) => {
      this.registerModule(name, module);
    });
  }
  
  // Apply plugins
  if (options.plugins) {
    options.plugins.forEach((plugin: any) => plugin(this));
  }
}