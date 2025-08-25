/**
 * Find component by ID method
 */

export function findById(this: any, id: string): any {
  if (this.id === id) return this
  for (const child of this.children) {
    const found = child.findById(id)
    if (found) return found
  }
  return undefined
}