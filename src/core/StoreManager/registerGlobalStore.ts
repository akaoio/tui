/**
 * Register store globally for backward compatibility (private method)
 */

export function registerGlobalStore(this: any): void {
  (global as any).$store = this.store;
}