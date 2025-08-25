/**
 * Application and service types for MetaSchema
 */

import { MetaSchema } from './primitiveTypes';
import { ComponentMetaSchema, PropertySchema } from './componentTypes';
import { StoreSchema } from './schemaTypes';

/**
 * Application meta schema - defines entire TUI app
 */
export interface AppMetaSchema extends MetaSchema {
  $type: 'app';
  
  // App metadata
  name: string;
  version: string;
  description?: string;
  
  // Global configuration
  config?: {
    theme?: string;
    locale?: string;
    timezone?: string;
    plugins?: string[];
  };
  
  // Screens/Routes
  screens?: Record<string, ScreenSchema>;
  router?: RouterSchema;
  
  // Global state
  store?: StoreSchema;
  
  // Global components
  components?: Record<string, ComponentMetaSchema>;
  
  // Services
  services?: Record<string, ServiceSchema>;
  
  // Entry point
  main?: ComponentMetaSchema | string;
}

/**
 * Screen schema
 */
export interface ScreenSchema extends ComponentMetaSchema {
  route?: string;
  params?: Record<string, PropertySchema>;
  guards?: {
    beforeEnter?: Function | string;
    beforeLeave?: Function | string;
  };
}

/**
 * Router schema
 */
export interface RouterSchema {
  mode?: 'hash' | 'history' | 'memory';
  base?: string;
  routes?: RouteSchema[];
  fallback?: string;
}

/**
 * Route schema
 */
export interface RouteSchema {
  path: string;
  name?: string;
  component?: ComponentMetaSchema | string;
  redirect?: string;
  children?: RouteSchema[];
  meta?: Record<string, any>;
}

/**
 * Service schema
 */
export interface ServiceSchema extends MetaSchema {
  $type: 'service';
  
  singleton?: boolean;
  factory?: Function | string;
  dependencies?: string[];
  methods?: Record<string, Function | string>;
  lifecycle?: {
    init?: Function | string;
    destroy?: Function | string;
  };
}