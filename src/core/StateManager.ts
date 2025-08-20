/**
 * State Management System
 * Reactive state management like Vue/React with computed properties and watchers
 */

import { EventEmitter } from 'events'

/**
 * State change event
 */
export interface StateChange {
    path: string
    oldValue: any
    newValue: any
    timestamp: Date
}

/**
 * Mutation definition
 */
export interface Mutation<S = any> {
    (state: S, payload?: any): void
}

/**
 * Action definition
 */
export interface Action<S = any> {
    (context: ActionContext<S>, payload?: any): void | Promise<void>
}

/**
 * Action context
 */
export interface ActionContext<S = any> {
    state: S
    commit: (type: string, payload?: any) => void
    dispatch: (type: string, payload?: any) => Promise<any>
    getters: Record<string, any>
}

/**
 * Getter definition
 */
export interface Getter<S = any> {
    (state: S, getters: Record<string, any>): any
}

/**
 * Watcher definition
 */
export interface Watcher {
    path: string | string[]
    handler: (newValue: any, oldValue: any, path: string) => void
    immediate?: boolean
    deep?: boolean
}

/**
 * Store module
 */
export interface StoreModule<S = any> {
    namespaced?: boolean
    state: S | (() => S)
    mutations?: Record<string, Mutation<S>>
    actions?: Record<string, Action<S>>
    getters?: Record<string, Getter<S>>
    modules?: Record<string, StoreModule>
}

/**
 * Store options
 */
export interface StoreOptions<S = any> extends StoreModule<S> {
    strict?: boolean
    plugins?: Array<(store: Store<S>) => void>
}

/**
 * Reactive State Store
 */
export class Store<S = any> extends EventEmitter {
    private _state: S
    private _mutations: Map<string, Mutation> = new Map()
    private _actions: Map<string, Action> = new Map()
    private _getters: Map<string, Getter> = new Map()
    private _getterCache: Map<string, any> = new Map()
    private _watchers: Map<string, Set<Watcher>> = new Map()
    private _modules: Map<string, Store<any>> = new Map()
    private _subscribers: Array<(mutation: any, state: S) => void> = []
    private _actionSubscribers: Array<(action: any, state: S) => void> = []
    private _history: StateChange[] = []
    private _maxHistory = 100
    private _strict: boolean
    private _committing = false
    
    constructor(options: StoreOptions<S>) {
        super()
        
        // Initialize state
        this._state = typeof options.state === 'function' 
            ? (options.state as () => S)() 
            : JSON.parse(JSON.stringify(options.state))
        
        this._strict = options.strict || false
        
        // Make state reactive
        this.makeReactive(this._state)
        
        // Register mutations
        if (options.mutations) {
            Object.entries(options.mutations).forEach(([name, mutation]) => {
                this.registerMutation(name, mutation)
            })
        }
        
        // Register actions
        if (options.actions) {
            Object.entries(options.actions).forEach(([name, action]) => {
                this.registerAction(name, action)
            })
        }
        
        // Register getters
        if (options.getters) {
            Object.entries(options.getters).forEach(([name, getter]) => {
                this.registerGetter(name, getter)
            })
        }
        
        // Register modules
        if (options.modules) {
            Object.entries(options.modules).forEach(([name, module]) => {
                this.registerModule(name, module)
            })
        }
        
        // Apply plugins
        if (options.plugins) {
            options.plugins.forEach(plugin => plugin(this))
        }
    }
    
    /**
     * Get current state
     */
    get state(): S {
        return this._state
    }
    
    /**
     * Get all getters
     */
    get getters(): Record<string, any> {
        const result: Record<string, any> = {}
        
        this._getters.forEach((getter, name) => {
            // Use cached value if available
            if (this._getterCache.has(name)) {
                result[name] = this._getterCache.get(name)
            } else {
                const value = getter(this._state, result)
                this._getterCache.set(name, value)
                result[name] = value
            }
        })
        
        return result
    }
    
