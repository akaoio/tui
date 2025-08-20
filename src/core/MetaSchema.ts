/**
 * Meta-Schema System - Complete TUI definition from lowest level
 * Everything is reactive and schema-driven
 */

import { EventEmitter } from 'events'

/**
 * Primitive type definitions
 */
export type PrimitiveType = 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'symbol' | 'bigint'
export type ComplexType = 'object' | 'array' | 'function' | 'component' | 'schema' | 'reactive'

/**
 * Base meta schema for EVERYTHING in TUI
 */
export interface MetaSchema {
    $id: string
    $type: 'meta' | 'component' | 'layout' | 'style' | 'data' | 'event' | 'state' | 'app' | 'service'
    $version: string
    $extends?: string | string[] // Inheritance
    $mixins?: string[] // Composition
    $reactive?: boolean // Make this schema reactive
    $computed?: Record<string, string | Function> // Computed properties
    $watch?: Record<string, WatchHandler> // Watchers
    $lifecycle?: LifecycleHooks
    $validators?: Record<string, Validator>
    $transformers?: Record<string, Transformer>
    [key: string]: any
}

/**
 * Component meta schema - defines ANY UI component
 */
export interface ComponentMetaSchema extends MetaSchema {
    $type: 'component'
    
    // Component definition
    name: string
    type: string // 'text' | 'button' | 'list' | 'custom' | ...
    
    // Rendering
    render?: RenderSchema
    template?: string // Template string with interpolation
    
    // Props & State
    props?: PropsSchema
    state?: StateSchema
    
    // Behavior
    methods?: Record<string, Function | string>
    computed?: Record<string, Function | string>
    
    // Events
    events?: EventSchema
    handlers?: Record<string, Function | string>
    
    // Children & Slots
    children?: ComponentMetaSchema[]
    slots?: Record<string, SlotSchema>
    
    // Style & Layout
    style?: StyleSchema
    layout?: LayoutSchema
    
    // Data binding
    model?: ModelSchema
    bindings?: BindingSchema[]
}

/**
 * Application meta schema - defines entire TUI app
 */
export interface AppMetaSchema extends MetaSchema {
    $type: 'app'
    
    // App metadata
    name: string
    version: string
    description?: string
    
    // Global configuration
    config?: {
        theme?: string
        locale?: string
        timezone?: string
        plugins?: string[]
    }
    
    // Screens/Routes
    screens?: Record<string, ScreenSchema>
    router?: RouterSchema
    
    // Global state
    store?: StoreSchema
    
    // Global components
    components?: Record<string, ComponentMetaSchema>
    
    // Services
    services?: Record<string, ServiceSchema>
    
    // Entry point
    main?: ComponentMetaSchema | string
}

/**
 * Style schema - reactive styles
 */
export interface StyleSchema extends MetaSchema {
    $type: 'style'
    
    // Base styles
    color?: string | ReactiveValue<string>
    background?: string | ReactiveValue<string>
    border?: BorderSchema | ReactiveValue<BorderSchema>
    padding?: number | number[] | ReactiveValue<number[]>
    margin?: number | number[] | ReactiveValue<number[]>
    
    // Positioning
    position?: 'static' | 'absolute' | 'relative' | 'fixed' | ReactiveValue<string>
    x?: number | string | ReactiveValue<number>
    y?: number | string | ReactiveValue<number>
    width?: number | string | ReactiveValue<number>
    height?: number | string | ReactiveValue<number>
    
    // Flexbox-like
    display?: 'block' | 'flex' | 'grid' | 'none' | ReactiveValue<string>
    flexDirection?: 'row' | 'column' | ReactiveValue<string>
    justifyContent?: string | ReactiveValue<string>
    alignItems?: string | ReactiveValue<string>
    
    // Responsive
    breakpoints?: Record<string, Partial<StyleSchema>>
    
