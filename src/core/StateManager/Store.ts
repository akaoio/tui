/**
 * Reactive State Store - Container class
 */

import { EventEmitter } from 'events';
import {
  StoreOptions,
  StateChange,
  Mutation,
  Action,
  Getter,
  Watcher,
  StoreModule,
  ActionContext
} from './types';
import { constructor } from './constructor';
import { state } from './state';
import { gettersGet } from './gettersGet';
import { trackDependency } from './trackDependency';
import { trackChange } from './trackChange';
import { triggerWatchers } from './triggerWatchers';
import { commit } from './commit';
import { dispatch } from './dispatch';
import { watch } from './watch';
import { registerModule } from './registerModule';
import { subscribe } from './subscribe';
import { subscribeAction } from './subscribeAction';
import { replaceState } from './replaceState';
import { getHistory } from './getHistory';
import { clearHistory } from './clearHistory';
import { timeTravel } from './timeTravel';
import { snapshot } from './snapshot';
import { restore } from './restore';

/**
 * Reactive State Store
 */
export class Store<S = any> extends EventEmitter {
  private _state!: S;
  private _mutations: Map<string, Mutation> = new Map();
  private _actions: Map<string, Action> = new Map();
  private _getters: Map<string, Getter> = new Map();
  private _getterCache: Map<string, any> = new Map();
  private _watchers: Map<string, Set<Watcher>> = new Map();
  private _modules: Map<string, Store<any>> = new Map();
  private _subscribers: Array<(mutation: any, state: S) => void> = [];
  private _actionSubscribers: Array<(action: any, state: S) => void> = [];
  private _history: StateChange[] = [];
  private _maxHistory = 100;
  private _strict!: boolean;
  private _committing = false;
  
  constructor(options: StoreOptions<S>) {
    super();
    constructor.call(this as any, options as any);
  }
  
  /**
   * Get current state
   */
  get state(): S {
    return state.call(this) as S;
  }
  
  /**
   * Get all getters
   */
  get getters(): Record<string, any> {
    return gettersGet.call(this);
  }
  
  /**
   * Get all actions
   */
  get actions(): Record<string, Action> {
    const actionsObj: Record<string, Action> = {};
    this._actions.forEach((action, name) => {
      actionsObj[name] = action;
    });
    return actionsObj;
  }
  
  /**
   * Track dependency for computed properties
   */
  trackDependency(path: string): void {
    return trackDependency.call(this, path);
  }
  
  /**
   * Track state change
   */
  trackChange(path: string, oldValue: any, newValue: any): void {
    return trackChange.call(this, path, oldValue, newValue);
  }
  
  /**
   * Trigger watchers
   */
  triggerWatchers(path: string, newValue: any, oldValue: any): void {
    return triggerWatchers.call(this, path, newValue, oldValue);
  }
  
  /**
   * Commit a mutation
   */
  commit(type: string, payload?: any): void {
    return commit.call(this, type, payload);
  }
  
  /**
   * Dispatch an action
   */
  async dispatch(type: string, payload?: any): Promise<any> {
    return dispatch.call(this, type, payload);
  }
  
  /**
   * Watch a path for changes
   */
  watch(watcher: Watcher): () => void;
  watch(getter: (state: S) => any, handler: (newVal: any, oldVal?: any) => void, options?: { immediate?: boolean; deep?: boolean }): () => void;
  watch(watcherOrGetter: Watcher | ((state: S) => any), handler?: (newVal: any, oldVal?: any) => void, options?: { immediate?: boolean; deep?: boolean }): () => void {
    return watch.call(this, watcherOrGetter as any, handler as any, options as any);
  }
  
  /**
   * Register a module
   */
  registerModule(name: string, module: StoreModule): void {
    return registerModule.call(this, name, module);
  }
  
  /**
   * Subscribe to mutations
   */
  subscribe(fn: (mutation: any, state: S) => void): () => void {
    return subscribe.call(this, fn as any);
  }
  
  /**
   * Subscribe to actions
   */
  subscribeAction(fn: (action: any, state: S) => void): () => void {
    return subscribeAction.call(this, fn as any);
  }
  
  /**
   * Replace state
   */
  replaceState(state: S): void {
    return replaceState.call(this, state);
  }
  
  /**
   * Get state history
   */
  getHistory(): StateChange[] {
    return getHistory.call(this);
  }
  
  /**
   * Clear history
   */
  clearHistory(): void {
    return clearHistory.call(this);
  }
  
  /**
   * Time travel to specific state
   */
  timeTravel(index: number): void {
    return timeTravel.call(this, index);
  }
  
  /**
   * Create a snapshot of current state
   */
  snapshot(): S {
    return snapshot.call(this) as S;
  }
  
  /**
   * Restore from snapshot
   */
  restore(snapshot: S): void {
    return restore.call(this, snapshot);
  }
}