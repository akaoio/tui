/**
 * SchemaRenderer - Main class
 * Refactored with modular architecture
 */

import { EventEmitter } from 'events';
import { ScreenManager } from '../ScreenManager/index';
import { ComponentAdapter } from '../ComponentAdapter/index';
import { LayoutEngine } from '../LayoutEngine/index';
import { MetaSchemaEngine } from '../MetaSchema/index';

import { SchemaApp, SchemaRendererState } from './types';
import { initializeStore, createLegacyStore } from './initializeStore';
import { render } from './renderMethods';
import { buildLayoutTree, isFocusable } from './layoutMethods';
import { resolveValue } from './resolveValue';

/**
 * Schema-driven renderer using component reuse architecture
 */
export class SchemaRenderer extends EventEmitter {
  private state: SchemaRendererState;

  constructor(schema: SchemaApp) {
    super();
    
    // Initialize state
    this.state = {
      screen: ScreenManager.getInstance(),
      componentAdapter: null as any, // Will be initialized below
      storeManager: undefined,
      layoutEngine: null as any,
      keyboardHandler: undefined,
      metaEngine: new MetaSchemaEngine(),
      schema: schema,
      layoutTree: null,
      focusableComponents: [],
      currentFocusIndex: 0,
      isDestroyed: false,
      inputMode: false,
      inputText: '',
      editingTodoId: null
    };
    
    // Initialize layout engine
    this.state.layoutEngine = LayoutEngine.getInstance();
    
    // Initialize store if provided
    initializeStore(this.state);
    
    // Initialize component adapter with context
    const { Screen } = require('../screen');
    const { Keyboard } = require('../keyboard');
    const screen = new Screen();
    const keyboard = new Keyboard();
    
    this.state.componentAdapter = new ComponentAdapter(
      screen,
      keyboard,
      {
        store: this.state.storeManager?.getStore() || createLegacyStore(this.state),
        resolveValue: (v: any) => resolveValue(this.state, v)
      }
    );
    
    this.initialize();
    this.setupEventHandlers();
  }

  /**
   * Initialize schema components and layout
   */
  private initialize(): void {
    // Register components with meta engine for validation
    if (this.state.schema.components) {
      for (const [name, componentSchema] of Object.entries(this.state.schema.components)) {
        // Register with meta engine if it has $id
        if (componentSchema.$id) {
          this.state.metaEngine.register(componentSchema);
        }
        
        // Track focusable components
        if (isFocusable(componentSchema)) {
          this.state.focusableComponents.push(name);
        }
        
        // Track child focusable elements for backward compatibility
        if (componentSchema.children) {
          const children = Array.isArray(componentSchema.children) ? componentSchema.children : [componentSchema.children];
          children.forEach((child: any, index: number) => {
            if (isFocusable(child)) {
              this.state.focusableComponents.push(`${name}.child.${index}`);
            }
          });
        }
      }
    }
    
    // Initialize main screen
    if (this.state.schema.main) {
      const mainScreen = typeof this.state.schema.main === 'string' 
        ? this.state.schema.components?.[this.state.schema.main] || this.state.schema.screens?.[this.state.schema.main]
        : this.state.schema.main;
      
      if (mainScreen && mainScreen.$id) {
        this.state.metaEngine.register(mainScreen);
      }
    }
    
    // Build initial layout tree
    buildLayoutTree(this.state);
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Store listeners
    if (this.state.storeManager) {
      this.state.storeManager.on('state-change', () => {
        if (!this.state.isDestroyed) {
          this.render();
          this.emit('state-change');
        }
      });
    }
    
    // Legacy keyboard handling
    this.state.screen.on('keypress', (char: string, key: any) => {
      this.handleKeypress(char, key);
    });
    
    // Screen resize
    this.state.screen.on('resize', () => {
      if (!this.state.isDestroyed) {
        // Handle resize
        const { width, height } = this.state.screen.getDimensions();
        this.state.layoutEngine.updateDimensions(width, height);
        this.render();
      }
    });
    
    // Component events
    this.state.componentAdapter.on('component-event', (event) => {
      this.handleComponentEvent(event);
    });
  }

  /**
   * Handle keyboard input
   */
  private handleKeypress(char: string, key: any): void {
    if (char === 'q' || key?.name === 'escape') {
      this.emit('quit');
      return;
    }
    
    // Tab navigation
    if (key?.name === 'tab') {
      if (this.state.inputMode) {
        this.state.inputMode = false;
        this.state.inputText = '';
        this.state.editingTodoId = null;
        this.state.screen.setCursorVisible(false);
      } else {
        this.navigateFocus(key?.shift ? -1 : 1);
      }
      this.render();
      return;
    }
    
    // Emit for external handlers
    this.emit('keypress', char, key);
  }

  /**
   * Navigate focus between components
   */
  private navigateFocus(direction: number): void {
    if (this.state.focusableComponents.length === 0) return;
    
    // Update index
    this.state.currentFocusIndex += direction;
    if (this.state.currentFocusIndex < 0) {
      this.state.currentFocusIndex = this.state.focusableComponents.length - 1;
    } else if (this.state.currentFocusIndex >= this.state.focusableComponents.length) {
      this.state.currentFocusIndex = 0;
    }
    
    // Update focus
    const focusedId = this.state.focusableComponents[this.state.currentFocusIndex];
    if (focusedId) {
      this.state.componentAdapter.focusComponent(focusedId);
    }
    
    this.render();
  }

  /**
   * Handle component events
   */
  private handleComponentEvent(event: any): void {
    const { component, event: eventName, handler, args } = event;
    
    // Execute handler if it's a store action/mutation
    if (typeof handler === 'string' && this.state.storeManager) {
      const store = this.state.storeManager.getStore();
      
      if (handler.startsWith('commit:')) {
        const mutation = handler.replace('commit:', '');
        store.commit(mutation, args[0]);
      } else if (handler.startsWith('dispatch:')) {
        const action = handler.replace('dispatch:', '');
        store.dispatch(action, args[0]);
      }
    }
    
    // Emit for external handlers
    this.emit('component-event', eventName, component, args);
    this.emit(eventName, ...args);
  }

  /**
   * Main render method
   */
  public render(): void {
    render(this.state);
  }

  /**
   * Run the application
   */
  public run(): void {
    this.render();
    
    // Execute onMount hooks
    if (this.state.schema.hooks?.onMount) {
      const hook = this.state.schema.hooks.onMount;
      // Parse hook for store actions
      const match = hook.match(/dispatch\(['"]([^'"]+)['"]\)/);
      if (match && this.state.storeManager) {
        this.state.storeManager.getStore().dispatch(match[1]);
      }
    }
    
    this.emit('ready');
  }

  /**
   * Get the store
   */
  public get store() {
    return this.state.storeManager?.getStore() || (global as any).$store;
  }

  /**
   * Get state manager (for backward compatibility)
   */
  public get stateManager() {
    return this.store;
  }

  /**
   * Cleanup and destroy
   */
  public destroy(): void {
    this.state.isDestroyed = true;
    this.state.componentAdapter?.destroy();
    this.state.storeManager?.destroy();
    this.state.keyboardHandler?.destroy();
    this.state.screen.cleanup();
    this.removeAllListeners();
  }

  /**
   * Quit the application
   */
  public quit(): void {
    this.destroy();
    process.exit(0);
  }
}