    // Animations
    transitions?: TransitionSchema[]
    animations?: AnimationSchema[]
    
    // Pseudo-states
    hover?: Partial<StyleSchema>
    focus?: Partial<StyleSchema>
    active?: Partial<StyleSchema>
    disabled?: Partial<StyleSchema>
}

/**
 * Layout schema - defines component arrangement
 */
export interface LayoutSchema extends MetaSchema {
    $type: 'layout'
    
    type: 'absolute' | 'flex' | 'grid' | 'stack' | 'dock' | 'split'
    
    // Grid layout
    grid?: {
        columns?: number | string | ReactiveValue<number>
        rows?: number | string | ReactiveValue<number>
        gap?: number | ReactiveValue<number>
        areas?: string[][]
    }
    
    // Flex layout
    flex?: {
        direction?: 'row' | 'column' | ReactiveValue<string>
        wrap?: boolean | ReactiveValue<boolean>
        justify?: string | ReactiveValue<string>
        align?: string | ReactiveValue<string>
        gap?: number | ReactiveValue<number>
    }
    
    // Dock layout
    dock?: {
        top?: ComponentMetaSchema | string
        bottom?: ComponentMetaSchema | string
        left?: ComponentMetaSchema | string
        right?: ComponentMetaSchema | string
        center?: ComponentMetaSchema | string
    }
    
    // Split layout
    split?: {
        orientation?: 'horizontal' | 'vertical'
        sizes?: number[] | ReactiveValue<number[]>
        resizable?: boolean
        panes?: ComponentMetaSchema[]
    }
}

/**
 * State schema - reactive state definition
 */
export interface StateSchema extends MetaSchema {
    $type: 'state'
    
    // State properties
    properties?: Record<string, PropertySchema>
    
    // Mutations
    mutations?: Record<string, MutationSchema>
    
    // Actions
    actions?: Record<string, ActionSchema>
    
    // Getters
    getters?: Record<string, GetterSchema>
    
    // Persistence
    persist?: {
        key?: string
        storage?: 'memory' | 'file' | 'database'
        serialize?: Function | string
        deserialize?: Function | string
    }
}

/**
 * Event schema
 */
export interface EventSchema extends MetaSchema {
    $type: 'event'
    
    // Event definitions
    definitions?: Record<string, {
        payload?: PropertySchema
        bubbles?: boolean
        cancelable?: boolean
        async?: boolean
    }>
    
    // Event flow
    capture?: boolean
    passive?: boolean
    once?: boolean
}

/**
 * Property schema
 */
export interface PropertySchema {
    type: PrimitiveType | ComplexType | string
    default?: any
    required?: boolean
    readonly?: boolean
    validator?: Validator | Validator[]
    transformer?: Transformer
    reactive?: boolean
    computed?: string | Function
    watch?: WatchHandler
}

/**
 * Reactive value wrapper
 */
export interface ReactiveValue<T> {
    $ref?: string // Reference to another value
    $bind?: string // Two-way binding
    $compute?: string | Function // Computed value
    $watch?: WatchHandler
    value?: T
}

/**
 * Binding schema
 */
export interface BindingSchema {
    source: string // Path to source
    target: string // Path to target
    mode?: 'one-way' | 'two-way' | 'once'
    transformer?: Transformer
    filter?: Function | string
}

/**
 * Model schema for v-model like binding
 */
export interface ModelSchema {
    prop?: string
    event?: string
    lazy?: boolean
    number?: boolean
    trim?: boolean
}

/**
 * Watch handler
 */
export interface WatchHandler {
    handler: Function | string
    immediate?: boolean
    deep?: boolean
    flush?: 'pre' | 'post' | 'sync'
}

/**
 * Validator
 */
export type Validator = Function | string | {
    validator: Function | string
    message?: string
    trigger?: 'change' | 'blur' | 'submit'
}

/**
 * Transformer
 */
export type Transformer = Function | string | {
    in?: Function | string
    out?: Function | string
}

