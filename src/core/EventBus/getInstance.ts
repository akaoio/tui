/**
 * Get singleton instance method
 */

export function getInstance(this: any): any {
  if (!this.instance) {
    this.instance = new this();
  }
  return this.instance;
}