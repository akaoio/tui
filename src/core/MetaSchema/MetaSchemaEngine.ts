/**
 * Meta Schema Engine - The core of everything
 */

import { EventEmitter } from 'events';
import { MetaSchema, ComponentMetaSchema } from './types';
import { makeReactive, createReactiveProxy } from './reactive';
import { processInheritance, processMixins } from './inheritance';
import { callLifecycle } from './lifecycle';
import {
  initializeProps,
  initializeState,
  setupComputed,
  setupWatchers,
  setupMethods
} from './instantiate';

/**
 * Meta Schema Engine - Core engine for schema-driven architecture
 */
export class MetaSchemaEngine extends EventEmitter {
  private schemas: Map<string, MetaSchema> = new Map();
  private instances: Map<string, any> = new Map();
  private reactiveProxies: WeakMap<object, any> = new WeakMap();
  private dependencies: Map<string, Set<string>> = new Map();
  private computedCache: Map<string, any> = new Map();
  private watchers: Map<string, Set<Function>> = new Map();
  
  /**
   * Register a schema
   */
  register(schema: MetaSchema): void {
    this.schemas.set(schema.$id, schema);
    
    // Process extends
    if (schema.$extends) {
      processInheritance(schema, this.schemas);
    }
    
    // Process mixins
    if (schema.$mixins) {
      processMixins(schema, this.schemas);
    }
    
    // Make reactive if needed
    if (schema.$reactive) {
      makeReactive(schema, this);
    }
    
    this.emit('schema:register', schema);
  }
  
  /**
   * Create instance from schema
   */
  create(schemaId: string, props?: Record<string, any>): any {
    const schema = this.schemas.get(schemaId);
    if (!schema) {
      throw new Error(`Schema ${schemaId} not found`);
    }
    
    return this.instantiate(schema, props);
  }
  
  /**
   * Instantiate a schema
   */
  private instantiate(schema: MetaSchema, props?: Record<string, any>): any {
    const instance: any = {};
    
    // Generate unique ID
    instance._id = `${schema.$id}_${Date.now()}_${Math.random()}`;
    
    // Apply lifecycle hook: beforeCreate
    callLifecycle(schema, 'beforeCreate', instance);
    
    // Create reactive state
    if (schema.$type === 'component' || schema.$type === 'state') {
      const componentSchema = schema as ComponentMetaSchema;
      
      // Initialize props
      if (componentSchema.props && props) {
        initializeProps(instance, componentSchema.props, props);
      }
      
      // Initialize state
      if (componentSchema.state) {
        initializeState(instance, componentSchema.state, this);
      }
      
      // Setup computed properties
      if (componentSchema.computed) {
        setupComputed(instance, componentSchema.computed, this);
      }
      
      // Setup watchers
      if (schema.$watch) {
        setupWatchers(instance, schema.$watch, this);
      }
      
      // Setup methods
      if (componentSchema.methods) {
        setupMethods(instance, componentSchema.methods);
      }
    }
    
    // Apply lifecycle hook: created
    callLifecycle(schema, 'created', instance);
    
    // Store instance
    this.instances.set(instance._id, instance);
    
    return instance;
  }
  
  /**
   * Create reactive proxy (exposed for internal use)
   */
  createReactiveProxy(obj: any): any {
    return createReactiveProxy(obj, this);
  }
  
  /**
   * Track dependency for computed properties
   */
  trackDependency(obj: any, prop: string): void {
    // This would be used for computed property tracking
    // Implementation depends on specific requirements
  }
  
  /**
   * Trigger update
   */
  triggerUpdate(obj: any, prop: string, newValue: any, oldValue: any): void {
    this.emit('update', { obj, prop, newValue, oldValue });
  }
  
  /**
   * Invalidate computed properties
   */
  invalidateComputed(obj: any, prop: string): void {
    // Invalidate computed properties that depend on this
    // Clear all computed cache for simplicity
    // A more sophisticated implementation would track dependencies
    this.computedCache.clear();
  }
  
  /**
   * Trigger watchers
   */
  triggerWatchers(obj: any, prop: string, newValue: any, oldValue: any): void {
    // Find instance ID
    let instanceId: string | undefined;
    for (const [id, instance] of this.instances) {
      if (instance === obj || instance.state === obj) {
        instanceId = id;
        break;
      }
    }
    
    if (!instanceId) return;
    
    const key = `${instanceId}.${prop}`;
    const watcherSet = this.watchers.get(key);
    if (watcherSet) {
      watcherSet.forEach((watcher: any) => watcher(newValue, oldValue));
    }
  }
  
  /**
   * Get schema by ID
   */
  getSchema(id: string): MetaSchema | undefined {
    return this.schemas.get(id);
  }
  
  /**
   * Get instance by ID
   */
  getInstance(id: string): any {
    return this.instances.get(id);
  }
  
  /**
   * List all schemas
   */
  listSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }
  
  /**
   * List all instances
   */
  listInstances(): string[] {
    return Array.from(this.instances.keys());
  }
  
  /**
   * Clear all data
   */
  clear(): void {
    this.schemas.clear();
    this.instances.clear();
    this.computedCache.clear();
    this.watchers.clear();
    this.dependencies.clear();
  }
}