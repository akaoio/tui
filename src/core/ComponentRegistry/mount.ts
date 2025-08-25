/**
 * ComponentRegistry mount method
 */

import { MountRegion } from './types';

export function mount(this: any, id: string, region?: MountRegion): boolean {
  const ref = this.components && this.components.get(id);
  
  if (ref) {
    ref.metadata.mounted = true;
    if (region) {
      ref.metadata.region = region;
    }
  }
  
  if (this.mountedComponents && this.mountedComponents.add) {
    this.mountedComponents.add(id);
  }
  
  this.emit && this.emit('mount', { id, component: ref?.component, region });
  
  return true;
}