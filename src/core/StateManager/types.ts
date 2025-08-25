/**
 * Types and interfaces for StateManager
 */

/**
 * State change event
 */
export interface StateChange {
  type: string;
  payload?: any;
  path: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

/**
 * Mutation definition
 */
export interface Mutation<S = any> {
  (state: S, payload?: any): void;
}

/**
 * Action definition
 */
export interface Action<S = any> {
  (context: ActionContext<S>, payload?: any): any;
}

/**
 * Action context
 */
export interface ActionContext<S = any> {
  state: S;
  commit: (type: string, payload?: any) => void;
  dispatch: (type: string, payload?: any) => Promise<any>;
  getters: Record<string, any>;
}

/**
 * Getter definition
 */
export interface Getter<S = any> {
  (state: S, getters: Record<string, any>): any;
}

/**
 * Watcher definition
 */
export interface Watcher {
  path: string | string[];
  handler: (newValue: any, oldValue: any, path: string) => void;
  immediate?: boolean;
  deep?: boolean;
}

/**
 * Store module
 */
export interface StoreModule<S = any> {
  namespaced?: boolean;
  state: S | (() => S);
  mutations?: Record<string, Mutation<S>>;
  actions?: Record<string, Action<S>>;
  getters?: Record<string, Getter<S>>;
  modules?: Record<string, StoreModule>;
}

/**
 * Store options
 */
export interface StoreOptions<S = any> extends StoreModule<S> {
  strict?: boolean;
  plugins?: Array<(store: any) => void>;
}