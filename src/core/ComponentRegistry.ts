/**
 * Component Registry System
 * Manages component instances with unique IDs to prevent conflicts
 */

import { EventEmitter } from 'events'
import { Component } from './Component'
// Remove uuid import - use built-in function below

/**
 * Component metadata
 */
export interface ComponentMetadata {
    id: string
    type: string
    name?: string
    parent?: string
    children: string[]
    props: Record<string, any>
    state: Record<string, any>
    createdAt: Date
    updatedAt: Date
    mounted: boolean
    region?: { x: number; y: number; width: number; height: number }
}

/**
 * Component reference
 */
export interface ComponentRef {
    id: string
    component: Component
    metadata: ComponentMetadata
}

/**
 * Component Registry - Singleton
 */
export class ComponentRegistry extends EventEmitter {
    private static instance: ComponentRegistry
    private components: Map<string, ComponentRef> = new Map()
    private componentsByType: Map<string, Set<string>> = new Map()
    private componentTree: Map<string, string[]> = new Map()
    private mountedComponents: Set<string> = new Set()
    
    private constructor() {
        super()
    }
    
    /**
     * Get singleton instance
     */
    static getInstance(): ComponentRegistry {
        if (!ComponentRegistry.instance) {
            ComponentRegistry.instance = new ComponentRegistry()
        }
        return ComponentRegistry.instance
    }
    
    /**
     * Generate unique component ID
     */
    generateId(prefix?: string): string {
        const uuid = uuidv4().replace(/-/g, '').substring(0, 8)
        return prefix ? `${prefix}_${uuid}` : uuid
    }
    
    /**
     * Register a component
     */
    register(
        component: Component,
        options: {
            id?: string
            type?: string
            name?: string
            parent?: string
            props?: Record<string, any>
            state?: Record<string, any>
        } = {}
    ): string {
        const id = options.id || this.generateId(options.type)
        
        // Check for duplicate ID
        if (this.components.has(id)) {
            throw new Error(`Component with ID "${id}" already exists`)
        }
        
        // Create metadata
        const metadata: ComponentMetadata = {
            id,
            type: options.type || component.constructor.name,
            name: options.name,
            parent: options.parent,
            children: [],
            props: options.props || {},
            state: options.state || {},
            createdAt: new Date(),
            updatedAt: new Date(),
            mounted: false
        }
        
        // Store component reference
        const ref: ComponentRef = {
            id,
            component,
            metadata
        }
        
        this.components.set(id, ref)
        
        // Track by type
        if (!this.componentsByType.has(metadata.type)) {
            this.componentsByType.set(metadata.type, new Set())
        }
        this.componentsByType.get(metadata.type)!.add(id)
        
        // Update parent-child relationships
        if (options.parent) {
            const parent = this.components.get(options.parent)
            if (parent) {
                parent.metadata.children.push(id)
                this.updateComponentTree()
            }
        }
        
        // Setup component event forwarding
        this.setupComponentEvents(id, component)
        
        // Emit registration event
        this.emit('register', { id, component, metadata })
        
        return id
    }
    
    /**
     * Unregister a component
     */
    unregister(id: string): boolean {
        const ref = this.components.get(id)
        if (!ref) return false
        
        // Remove from parent's children
        if (ref.metadata.parent) {
            const parent = this.components.get(ref.metadata.parent)
            if (parent) {
                const index = parent.metadata.children.indexOf(id)
                if (index > -1) {
                    parent.metadata.children.splice(index, 1)
                }
            }
        }
        
        // Unregister children recursively
        ref.metadata.children.forEach(childId => {
            this.unregister(childId)
        })
        
        // Remove from type tracking
        const typeSet = this.componentsByType.get(ref.metadata.type)
        if (typeSet) {
            typeSet.delete(id)
            if (typeSet.size === 0) {
                this.componentsByType.delete(ref.metadata.type)
            }
        }
        
        // Remove from mounted set
        this.mountedComponents.delete(id)
        
        // Remove component
        this.components.delete(id)
        
        // Update tree
        this.updateComponentTree()
        
        // Emit unregistration event
        this.emit('unregister', { id, component: ref.component, metadata: ref.metadata })
        
        return true
    }
    
