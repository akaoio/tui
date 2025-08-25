/**
 * Add child component method
 */

export function addChild(this: any, child: any): void {
  child.parent = this
  this.children.push(child)
}