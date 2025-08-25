/**
 * MetaSchema module exports
 */

export { MetaSchemaEngine } from './MetaSchemaEngine';

// Export all types
export {
  // Base types
  PrimitiveType,
  ComplexType,
  MetaSchema,
  ComponentMetaSchema,
  AppMetaSchema,
  StyleSchema,
  LayoutSchema,
  StateSchema,
  DataSchema,
  EventSchema,
  
  // Property and model types
  PropertySchema,
  ReactiveValue,
  ModelSchema,
  BindingSchema,
  
  // Event and validation types
  EventDefinition,
  ValidationRules,
  WatchHandler,
  Validator,
  Transformer,
  LifecycleHooks,
  
  // Additional schema types
  ScreenSchema,
  RouterSchema,
  RouteSchema,
  ServiceSchema,
  StoreSchema,
  PropsSchema,
  SlotSchema,
  RenderSchema,
  
  // Style-related types
  BorderSchema,
  TransitionSchema,
  AnimationSchema,
  
  // State management types
  MutationSchema,
  ActionSchema,
  GetterSchema
} from './types';

// Export utility functions if needed
export { makeReactive, createReactiveProxy } from './reactive';
export { processInheritance, processMixins, deepMerge } from './inheritance';
export { callLifecycle, setupLifecycleHooks } from './lifecycle';
export {
  initializeProps,
  initializeState,
  setupComputed,
  setupWatchers,
  setupMethods,
  getValueByPath
} from './instantiate';