    /**
     * Get component by ID
     */
    get(id: string): ComponentRef | undefined {
        return this.components.get(id)
    }
    
    /**
     * Get component instance by ID
     */
    getComponent(id: string): Component | undefined {
        return this.components.get(id)?.component
    }
    
    /**
     * Get components by type
     */
    getByType(type: string): ComponentRef[] {
        const ids = this.componentsByType.get(type)
        if (!ids) return []
        
        return Array.from(ids)
            .map(id => this.components.get(id))
            .filter(ref => ref !== undefined) as ComponentRef[]
    }
    
    /**
     * Get all components
     */
    getAll(): ComponentRef[] {
        return Array.from(this.components.values())
    }
    
    /**
     * Get component children
     */
    getChildren(parentId: string): ComponentRef[] {
        const parent = this.components.get(parentId)
        if (!parent) return []
        
        return parent.metadata.children
            .map(id => this.components.get(id))
            .filter(ref => ref !== undefined) as ComponentRef[]
    }
    
    /**
     * Get component ancestors
     */
    getAncestors(id: string): ComponentRef[] {
        const ancestors: ComponentRef[] = []
        let currentId = id
        
        while (currentId) {
            const ref = this.components.get(currentId)
            if (!ref || !ref.metadata.parent) break
            
            const parent = this.components.get(ref.metadata.parent)
            if (parent) {
                ancestors.push(parent)
                currentId = parent.id
            } else {
                break
            }
        }
        
        return ancestors
    }
    
    /**
     * Find components matching criteria
     */
    find(predicate: (ref: ComponentRef) => boolean): ComponentRef[] {
        return Array.from(this.components.values()).filter(predicate)
    }
    
    /**
     * Find first component matching criteria
     */
    findOne(predicate: (ref: ComponentRef) => boolean): ComponentRef | undefined {
        return Array.from(this.components.values()).find(predicate)
    }
    
    /**
     * Update component metadata
     */
    updateMetadata(id: string, updates: Partial<ComponentMetadata>): boolean {
        const ref = this.components.get(id)
        if (!ref) return false
        
        Object.assign(ref.metadata, updates)
        ref.metadata.updatedAt = new Date()
        
        this.emit('metadataUpdate', { id, metadata: ref.metadata })
        
        return true
    }
    
    /**
     * Mount component
     */
    mount(id: string, region?: { x: number; y: number; width: number; height: number }): boolean {
        const ref = this.components.get(id)
        if (!ref) return false
        
        ref.metadata.mounted = true
        if (region) {
            ref.metadata.region = region
        }
        
        this.mountedComponents.add(id)
        
        this.emit('mount', { id, component: ref.component, region })
        
        return true
    }
    
    /**
     * Unmount component
     */
    unmount(id: string): boolean {
        const ref = this.components.get(id)
        if (!ref) return false
        
        ref.metadata.mounted = false
        this.mountedComponents.delete(id)
        
        this.emit('unmount', { id, component: ref.component })
        
        return true
    }
    
    /**
     * Get mounted components
     */
    getMounted(): ComponentRef[] {
        return Array.from(this.mountedComponents)
            .map(id => this.components.get(id))
            .filter(ref => ref !== undefined) as ComponentRef[]
    }
    
