/**
 * Types and interfaces for StoreManager
 */

export interface StoreSchema {
  $id?: string;
  properties?: Record<string, any>;
  getters?: Record<string, any>;
  mutations?: Record<string, any>;
  actions?: Record<string, any>;
}

export interface Store {
  state: Record<string, any>;
  getters: Record<string, any>;
  commit: (mutationName: string, payload?: any) => void;
  dispatch: (actionName: string, payload?: any) => Promise<any>;
}

export interface StateChangeEvent {
  mutation?: string;
  action?: string;
  path?: string;
  payload?: any;
  value?: any;
  state: Record<string, any>;
}

export interface ActionContext {
  state: Record<string, any>;
  getters: Record<string, any>;
  commit: (mutationName: string, payload?: any) => void;
  dispatch: (actionName: string, payload?: any) => Promise<any>;
}