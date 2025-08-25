/**
 * Get all focusable components in tree method
 */

export function getFocusableComponents(this: any): any[] {
  const focusable: any[] = []
  if (this.focusable) focusable.push(this)
  for (const child of this.children) {
    focusable.push(...child.getFocusableComponents())
  }
  return focusable
}