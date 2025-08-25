/**
 * Schema-related types for MetaSchema
 */

import { MetaSchema, PrimitiveType, ComplexType, ValidationRules } from './primitiveTypes';
import { ComponentMetaSchema, PropertySchema } from './componentTypes';

/**
 * State schema - reactive state management
 */
export interface StateSchema extends MetaSchema {
  $type: 'state';
  
  properties?: Record<string, PropertySchema>;
  mutations?: Record<string, MutationSchema>;
  actions?: Record<string, ActionSchema>;
  getters?: Record<string, GetterSchema>;
}

/**
 * Data schema - data structures and validation
 */
export interface DataSchema extends MetaSchema {
  $type: 'data';
  
  type: PrimitiveType | ComplexType | string; // Custom types
  properties?: Record<string, PropertySchema>;
  items?: PropertySchema; // For arrays
  required?: string[];
  validation?: ValidationRules;
}

/**
 * Event schema - event definitions
 */
export interface EventSchema extends MetaSchema {
  $type: 'event';
  
  events?: Record<string, EventDefinition>;
  emits?: string[] | Record<string, PropertySchema>;
  bubbles?: boolean;
  cancelable?: boolean;
}

/**
 * Event definition
 */
export interface EventDefinition {
  payload?: PropertySchema;
  handler?: Function | string;
  once?: boolean;
  passive?: boolean;
  capture?: boolean;
}

/**
 * Mutation schema
 */
export interface MutationSchema {
  handler: Function | string;
  payload?: PropertySchema;
}

/**
 * Action schema
 */
export interface ActionSchema {
  handler: Function | string;
  payload?: PropertySchema;
  async?: boolean;
}

/**
 * Getter schema
 */
export interface GetterSchema {
  handler: Function | string;
  cache?: boolean;
}

/**
 * Store schema
 */
export interface StoreSchema extends StateSchema {
  modules?: Record<string, StoreSchema>;
  namespaced?: boolean;
  devtools?: boolean;
}