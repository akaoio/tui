/**
 * Register a module method
 */

import { StoreModule } from './types';

export function registerModule(this: any, name: string, module: StoreModule): void {
  // For now, skip recursive module creation to avoid TypeScript issues
  // This would need a proper implementation with lazy initialization
  
  // Just merge the state for now
  if (module.state) {
    (this._state as any)[name] = typeof module.state === 'function' 
      ? (module.state as () => any)() 
      : module.state;
  }
}