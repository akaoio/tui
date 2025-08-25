/**
 * Destroy and cleanup method
 */

export function destroy(this: any): void {
  this.removeAllListeners();
  delete (global as any).$store;
}