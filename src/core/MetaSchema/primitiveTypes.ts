/**
 * Primitive type definitions for MetaSchema
 */

/**
 * Primitive type definitions
 */
export type PrimitiveType = 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'symbol' | 'bigint';
export type ComplexType = 'object' | 'array' | 'function' | 'component' | 'schema' | 'reactive';

/**
 * Base meta schema for EVERYTHING in TUI
 */
export interface MetaSchema {
  $id: string;
  $type: 'meta' | 'component' | 'layout' | 'style' | 'data' | 'event' | 'state' | 'app' | 'service';
  $version: string;
  $extends?: string | string[]; // Inheritance
  $mixins?: string[]; // Composition
  $reactive?: boolean; // Make this schema reactive
  $computed?: Record<string, string | Function>; // Computed properties
  $watch?: Record<string, WatchHandler>; // Watchers
  $lifecycle?: LifecycleHooks;
  $validators?: Record<string, Validator>;
  $transformers?: Record<string, Transformer>;
  [key: string]: any;
}

/**
 * Validation rules
 */
export interface ValidationRules {
  pattern?: RegExp | string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  enum?: any[];
  custom?: Validator;
}

/**
 * Watch handler
 */
export interface WatchHandler {
  handler: Function | string;
  immediate?: boolean;
  deep?: boolean;
}

/**
 * Validator
 */
export type Validator = Function | string | {
  validator: Function | string;
  message?: string;
  trigger?: 'change' | 'blur' | 'submit';
};

/**
 * Transformer
 */
export type Transformer = Function | string | {
  in?: Function | string;
  out?: Function | string;
};

/**
 * Lifecycle hooks
 */
export interface LifecycleHooks {
  beforeCreate?: Function | string;
  created?: Function | string;
  beforeMount?: Function | string;
  mounted?: Function | string;
  beforeUpdate?: Function | string;
  updated?: Function | string;
  beforeUnmount?: Function | string;
  unmounted?: Function | string;
  activated?: Function | string;
  deactivated?: Function | string;
  errorCaptured?: Function | string;
}

/**
 * Reactive value wrapper
 */
export interface ReactiveValue<T> {
  $ref?: string; // Reference to state path
  $computed?: string | Function; // Computed value
  $value?: T; // Static value
}