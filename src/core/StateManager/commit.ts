/**
 * Commit a mutation method
 */

import { commitMutation } from './mutations';

export function commit(this: any, type: string, payload?: any): void {
  const committing = { value: this._committing };
  commitMutation(
    this._mutations,
    this._state,
    type,
    payload,
    this._subscribers,
    committing,
    this
  );
  this._committing = committing.value;
}