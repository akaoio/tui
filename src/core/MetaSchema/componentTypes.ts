/**
 * Component-related types for MetaSchema
 */

import { MetaSchema, PrimitiveType, ComplexType, Validator, Transformer, WatchHandler } from './primitiveTypes';
import { StyleSchema, LayoutSchema } from './layoutTypes';

// Forward declarations to avoid circular imports
interface StateSchema extends MetaSchema {
  $type: 'state';
  properties?: Record<string, PropertySchema>;
  mutations?: any;
  actions?: any;
  getters?: any;
}

interface EventSchema extends MetaSchema {
  $type: 'event';
  events?: any;
  emits?: any;
  bubbles?: boolean;
  cancelable?: boolean;
}

/**
 * Component meta schema - defines ANY UI component
 */
export interface ComponentMetaSchema extends MetaSchema {
  $type: 'component';
  
  // Component definition
  name: string;
  type: string; // 'text' | 'button' | 'list' | 'custom' | ...
  
  // Rendering
  render?: RenderSchema;
  template?: string; // Template string with interpolation
  
  // Props & State
  props?: PropsSchema;
  state?: StateSchema;
  
  // Behavior
  methods?: Record<string, Function | string>;
  computed?: Record<string, Function | string>;
  
  // Events
  events?: EventSchema;
  handlers?: Record<string, Function | string>;
  
  // Children & Slots
  children?: ComponentMetaSchema[];
  slots?: Record<string, SlotSchema>;
  
  // Style & Layout
  style?: StyleSchema;
  layout?: LayoutSchema;
  
  // Data binding
  model?: ModelSchema;
  bindings?: BindingSchema[];
}

/**
 * Props schema
 */
export interface PropsSchema {
  [key: string]: PropertySchema | PrimitiveType;
}

/**
 * Property schema
 */
export interface PropertySchema {
  type?: PrimitiveType | ComplexType | string;
  default?: any;
  required?: boolean;
  validator?: Validator;
  transformer?: Transformer;
  reactive?: boolean;
  computed?: Function | string;
  watch?: WatchHandler;
}

/**
 * Slot schema
 */
export interface SlotSchema {
  name?: string;
  props?: PropsSchema;
  fallback?: ComponentMetaSchema;
}

/**
 * Render schema
 */
export interface RenderSchema {
  type?: 'template' | 'function' | 'jsx';
  template?: string;
  render?: Function | string;
  staticRenderFns?: Array<Function | string>;
}


/**
 * Model schema for two-way binding
 */
export interface ModelSchema {
  prop?: string;
  event?: string;
  path?: string; // State path
}

/**
 * Binding schema
 */
export interface BindingSchema {
  source: string; // Path to source data
  target: string; // Path to target property
  transform?: Transformer;
  direction?: 'in' | 'out' | 'both';
}