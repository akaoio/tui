/**
 * Dispatch an action method
 */

import { ActionContext } from './types';
import { dispatchAction } from './actions';

export async function dispatch<S>(this: any, type: string, payload?: any): Promise<any> {
  const context: ActionContext<S> = {
    state: this._state,
    commit: this.commit.bind(this),
    dispatch: this.dispatch.bind(this),
    getters: this.getters
  };
  
  return dispatchAction(
    this._actions,
    context,
    type,
    payload,
    this._actionSubscribers
  );
}