/**
 * Lifecycle hooks
 */
export interface LifecycleHooks {
    beforeCreate?: Function | string
    created?: Function | string
    beforeMount?: Function | string
    mounted?: Function | string
    beforeUpdate?: Function | string
    updated?: Function | string
    beforeUnmount?: Function | string
    unmounted?: Function | string
    activated?: Function | string
    deactivated?: Function | string
    errorCaptured?: Function | string
}

// Additional schema types...

export interface ScreenSchema extends ComponentMetaSchema {
    route?: string
    params?: Record<string, PropertySchema>
    guards?: {
        beforeEnter?: Function | string
        beforeLeave?: Function | string
    }
}

export interface RouterSchema {
    mode?: 'hash' | 'history' | 'memory'
    base?: string
    routes?: RouteSchema[]
    fallback?: string
}

export interface RouteSchema {
    path: string
    name?: string
    component?: ComponentMetaSchema | string
    redirect?: string
    children?: RouteSchema[]
    meta?: Record<string, any>
}

export interface ServiceSchema extends MetaSchema {
    $type: 'service'
    
    singleton?: boolean
    factory?: Function | string
    dependencies?: string[]
    methods?: Record<string, Function | string>
    lifecycle?: {
        init?: Function | string
        destroy?: Function | string
    }
}

export interface StoreSchema extends StateSchema {
    modules?: Record<string, StoreSchema>
    namespaced?: boolean
    devtools?: boolean
}

export interface PropsSchema {
    [key: string]: PropertySchema | PrimitiveType
}

export interface SlotSchema {
    name?: string
    props?: PropsSchema
    fallback?: ComponentMetaSchema
}

export interface RenderSchema {
    type?: 'template' | 'function' | 'jsx'
    template?: string
    render?: Function | string
    staticRenderFns?: Array<Function | string>
}

export interface BorderSchema {
    style?: 'single' | 'double' | 'rounded' | 'bold' | 'ascii' | 'none'
    color?: string
    width?: number
}

export interface TransitionSchema {
    property?: string | string[]
    duration?: number
    easing?: string
    delay?: number
}

export interface AnimationSchema {
    name?: string
    keyframes?: Record<string, Partial<StyleSchema>>
    duration?: number
    easing?: string
    delay?: number
    iterations?: number | 'infinite'
    direction?: 'normal' | 'reverse' | 'alternate'
    fillMode?: 'none' | 'forwards' | 'backwards' | 'both'
}

export interface MutationSchema {
    handler: Function | string
    payload?: PropertySchema
}

export interface ActionSchema {
    handler: Function | string
    payload?: PropertySchema
    async?: boolean
}

export interface GetterSchema {
    handler: Function | string
    cache?: boolean
}

/**
 * Meta Schema Engine - The core of everything
 */
export class MetaSchemaEngine extends EventEmitter {
    private schemas: Map<string, MetaSchema> = new Map()
    private instances: Map<string, any> = new Map()
    private reactiveProxies: WeakMap<object, any> = new WeakMap()
    private dependencies: Map<string, Set<string>> = new Map()
    private computedCache: Map<string, any> = new Map()
    private watchers: Map<string, Set<Function>> = new Map()
    
    /**
     * Register a schema
     */
    register(schema: MetaSchema): void {
        this.schemas.set(schema.$id, schema)
        
        // Process extends
        if (schema.$extends) {
            this.processInheritance(schema)
        }
        
        // Process mixins
        if (schema.$mixins) {
            this.processMixins(schema)
        }
        
        // Make reactive if needed
        if (schema.$reactive) {
            this.makeReactive(schema)
        }
        
        this.emit('schema:register', schema)
    }
    
    /**
     * Create instance from schema
     */
    create(schemaId: string, props?: Record<string, any>): any {
        const schema = this.schemas.get(schemaId)
        if (!schema) {
            throw new Error(`Schema ${schemaId} not found`)
        }
        
        return this.instantiate(schema, props)
    }
    