    /**
     * Make state reactive
     */
    private makeReactive(obj: any, path = ''): any {
        if (typeof obj !== 'object' || obj === null) return obj
        
        const self = this
        
        return new Proxy(obj, {
            get(target, property) {
                const value = target[property]
                const fullPath = path ? `${path}.${String(property)}` : String(property)
                
                // Track dependency for computed properties
                self.trackDependency(fullPath)
                
                if (typeof value === 'object' && value !== null) {
                    return self.makeReactive(value, fullPath)
                }
                
                return value
            },
            
            set(target, property, value) {
                const fullPath = path ? `${path}.${String(property)}` : String(property)
                const oldValue = target[property]
                
                // Check strict mode
                if (self._strict && !self._committing) {
                    return false
                }
                
                // Set value
                target[property] = value
                
                // Track change
                self.trackChange(fullPath, oldValue, value)
                
                // Trigger watchers
                self.triggerWatchers(fullPath, value, oldValue)
                
                // Invalidate getter cache
                self._getterCache.clear()
                
                // Emit change event
                self.emit('change', { path: fullPath, oldValue, newValue: value })
                
                return true
            },
            
            deleteProperty(target, property) {
                const fullPath = path ? `${path}.${String(property)}` : String(property)
                const oldValue = target[property]
                
                if (self._strict && !self._committing) {
                    return false
                }
                
                delete target[property]
                
                self.trackChange(fullPath, oldValue, undefined)
                self.triggerWatchers(fullPath, undefined, oldValue)
                self._getterCache.clear()
                self.emit('change', { path: fullPath, oldValue, newValue: undefined })
                
                return true
            }
        })
    }
    
    /**
     * Track dependency for computed properties
     */
    private trackDependency(path: string): void {
        // This would be used for computed property tracking
        // Implementation depends on specific requirements
    }
    
    /**
     * Track state change
     */
    private trackChange(path: string, oldValue: any, newValue: any): void {
        const change: StateChange = {
            path,
            oldValue: JSON.parse(JSON.stringify(oldValue)),
            newValue: JSON.parse(JSON.stringify(newValue)),
            timestamp: new Date()
        }
        
        this._history.push(change)
        
        // Limit history size
        if (this._history.length > this._maxHistory) {
            this._history.shift()
        }
    }
    
    /**
     * Commit a mutation
     */
    commit(type: string, payload?: any): void {
        const mutation = this._mutations.get(type)
        
        if (!mutation) {
            return
        }
        
        this._committing = true
        
        try {
            mutation(this._state, payload)
            
            // Notify subscribers
            const mutationInfo = { type, payload }
            this._subscribers.forEach(subscriber => {
                subscriber(mutationInfo, this._state)
            })
            
            this.emit('mutation', mutationInfo)
        } finally {
            this._committing = false
        }
    }
    
    /**
     * Dispatch an action
     */
    async dispatch(type: string, payload?: any): Promise<any> {
        const action = this._actions.get(type)
        
        if (!action) {
            return
        }
        
        const context: ActionContext<S> = {
            state: this._state,
            commit: this.commit.bind(this),
            dispatch: this.dispatch.bind(this),
            getters: this.getters
        }
        
        const actionInfo = { type, payload }
        
        // Notify action subscribers
        this._actionSubscribers.forEach(subscriber => {
            subscriber(actionInfo, this._state)
        })
        
        this.emit('action', actionInfo)
        
        try {
            const result = await action(context, payload)
            return result
        } catch (error) {
            this.emit('error', { type: 'action', action: type, error })
            throw error
        }
    }
    
    /**
     * Watch state changes
     */
    watch(path: string | string[], handler: Watcher['handler'], options?: Omit<Watcher, 'path' | 'handler'>): () => void {
        const paths = Array.isArray(path) ? path : [path]
        
        const watcher: Watcher = {
            path: paths,
            handler,
            immediate: options?.immediate,
            deep: options?.deep
        }
        
        paths.forEach(p => {
            if (!this._watchers.has(p)) {
                this._watchers.set(p, new Set())
            }
            this._watchers.get(p)!.add(watcher)
        })
        
        // Call immediately if requested
        if (watcher.immediate) {
            const value = this.getValueByPath(paths[0])
            handler(value, undefined, paths[0])
        }
        
        // Return unwatch function
        return () => {
            paths.forEach(p => {
                this._watchers.get(p)?.delete(watcher)
            })
        }
    }
    
