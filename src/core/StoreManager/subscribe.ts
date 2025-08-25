/**
 * Subscribe to state changes method
 */

export function subscribe(this: any, callback: (event: any) => void): () => void {
  this.on('state-change', callback);
  
  // Return unsubscribe function
  return () => {
    this.off('state-change', callback);
  };
}