    /**
     * Instantiate a schema
     */
    private instantiate(schema: MetaSchema, props?: Record<string, any>): any {
        const instance: any = {}
        
        // Apply lifecycle hook: beforeCreate
        this.callLifecycle(schema, 'beforeCreate', instance)
        
        // Create reactive state
        if (schema.$type === 'component' || schema.$type === 'state') {
            const componentSchema = schema as ComponentMetaSchema
            
            // Initialize props
            if (componentSchema.props && props) {
                this.initializeProps(instance, componentSchema.props, props)
            }
            
            // Initialize state
            if (componentSchema.state) {
                this.initializeState(instance, componentSchema.state)
            }
            
            // Setup computed properties
            if (schema.$computed) {
                this.setupComputed(instance, schema.$computed)
            }
            
            // Setup watchers
            if (schema.$watch) {
                this.setupWatchers(instance, schema.$watch)
            }
            
            // Setup methods
            if (componentSchema.methods) {
                this.setupMethods(instance, componentSchema.methods)
            }
        }
        
        // Make instance reactive
        if (schema.$reactive) {
            instance._reactive = this.createReactiveProxy(instance)
        }
        
        // Store instance
        this.instances.set(schema.$id, instance)
        
        // Apply lifecycle hook: created
        this.callLifecycle(schema, 'created', instance)
        
        return instance
    }
    
    /**
     * Make object reactive
     */
    private makeReactive(obj: any): any {
        return this.createReactiveProxy(obj)
    }
    
    /**
     * Create reactive proxy
     */
    private createReactiveProxy(target: any): any {
        if (this.reactiveProxies.has(target)) {
            return this.reactiveProxies.get(target)
        }
        
        const self = this
        
        const proxy = new Proxy(target, {
            get(obj, prop) {
                // Track dependency
                self.trackDependency(obj, prop as string)
                
                const value = obj[prop]
                
                // Return reactive proxy for nested objects
                if (typeof value === 'object' && value !== null) {
                    return self.createReactiveProxy(value)
                }
                
                return value
            },
            
            set(obj, prop, value) {
                const oldValue = obj[prop]
                
                // Set value
                obj[prop] = value
                
                // Trigger updates
                self.triggerUpdate(obj, prop as string, value, oldValue)
                
                // Invalidate computed cache
                self.invalidateComputed(obj, prop as string)
                
                // Trigger watchers
                self.triggerWatchers(obj, prop as string, value, oldValue)
                
                return true
            },
            
            deleteProperty(obj, prop) {
                const oldValue = obj[prop]
                
                delete obj[prop]
                
                self.triggerUpdate(obj, prop as string, undefined, oldValue)
                self.invalidateComputed(obj, prop as string)
                self.triggerWatchers(obj, prop as string, undefined, oldValue)
                
                return true
            }
        })
        
        this.reactiveProxies.set(target, proxy)
        return proxy
    }
    
    /**
     * Process inheritance
     */
    private processInheritance(schema: MetaSchema): void {
        const parents = Array.isArray(schema.$extends) 
            ? schema.$extends 
            : [schema.$extends!]
        
        for (const parentId of parents) {
            const parent = this.schemas.get(parentId)
            if (parent) {
                // Deep merge parent into schema
                this.deepMerge(schema, parent)
            }
        }
    }
    
    /**
     * Process mixins
     */
    private processMixins(schema: MetaSchema): void {
        for (const mixinId of schema.$mixins!) {
            const mixin = this.schemas.get(mixinId)
            if (mixin) {
                // Merge mixin into schema
                this.deepMerge(schema, mixin)
            }
        }
    }
    