    /**
     * Move component to new parent
     */
    moveToParent(id: string, newParentId: string | null): boolean {
        const ref = this.components.get(id)
        if (!ref) return false
        
        // Remove from old parent
        if (ref.metadata.parent) {
            const oldParent = this.components.get(ref.metadata.parent)
            if (oldParent) {
                const index = oldParent.metadata.children.indexOf(id)
                if (index > -1) {
                    oldParent.metadata.children.splice(index, 1)
                }
            }
        }
        
        // Add to new parent
        if (newParentId) {
            const newParent = this.components.get(newParentId)
            if (!newParent) return false
            
            // Check for circular dependency
            if (this.wouldCreateCircularDependency(id, newParentId)) {
                throw new Error('Moving component would create circular dependency')
            }
            
            newParent.metadata.children.push(id)
            ref.metadata.parent = newParentId
        } else {
            ref.metadata.parent = undefined
        }
        
        this.updateComponentTree()
        
        this.emit('move', { id, newParentId })
        
        return true
    }
    
    /**
     * Check if moving would create circular dependency
     */
    private wouldCreateCircularDependency(childId: string, parentId: string): boolean {
        const ancestors = this.getAncestors(parentId)
        return ancestors.some(ref => ref.id === childId)
    }
    
    /**
     * Update component tree structure
     */
    private updateComponentTree(): void {
        this.componentTree.clear()
        
        // Build tree from root components
        const rootComponents = Array.from(this.components.values())
            .filter(ref => !ref.metadata.parent)
        
        rootComponents.forEach(ref => {
            this.buildTreeBranch(ref.id)
        })
        
        this.emit('treeUpdate', this.componentTree)
    }
    
    /**
     * Build tree branch recursively
     */
    private buildTreeBranch(id: string): void {
        const ref = this.components.get(id)
        if (!ref) return
        
        const children = ref.metadata.children
        this.componentTree.set(id, children)
        
        children.forEach(childId => {
            this.buildTreeBranch(childId)
        })
    }
    
    /**
     * Setup component event forwarding
     */
    private setupComponentEvents(id: string, component: Component): void {
        // Forward component events with ID context
        const events = ['change', 'focus', 'blur', 'click', 'submit']
        
        events.forEach(eventName => {
            component.on(eventName, (...args) => {
                this.emit(`component:${eventName}`, {
                    id,
                    component,
                    args
                })
            })
        })
    }
    
    /**
     * Get component tree as JSON
     */
    getTreeJSON(): any {
        const buildNode = (id: string): any => {
            const ref = this.components.get(id)
            if (!ref) return null
            
            return {
                id,
                type: ref.metadata.type,
                name: ref.metadata.name,
                mounted: ref.metadata.mounted,
                children: ref.metadata.children.map(childId => buildNode(childId)).filter(n => n !== null)
            }
        }
        
        const roots = Array.from(this.components.values())
            .filter(ref => !ref.metadata.parent)
            .map(ref => buildNode(ref.id))
            .filter(n => n !== null)
        
        return roots
    }
    
    /**
     * Clear all components
     */
    clear(): void {
        // Unmount all components
        this.mountedComponents.forEach(id => {
            this.unmount(id)
        })
        
        // Clear all data structures
        this.components.clear()
        this.componentsByType.clear()
        this.componentTree.clear()
        this.mountedComponents.clear()
        
        this.emit('clear')
    }
    
    /**
     * Get registry statistics
     */
    getStats(): {
        total: number
        mounted: number
        byType: Record<string, number>
        depth: number
    } {
        const byType: Record<string, number> = {}
        this.componentsByType.forEach((ids, type) => {
            byType[type] = ids.size
        })
        
        // Calculate max depth
        let maxDepth = 0
        const calculateDepth = (id: string, depth = 0): void => {
            maxDepth = Math.max(maxDepth, depth)
            const ref = this.components.get(id)
            if (ref) {
                ref.metadata.children.forEach(childId => {
                    calculateDepth(childId, depth + 1)
                })
            }
        }
        
        Array.from(this.components.values())
            .filter(ref => !ref.metadata.parent)
            .forEach(ref => calculateDepth(ref.id))
        
        return {
            total: this.components.size,
            mounted: this.mountedComponents.size,
            byType,
            depth: maxDepth
        }
    }
}

/**
 * UUID v4 implementation (simple version)
 */
function uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}