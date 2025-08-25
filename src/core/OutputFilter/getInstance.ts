/**
 * Get singleton instance method
 */

export function getInstance(this: any): any {
  if (!this.constructor.instance) {
    this.constructor.instance = new this.constructor()
  }
  return this.constructor.instance
}