    /**
     * Deep merge objects
     */
    private deepMerge(target: any, source: any): any {
        for (const key in source) {
            if (key.startsWith('$')) continue // Skip meta properties
            
            if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {}
                this.deepMerge(target[key], source[key])
            } else {
                if (!(key in target)) {
                    target[key] = source[key]
                }
            }
        }
        return target
    }
    
    // ... Additional implementation methods ...
    
    private trackDependency(obj: any, prop: string): void {
        // Implementation for dependency tracking
    }
    
    private triggerUpdate(obj: any, prop: string, newValue: any, oldValue: any): void {
        this.emit('update', { obj, prop, newValue, oldValue })
    }
    
    private invalidateComputed(obj: any, prop: string): void {
        // Invalidate computed properties that depend on this
    }
    
    private triggerWatchers(obj: any, prop: string, newValue: any, oldValue: any): void {
        const key = `${obj._id}.${prop}`
        const watchers = this.watchers.get(key)
        if (watchers) {
            watchers.forEach(watcher => watcher(newValue, oldValue))
        }
    }
    
    private callLifecycle(schema: MetaSchema, hook: keyof LifecycleHooks, instance: any): void {
        if (schema.$lifecycle && schema.$lifecycle[hook]) {
            const handler = schema.$lifecycle[hook]
            if (typeof handler === 'function') {
                handler.call(instance)
            }
        }
    }
    
    private initializeProps(instance: any, propsSchema: PropsSchema, props: Record<string, any>): void {
        instance.props = {}
        for (const key in propsSchema) {
            const propDef = propsSchema[key]
            const value = props[key]
            
            if (typeof propDef === 'object' && 'default' in propDef) {
                instance.props[key] = value !== undefined ? value : propDef.default
            } else {
                instance.props[key] = value
            }
        }
    }
    
    private initializeState(instance: any, stateSchema: StateSchema): void {
        instance.state = {}
        
        if (stateSchema.properties) {
            for (const key in stateSchema.properties) {
                const prop = stateSchema.properties[key]
                instance.state[key] = prop.default
            }
        }
        
        // Make state reactive
        instance.state = this.createReactiveProxy(instance.state)
    }
    
    private setupComputed(instance: any, computed: Record<string, string | Function>): void {
        instance.computed = {}
        
        for (const key in computed) {
            Object.defineProperty(instance, key, {
                get() {
                    // Check cache
                    const cacheKey = `${instance._id}.${key}`
                    if (this.computedCache.has(cacheKey)) {
                        return this.computedCache.get(cacheKey)
                    }
                    
                    // Compute value
                    const handler = computed[key]
                    const value = typeof handler === 'function' 
                        ? handler.call(instance)
                        : new Function('return ' + handler).call(instance)
                    
                    // Cache value
                    this.computedCache.set(cacheKey, value)
                    
                    return value
                }
            })
        }
    }
    
    private setupWatchers(instance: any, watchers: Record<string, WatchHandler>): void {
        for (const key in watchers) {
            const watcher = watchers[key]
            const handler = typeof watcher.handler === 'function'
                ? watcher.handler
                : new Function('newValue', 'oldValue', watcher.handler as string)
            
            const watchKey = `${instance._id}.${key}`
            if (!this.watchers.has(watchKey)) {
                this.watchers.set(watchKey, new Set())
            }
            this.watchers.get(watchKey)!.add(handler)
            
            // Call immediately if needed
            if (watcher.immediate) {
                const value = this.getValueByPath(instance, key)
                handler.call(instance, value, undefined)
            }
        }
    }
    
    private setupMethods(instance: any, methods: Record<string, Function | string>): void {
        for (const key in methods) {
            const method = methods[key]
            instance[key] = typeof method === 'function'
                ? method.bind(instance)
                : new Function(method as string).bind(instance)
        }
    }
    
    private getValueByPath(obj: any, path: string): any {
        const parts = path.split('.')
        let value = obj
        for (const part of parts) {
            value = value[part]
            if (value === undefined) break
        }
        return value
    }
}