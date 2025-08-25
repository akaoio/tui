/**
 * Reactive system for MetaSchema
 */

/**
 * Make object reactive
 */
export function makeReactive(this: any, obj: any,
  engine: any): void {
  const proxy = createReactiveProxy(obj, engine);
  engine.reactiveProxies.set(obj, proxy);
}

/**
 * Create reactive proxy
 */
export function createReactiveProxy(this: any, obj: any,
  engine: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  // Check if already reactive
  if (engine.reactiveProxies.has(obj)) {
    return engine.reactiveProxies.get(obj);
  }
  
  const proxy = new Proxy(obj, {
    get(target, prop, receiver) {
      // Track dependency
      engine.trackDependency(target, String(prop));
      
      const value = Reflect.get(target, prop, receiver);
      
      // Make nested objects reactive
      if (typeof value === 'object' && value !== null) {
        return createReactiveProxy(value, engine);
      }
      
      return value;
    },
    
    set(target, prop, value, receiver) {
      const oldValue = target[prop];
      const result = Reflect.set(target, prop, value, receiver);
      
      if (oldValue !== value) {
        // Trigger update
        engine.triggerUpdate(target, String(prop), value, oldValue);
        
        // Invalidate computed properties
        engine.invalidateComputed(target, String(prop));
        
        // Trigger watchers
        engine.triggerWatchers(target, String(prop), value, oldValue);
      }
      
      return result;
    },
    
    deleteProperty(target, prop) {
      const oldValue = target[prop];
      const result = Reflect.deleteProperty(target, prop);
      
      if (result) {
        engine.triggerUpdate(target, String(prop), undefined, oldValue);
        engine.invalidateComputed(target, String(prop));
        engine.triggerWatchers(target, String(prop), undefined, oldValue);
      }
      
      return result;
    }
  });
  
  engine.reactiveProxies.set(obj, proxy);
  return proxy;
}