    /**
     * Trigger watchers for a path
     */
    private triggerWatchers(path: string, newValue: any, oldValue: any): void {
        // Check exact path
        const watchers = this._watchers.get(path)
        if (watchers) {
            watchers.forEach(watcher => {
                watcher.handler(newValue, oldValue, path)
            })
        }
        
        // Check parent paths for deep watchers
        const parts = path.split('.')
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('.')
            const parentWatchers = this._watchers.get(parentPath)
            
            if (parentWatchers) {
                parentWatchers.forEach(watcher => {
                    if (watcher.deep) {
                        const parentValue = this.getValueByPath(parentPath)
                        watcher.handler(parentValue, parentValue, path)
                    }
                })
            }
        }
    }
    
    /**
     * Get value by path
     */
    private getValueByPath(path: string): any {
        const parts = path.split('.')
        let value: any = this._state
        
        for (const part of parts) {
            if (value === null || value === undefined) return undefined
            value = value[part]
        }
        
        return value
    }
    
    /**
     * Set value by path
     */
    private setValueByPath(path: string, value: any): void {
        const parts = path.split('.')
        const lastPart = parts.pop()!
        let target: any = this._state
        
        for (const part of parts) {
            if (!(part in target)) {
                target[part] = {}
            }
            target = target[part]
        }
        
        target[lastPart] = value
    }
    
    /**
     * Register a mutation
     */
    registerMutation(name: string, mutation: Mutation<S>): void {
        this._mutations.set(name, mutation)
    }
    
    /**
     * Register an action
     */
    registerAction(name: string, action: Action<S>): void {
        this._actions.set(name, action)
    }
    
    /**
     * Register a getter
     */
    registerGetter(name: string, getter: Getter<S>): void {
        this._getters.set(name, getter)
        this._getterCache.delete(name)
    }
    
    /**
     * Register a module
     */
    registerModule(name: string, module: StoreModule): void {
        // For now, skip recursive module creation to avoid TypeScript issues
        // This would need a proper implementation with lazy initialization
        
        // Just merge the state for now
        if (module.state) {
            (this._state as any)[name] = typeof module.state === 'function' 
                ? (module.state as () => any)() 
                : module.state
        }
    }
    
    /**
     * Subscribe to mutations
     */
    subscribe(fn: (mutation: any, state: S) => void): () => void {
        this._subscribers.push(fn)
        
        return () => {
            const index = this._subscribers.indexOf(fn)
            if (index > -1) {
                this._subscribers.splice(index, 1)
            }
        }
    }
    
    /**
     * Subscribe to actions
     */
    subscribeAction(fn: (action: any, state: S) => void): () => void {
        this._actionSubscribers.push(fn)
        
        return () => {
            const index = this._actionSubscribers.indexOf(fn)
            if (index > -1) {
                this._actionSubscribers.splice(index, 1)
            }
        }
    }
    
    /**
     * Replace state
     */
    replaceState(state: S): void {
        this._committing = true
        this._state = state
        this.makeReactive(this._state)
        this._committing = false
        
        this._getterCache.clear()
        this.emit('replaceState', state)
    }
    
    /**
     * Get state history
     */
    getHistory(): StateChange[] {
        return [...this._history]
    }
    
    /**
     * Clear history
     */
    clearHistory(): void {
        this._history = []
    }
    
    /**
     * Time travel to specific state
     */
    timeTravel(index: number): void {
        if (index < 0 || index >= this._history.length) {
            throw new Error('Invalid history index')
        }
        
        // Reconstruct state up to that point
        // This is a simplified implementation
        // A full implementation would need to track full state snapshots
        
        this.emit('timeTravel', index)
    }
    
    /**
     * Create a snapshot of current state
     */
    snapshot(): S {
        return JSON.parse(JSON.stringify(this._state))
    }
    
    /**
     * Restore from snapshot
     */
    restore(snapshot: S): void {
        this.replaceState(snapshot)
    }
}