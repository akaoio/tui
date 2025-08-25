/**
 * Restore from snapshot method
 */

export function restore<S>(this: any, snapshot: S): void {
  this.replaceState(snapshot);
}