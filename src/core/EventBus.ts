/**
 * Global Event Bus for Component Communication
 * Allows decoupled communication between components
 */

import { EventEmitter } from 'events'

/**
 * Event payload
 */
export interface EventPayload {
    source?: string // Component ID that triggered the event
    target?: string // Target component ID (optional)
    data?: any
    timestamp: Date
    bubbles?: boolean // Whether event should bubble up the component tree
    cancelable?: boolean // Whether event can be cancelled
}

/**
 * Event handler with priority
 */
export interface EventHandler {
    id: string
    handler: (payload: EventPayload) => void | boolean
    priority?: number // Lower number = higher priority
    once?: boolean
    filter?: (payload: EventPayload) => boolean
}

/**
 * Event subscription
 */
export interface EventSubscription {
    unsubscribe: () => void
}

/**
 * Event Bus - Singleton
 */
export class EventBus extends EventEmitter {
    private static instance: EventBus
    private handlers: Map<string, Set<EventHandler>> = new Map()
    private eventHistory: Array<{ event: string; payload: EventPayload }> = []
    private maxHistory = 1000
    private wildcardHandlers: Set<EventHandler> = new Set()
    private channelHandlers: Map<string, Map<string, Set<EventHandler>>> = new Map()
    
    private constructor() {
        super()
        this.setMaxListeners(0) // Unlimited listeners
    }
    
