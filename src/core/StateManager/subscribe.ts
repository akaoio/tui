/**
 * Subscribe to mutations method
 */

export function subscribe<S>(this: any, fn: (mutation: any, state: S) => void): () => void {
  this._subscribers.push(fn);
  
  return () => {
    const index = this._subscribers.indexOf(fn);
    if (index > -1) {
      this._subscribers.splice(index, 1);
    }
  };
}