/**
 * Remove child component method
 */

export function removeChild(this: any, child: any): void {
  const index = this.children.indexOf(child)
  if (index > -1) {
    this.children.splice(index, 1)
    child.parent = undefined
  }
}