    /**
     * Get singleton instance
     */
    static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus()
        }
        return EventBus.instance
    }
    
    /**
     * Emit an event
     */
    override emit(event: string, payload?: Partial<EventPayload>): boolean {
        const fullPayload: EventPayload = {
            ...payload,
            timestamp: new Date()
        }
        
        // Add to history
        this.addToHistory(event, fullPayload)
        
        // Get handlers for this event
        const handlers = this.getHandlersForEvent(event)
        
        // Sort by priority
        const sortedHandlers = Array.from(handlers).sort((a, b) => {
            return (a.priority || 0) - (b.priority || 0)
        })
        
        let cancelled = false
        
        // Execute handlers
        for (const handler of sortedHandlers) {
            // Check filter
            if (handler.filter && !handler.filter(fullPayload)) {
                continue
            }
            
            // Execute handler
            const result = handler.handler(fullPayload)
            
            // Check if event was cancelled
            if (fullPayload.cancelable && result === false) {
                cancelled = true
                break
            }
            
            // Remove if once
            if (handler.once) {
                this.removeHandler(event, handler)
            }
        }
        
        // Call wildcard handlers
        if (!cancelled) {
            this.wildcardHandlers.forEach(handler => {
                if (!handler.filter || handler.filter(fullPayload)) {
                    handler.handler(fullPayload)
                    
                    if (handler.once) {
                        this.wildcardHandlers.delete(handler)
                    }
                }
            })
        }
        
        // Call parent emit
        super.emit(event, fullPayload)
        
        return !cancelled
    }
    
    /**
     * Subscribe to an event
     */
    subscribe(
        event: string,
        handler: (payload: EventPayload) => void | boolean,
        options?: {
            priority?: number
            once?: boolean
            filter?: (payload: EventPayload) => boolean
        }
    ): EventSubscription {
        const handlerId = this.generateHandlerId()
        
        const eventHandler: EventHandler = {
            id: handlerId,
            handler,
            priority: options?.priority,
            once: options?.once,
            filter: options?.filter
        }
        
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set())
        }
        
        this.handlers.get(event)!.add(eventHandler)
        
        return {
            unsubscribe: () => {
                this.removeHandler(event, eventHandler)
            }
        }
    }
    
    /**
     * Subscribe once to an event (custom implementation)
     */
    subscribeOnce(
        event: string,
        handler: (payload: EventPayload) => void | boolean,
        options?: {
            priority?: number
            filter?: (payload: EventPayload) => boolean
        }
    ): EventSubscription {
        return this.subscribe(event, handler, { ...options, once: true })
    }
    
    /**
     * Subscribe to all events (wildcard)
     */
    subscribeAll(
        handler: (event: string, payload: EventPayload) => void,
        options?: {
            filter?: (payload: EventPayload) => boolean
            once?: boolean
        }
    ): EventSubscription {
        const handlerId = this.generateHandlerId()
        
        const eventHandler: EventHandler = {
            id: handlerId,
            handler: (payload) => {
                handler('*', payload)
            },
            once: options?.once,
            filter: options?.filter
        }
        
        this.wildcardHandlers.add(eventHandler)
        
        return {
            unsubscribe: () => {
                this.wildcardHandlers.delete(eventHandler)
            }
        }
    }
    
    /**
     * Subscribe to events on a specific channel
     */
    subscribeChannel(
        channel: string,
        event: string,
        handler: (payload: EventPayload) => void | boolean,
        options?: {
            priority?: number
            once?: boolean
            filter?: (payload: EventPayload) => boolean
        }
    ): EventSubscription {
        if (!this.channelHandlers.has(channel)) {
            this.channelHandlers.set(channel, new Map())
        }
        
        const channelMap = this.channelHandlers.get(channel)!
        
        if (!channelMap.has(event)) {
            channelMap.set(event, new Set())
        }
        
        const handlerId = this.generateHandlerId()
        
        const eventHandler: EventHandler = {
            id: handlerId,
            handler,
            priority: options?.priority,
            once: options?.once,
            filter: options?.filter
        }
        
        channelMap.get(event)!.add(eventHandler)
        
        return {
            unsubscribe: () => {
                channelMap.get(event)?.delete(eventHandler)
            }
        }
    }
    
    /**
     * Emit event on a specific channel
     */
    emitChannel(channel: string, event: string, payload?: Partial<EventPayload>): boolean {
        const fullPayload: EventPayload = {
            ...payload,
            timestamp: new Date()
        }
        
        const channelMap = this.channelHandlers.get(channel)
        if (!channelMap) return true
        
        const handlers = channelMap.get(event)
        if (!handlers) return true
        
        const sortedHandlers = Array.from(handlers).sort((a, b) => {
            return (a.priority || 0) - (b.priority || 0)
        })
        
        let cancelled = false
        
        for (const handler of sortedHandlers) {
            if (handler.filter && !handler.filter(fullPayload)) {
                continue
            }
            
            const result = handler.handler(fullPayload)
            
            if (fullPayload.cancelable && result === false) {
                cancelled = true
                break
            }
            
            if (handler.once) {
                handlers.delete(handler)
            }
        }
        
        return !cancelled
    }
    
    /**
     * Wait for an event (Promise-based)
     */
    waitFor(
        event: string,
        options?: {
            timeout?: number
            filter?: (payload: EventPayload) => boolean
        }
    ): Promise<EventPayload> {
        return new Promise((resolve, reject) => {
            let timeoutId: NodeJS.Timeout | undefined
            
            const subscription = this.subscribeOnce(event, (payload) => {
                if (timeoutId) {
                    clearTimeout(timeoutId)
                }
                resolve(payload)
            }, { filter: options?.filter })
            
            if (options?.timeout) {
                timeoutId = setTimeout(() => {
                    subscription.unsubscribe()
                    reject(new Error(`Timeout waiting for event: ${event}`))
                }, options.timeout)
            }
        })
    }
    
    /**
     * Create a proxy for component-specific events
     */
    createComponentProxy(componentId: string): {
        emit: (event: string, data?: any) => boolean
        subscribe: (event: string, handler: (payload: EventPayload) => void) => EventSubscription
    } {
        return {
            emit: (event: string, data?: any) => {
                return this.emit(`${componentId}:${event}`, {
                    source: componentId,
                    data
                })
            },
            subscribe: (event: string, handler: (payload: EventPayload) => void) => {
                return this.subscribe(`${componentId}:${event}`, handler)
            }
        }
    }
    
    /**
     * Bridge events between two components
     */
    bridge(
        sourceComponent: string,
        sourceEvent: string,
        targetComponent: string,
        targetEvent: string,
        transformer?: (data: any) => any
    ): EventSubscription {
        return this.subscribe(`${sourceComponent}:${sourceEvent}`, (payload) => {
            const transformedData = transformer ? transformer(payload.data) : payload.data
            
            this.emit(`${targetComponent}:${targetEvent}`, {
                source: sourceComponent,
                target: targetComponent,
                data: transformedData
            })
        })
    }
    
    /**
     * Remove all handlers for an event
     */
    removeAllHandlers(event?: string): void {
        if (event) {
            this.handlers.delete(event)
        } else {
            this.handlers.clear()
            this.wildcardHandlers.clear()
            this.channelHandlers.clear()
        }
    }
    
    /**
     * Get event history
     */
    getHistory(event?: string): Array<{ event: string; payload: EventPayload }> {
        if (event) {
            return this.eventHistory.filter(item => item.event === event)
        }
        return [...this.eventHistory]
    }
    
    /**
     * Clear event history
     */
    clearHistory(): void {
        this.eventHistory = []
    }
    
    /**
     * Get statistics
     */
    getStats(): {
        totalHandlers: number
        eventTypes: number
        channels: number
        wildcardHandlers: number
        historySize: number
    } {
        let totalHandlers = 0
        
        this.handlers.forEach(set => {
            totalHandlers += set.size
        })
        
        this.channelHandlers.forEach(channelMap => {
            channelMap.forEach(set => {
                totalHandlers += set.size
            })
        })
        
        return {
            totalHandlers: totalHandlers + this.wildcardHandlers.size,
            eventTypes: this.handlers.size,
            channels: this.channelHandlers.size,
            wildcardHandlers: this.wildcardHandlers.size,
            historySize: this.eventHistory.length
        }
    }
    
    /**
     * Add event to history
     */
    private addToHistory(event: string, payload: EventPayload): void {
        this.eventHistory.push({ event, payload })
        
        // Limit history size
        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory.shift()
        }
    }
    
    /**
     * Get handlers for an event
     */
    private getHandlersForEvent(event: string): Set<EventHandler> {
        return this.handlers.get(event) || new Set()
    }
    
    /**
     * Remove a specific handler
     */
    private removeHandler(event: string, handler: EventHandler): void {
        this.handlers.get(event)?.delete(handler)
    }
    
    /**
     * Generate unique handler ID
     */
    private generateHandlerId(): string {
        return `handler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    /**
     * Reset the event bus
     */
    reset(): void {
        this.removeAllHandlers()
        this.clearHistory()
    }
}