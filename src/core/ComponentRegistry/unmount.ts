/**
 * ComponentRegistry unmount method
 */

export function unmount(this: any, id: string): boolean {
  const ref = this.components.get(id);
  if (!ref) return false;
  
  ref.metadata.mounted = false;
  this.mountedComponents.delete(id);
  
  this.emit('unmount', { id, component: ref.component });
  
  return true;
}