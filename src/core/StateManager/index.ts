/**
 * StateManager module exports
 */

export { Store } from './Store';
export {
  StateChange,
  Mutation,
  Action,
  ActionContext,
  Getter,
  Watcher,
  StoreModule,
  StoreOptions
} from './types';

// Export utility functions for external use if needed
export {
  getStateValueByPath,
  setValueByPath
} from './watchers';