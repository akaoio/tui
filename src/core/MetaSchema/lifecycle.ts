/**
 * Lifecycle management for MetaSchema
 */

import { MetaSchema, LifecycleHooks } from './types';

/**
 * Call lifecycle hook
 */
export function callLifecycle(this: any, schema: MetaSchema,
  hook: keyof LifecycleHooks,
  instance: any): void {
  if (schema.$lifecycle && schema.$lifecycle[hook]) {
    const handler = schema.$lifecycle[hook];
    if (typeof handler === 'function') {
      handler.call(instance);
    } else if (typeof handler === 'string') {
      // Execute string as function
      new Function(handler).call(instance);
    }
  }
}

/**
 * Setup all lifecycle hooks
 */
export function setupLifecycleHooks(this: any, schema: MetaSchema,
  instance: any): void {
  if (!schema.$lifecycle) return;
  
  const hooks: (keyof LifecycleHooks)[] = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeUnmount',
    'unmounted',
    'activated',
    'deactivated',
    'errorCaptured'
  ];
  
  for (const hook of hooks) {
    if (schema.$lifecycle[hook]) {
      // Store hook for later execution
      instance[`_${hook}`] = schema.$lifecycle[hook];
    }
  }
}