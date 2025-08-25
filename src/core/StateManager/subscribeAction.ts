/**
 * Subscribe to actions method
 */

export function subscribeAction<S>(this: any, fn: (action: any, state: S) => void): () => void {
  this._actionSubscribers.push(fn);
  
  return () => {
    const index = this._actionSubscribers.indexOf(fn);
    if (index > -1) {
      this._actionSubscribers.splice(index, 1);
    }
  };
}