/**
 * Action management methods
 */

import { Action, ActionContext } from './types';

/**
 * Register an action
 */
export function registerAction<S>(
  actions: Map<string, Action<S>>,
  name: string,
  action: Action<S>
): void {
  actions.set(name, action);
}

/**
 * Dispatch an action
 */
export async function dispatchAction<S>(
  actions: Map<string, Action<S>>,
  context: ActionContext<S>,
  type: string,
  payload: any,
  subscribers: Array<(action: any, state: S) => void>
): Promise<any> {
  const action = actions.get(type);
  
  if (!action) {
    console.error(`[StateManager] Unknown action type: ${type}`);
    return;
  }
  
  // Notify action subscribers before
  const actionInfo = { type, payload };
  subscribers.forEach((fn: any) => fn(actionInfo, context.state));
  
  // Execute action
  const result = await action(context, payload);
  
  return result;
}