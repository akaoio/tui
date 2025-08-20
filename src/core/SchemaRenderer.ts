import { EventEmitter } from 'events'
import { ScreenManager } from './ScreenManager'
import { MetaSchemaEngine } from './MetaSchema'
import { Store } from './StateManager'
import { LayoutEngine, LayoutNode, ComputedBox } from './LayoutEngine'
import { color, Color } from '../utils/colors'

export interface SchemaApp {
  name: string
  version: string
  store?: any
  components?: Record<string, any>
  screens?: Record<string, any>
  main?: string | any
  hooks?: {
    onMount?: string
    onUpdate?: string
  }
  keybindings?: Record<string, string | Function>
  layout?: any
}

export class SchemaRenderer extends EventEmitter {
  private screen: ScreenManager
  private engine: MetaSchemaEngine
  private stateManager: Store
  private layoutEngine: LayoutEngine
  private schema: SchemaApp
  private components: Map<string, any> = new Map()
  private layoutTree: LayoutNode | null = null
  private focusableElements: string[] = []
  private currentFocus = 0
  private inputMode = false
  private inputText = ''
  private editingTodoId: string | null = null

  constructor(schema: SchemaApp) {
    super()
    this.schema = schema
    this.screen = ScreenManager.getInstance()
    this.engine = new MetaSchemaEngine()
    const { width, height } = this.screen.getDimensions()
    this.layoutEngine = new LayoutEngine(width, height)
    this.stateManager = new Store({
      state: {},
      strict: false
    })
    
    this.initialize()
    this.setupEventHandlers()
  }

  private initialize(): void {
    // Register store
    if (this.schema.store) {
      this.createReactiveStore(this.schema.store)
    }

    // Register components
    if (this.schema.components) {
      for (const [name, componentSchema] of Object.entries(this.schema.components)) {
        this.engine.register(componentSchema)
        
        const component = this.createComponent(componentSchema)
        this.components.set(name, component)
        
        // Track focusable elements
        if (this.isFocusable(component)) {
          this.focusableElements.push(name)
        }
        
        // Track child focusable elements
        if (component.children) {
          component.children.forEach((child: any, index: number) => {
            if (this.isFocusable(child)) {
              this.focusableElements.push(`${name}.child.${index}`)
            }
          })
        }
      }
    }

    // Initialize main screen
    if (this.schema.main) {
      const mainScreen = typeof this.schema.main === 'string' 
        ? this.components.get(this.schema.main) || this.schema.screens?.[this.schema.main]
        : this.schema.main
      
      if (mainScreen && mainScreen.$id) {
        this.engine.register(mainScreen)
      }
    }
  }

  private createComponent(schema: any): any {
    const component = { ...schema }
    
    // Initialize default props
    if (component.props) {
      component._props = {}
      for (const [propName, propDef] of Object.entries(component.props)) {
        const def = propDef as any
        if (def.default !== undefined) {
          component._props[propName] = def.default
        }
      }
    }
    
    return component
  }

  private createReactiveStore(storeSchema: any): void {
    const storeId = storeSchema.$id || 'store'
    if (!storeSchema.$id) {
      storeSchema.$id = storeId
    }
    
    // Create a simple store object instead of using the engine
    const store = {
      state: {},
      getters: {},
      commit: (mutationName: string, payload?: any) => {},
      dispatch: (actionName: string, payload?: any) => {}
    }
    
    // Ensure state exists
    if (!store.state) {
      store.state = {}
    }

    // Initialize default values
    if (storeSchema.properties) {
      for (const [key, prop] of Object.entries(storeSchema.properties)) {
        const propDef = prop as any
        if (propDef.default !== undefined) {
          (store.state as any)[key] = propDef.default
        }
      }
    }

    // Initialize getters
    if (storeSchema.getters) {
      store.getters = {}
      for (const [name, getter] of Object.entries(storeSchema.getters)) {
        const getterDef = getter as any
        Object.defineProperty(store.getters, name, {
          get: () => {
            try {
              const handler = getterDef.handler
              if (typeof handler === 'string' && handler.startsWith('function')) {
                const match = handler.match(/function\s*\([^)]*\)\s*\{([\s\S]*)\}$/);
                if (match) {
                  const funcBody = match[1]
                  const func = new Function(funcBody)
                  return func.call({ state: store.state, getters: store.getters })
                }
              }
              return undefined
            } catch (error) {
              return undefined
            }
          }
        })
      }
    }

    // Add mutations
    store.commit = (mutationName: string, payload?: any) => {
      const mutation = storeSchema.mutations?.[mutationName]
      if (mutation) {
        try {
          const handler = mutation.handler
          if (typeof handler === 'string' && handler.startsWith('function')) {
            // Extract function parameters and body
            const match = handler.match(/function\s*\(([^)]*)\)\s*\{([\s\S]*)\}$/);
            if (match) {
              const params = match[1].split(',').map((p: string) => p.trim())
              const funcBody = match[2]
              
              // Create function with proper parameter names and context
              if (params.length === 1) {
                // Single parameter (state)
                const func = new Function('state', funcBody)
                func.call({ state: store.state, getters: store.getters }, store.state)
              } else if (params.length === 2) {
                // Two parameters (state, payload)
                const func = new Function('state', params[1], funcBody)
                func.call({ state: store.state, getters: store.getters }, store.state, payload)
              }
              this.render() // Re-render on state change
              this.emit('state-change') // Emit event for external handlers
            }
          }
        } catch (error) {
          console.error(`Mutation error (${mutationName}):`, error)
        }
      }
    }

    // Add actions
    store.dispatch = async (actionName: string, payload?: any) => {
      const action = storeSchema.actions?.[actionName]
      if (action) {
        try {
          const handler = action.handler
          if (typeof handler === 'string') {
            // Create context object
            const context = {
              state: store.state,
              getters: store.getters,
              commit: store.commit,
              dispatch: store.dispatch
            }
            
            if (handler.includes('async')) {
              // Async action - extract function body
              const bodyMatch = handler.match(/async\s+function\s*\([^)]*\)\s*\{([\s\S]*)\}$/)
              if (bodyMatch) {
                const funcBody = bodyMatch[1]
                const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
                const func = new AsyncFunction('{ state, getters, commit, dispatch }', 'payload', funcBody)
                const result = await func.call(context, context, payload)
                this.render()
                return result
              }
            } else {
              // Sync action - extract function body
              const bodyMatch = handler.match(/function\s*\([^)]*\)\s*\{([\s\S]*)\}$/)
              if (bodyMatch) {
                const funcBody = bodyMatch[1]
                // Create function that destructures the context parameter
                const func = new Function('context', `
                  const { state, getters, commit, dispatch } = context;
                  ${funcBody}
                `)
                const result = func.call(context, context)
                this.render()
                return result
              }
            }
          }
        } catch (error) {
          console.error('Action error:', error)
        }
      }
    }

    // Store reference in stateManager
    this.stateManager = store as any

    // Make globally accessible
    ;(global as any).$store = store
  }

  private isFocusable(component: any): boolean {
    return component.type === 'text' || component.type === 'button' || component.type === 'list'
  }

  private setupEventHandlers(): void {
    this.screen.on('keypress', (char: string, key: any) => {
      // Debug logging
      if (process.env.DEBUG_KEYS) {
        console.error('Key pressed:', { char, key: key?.name, ctrl: key?.ctrl, shift: key?.shift })
      }
      
      if (char === 'q' || key?.name === 'escape') {
        this.emit('quit')
        return
      }

      // Ctrl+K cursor mode toggle - we need to handle re-render
      if (key?.ctrl && key?.name === 'k') {
        // Let ScreenManager handle the cursor mode toggle first
        // Then re-render to show the cursor mode status
        setTimeout(() => {
          this.render()
          // Show cursor mode status
          const cursorMode = (this.screen as any).cursorMode
          const statusMsg = cursorMode ? ' CURSOR MODE ON - Use WASD/arrows, Space to click, Ctrl+K to exit ' : ' CURSOR MODE OFF '
          const { height } = this.screen.getDimensions()
          this.screen.write(statusMsg, 0, height - 1, '\x1b[43m\x1b[30m') // Yellow background, black text
          ;(this.screen as any).flush()
        }, 10)
        return
      }

      // Tab navigation - toggle between input and list
      if (key?.name === 'tab') {
        // Simple toggle: if in input mode, exit it; otherwise enter it
        if (this.inputMode) {
          this.inputMode = false
          this.inputText = ''
          this.editingTodoId = null
          this.screen.setCursorVisible(false)
        } else {
          this.inputMode = true
          this.inputText = ''
          this.editingTodoId = null
          this.screen.setCursorVisible(true)
        }
        this.render()
        return
      }

      // Text input mode
      if (this.inputMode) {
        this.handleTextInput(char, key)
        return
      }

      // Enter key
      if (key?.name === 'return' || key?.name === 'enter') {
        this.handleEnterPress()
        return
      }
      
      // Handle schema-defined keybindings and keyboard shortcuts
      const store = (global as any).$store
      if (store) {
        // Handle number keys for filter switching
        if (char === '1') {
          store.commit('SET_FILTER', 'all')
          this.render()
          return
        } else if (char === '2') {
          store.commit('SET_FILTER', 'active')
          this.render()
          return
        } else if (char === '3') {
          store.commit('SET_FILTER', 'completed')
          this.render()
          return
        }
        
        // Handle delete key
        if (char === 'd') {
          const filtered = store.getters.filteredTodos || []
          const selected = filtered[store.state.selectedIndex]
          if (selected) {
            store.commit('DELETE_TODO', selected.id)
            this.render()
          }
          return
        }
        
        // Handle space for toggle
        if (char === ' ') {
          const filtered = store.getters.filteredTodos || []
          const selected = filtered[store.state.selectedIndex]
          if (selected) {
            store.commit('TOGGLE_TODO', selected.id)
            this.render()
          }
          return
        }
        
        // Handle arrow navigation
        if (key?.name === 'up') {
          store.commit('MOVE_SELECTION', -1)
          this.render()
          return
        } else if (key?.name === 'down') {
          store.commit('MOVE_SELECTION', 1)
          this.render()
          return
        }
        
        // Handle 'a' for add
        if (char === 'a') {
          // Switch to input mode for adding
          this.inputMode = true
          this.inputText = ''
          this.editingTodoId = null
          this.render()
          return
        }
        
        // Handle 'e' for edit
        if (char === 'e') {
          const filtered = store.getters.filteredTodos || []
          const selected = filtered[store.state.selectedIndex]
          if (selected) {
            // Switch to input mode for editing
            this.inputMode = true
            this.inputText = selected.text
            this.editingTodoId = selected.id
            this.render()
          }
          return
        }
      }
      
      // Handle schema-defined keybindings
      if (this.schema.keybindings) {
        const keyName = key?.name || char
        const binding = this.schema.keybindings?.[keyName]
        if (binding) {
          if (typeof binding === 'string') {
            // Map binding names to actions
            switch (binding) {
              case 'quit':
                this.emit('quit')
                break
              case 'toggleSelected':
                store?.dispatch('toggleSelected')
                this.render()
                break
              case 'deleteSelected':
                store?.dispatch('deleteSelected')
                this.render()
                break
              case 'moveUp':
                store?.commit('MOVE_SELECTION', -1)
                this.render()
                break
              case 'moveDown':
                store?.commit('MOVE_SELECTION', 1)
                this.render()
                break
              case 'filterAll':
                store?.commit('SET_FILTER', 'all')
                this.render()
                break
              case 'filterActive':
                store?.commit('SET_FILTER', 'active')
                this.render()
                break
              case 'filterCompleted':
                store?.commit('SET_FILTER', 'completed')
                this.render()
                break
              default:
                // Try to execute as action or mutation
                if (store) {
                  if (store.dispatch && typeof store.dispatch === 'function') {
                    store.dispatch(binding)
                  } else if (store.commit && typeof store.commit === 'function') {
                    store.commit(binding)
                  }
                  this.render()
                }
            }
          } else if (typeof binding === 'function') {
            binding.call(this, this.stateManager)
            this.render()
          }
          return
        }
      }

      // Emit business logic events
      this.emit('keypress', char, key)
    })

    this.screen.on('resize', () => {
      this.render()
    })
  }

  private handleTabNavigation(reverse: boolean = false): void {
    if (this.focusableElements.length === 0) return
    
    if (reverse) {
      this.currentFocus = this.currentFocus === 0 
        ? this.focusableElements.length - 1 
        : this.currentFocus - 1
    } else {
      this.currentFocus = (this.currentFocus + 1) % this.focusableElements.length
    }
    
    // Handle input mode toggle for input fields
    const focused = this.focusableElements[this.currentFocus]
    const component = this.components.get(focused.split('.')[0]) // Get parent component name
    if (component && component.type === 'text') {
      this.inputMode = !this.inputMode
      this.screen.setCursorVisible(this.inputMode)
    }
    
    this.render()
  }

  private handleTextInput(char: string, key: any): void {
    const store = (global as any).$store
    
    if (key?.name === 'return' || key?.name === 'enter') {
      if (this.inputText.trim()) {
        if (store) {
          if (this.editingTodoId) {
            // Edit existing todo
            const todo = store.state.todos.find((t: any) => t.id === this.editingTodoId)
            if (todo) {
              todo.text = this.inputText.trim()
              todo.updatedAt = new Date().toISOString()
              this.emit('state-change')
            }
          } else {
            // Add new todo
            store.commit('SET_INPUT', this.inputText.trim())
            store.dispatch('addTodo')
          }
        }
        this.emit('input-submit', this.inputText.trim())
        this.inputText = ''
        this.editingTodoId = null
      }
      this.inputMode = false
      this.screen.setCursorVisible(false)
      this.render()
    } else if (key?.name === 'escape') {
      this.inputMode = false
      this.inputText = ''
      this.editingTodoId = null
      if (store) {
        store.commit('SET_INPUT', '')
      }
      this.screen.setCursorVisible(false)
      this.render()
    } else if (key?.name === 'backspace') {
      this.inputText = this.inputText.slice(0, -1)
      if (store) {
        store.commit('SET_INPUT', this.inputText)
      }
      this.render()
    } else if (char && char.length === 1 && char >= ' ' && char <= '~') {
      this.inputText += char
      if (store) {
        store.commit('SET_INPUT', this.inputText)
      }
      this.render()
    }
  }

  private handleEnterPress(): void {
    const focused = this.focusableElements[this.currentFocus]
    
    // Handle button clicks
    if (focused.includes('.child.')) {
      const [parentName, , childIndex] = focused.split('.')
      const parent = this.components.get(parentName)
      if (parent?.children) {
        const child = parent.children[parseInt(childIndex)]
        if (child?.type === 'button') {
          this.emit('button-click', child.props?.label || 'button', child)
        }
      }
    } else {
      const component = this.components.get(focused)
      if (component?.type === 'button') {
        this.emit('button-click', component.props?.label || 'button', component)
      }
    }
  }

  public render(): void {
    const { width, height } = this.screen.getDimensions()
    this.screen.clear()
    
    // Update layout engine dimensions
    this.layoutEngine.updateDimensions(width, height)

    // Use layout definition if available
    if (this.schema.layout) {
      // Build layout tree from layout definition
      this.layoutTree = this.buildLayoutTree(this.schema.layout)
      
      // Compute layout
      if (this.layoutTree) {
        this.layoutEngine.computeLayout(this.layoutTree)
        
        // Render the computed layout
        this.renderLayoutNode(this.layoutTree)
      }
    } else if (this.schema.screens?.main || this.schema.main) {
      const mainScreen = this.schema.screens?.main || this.schema.main
      
      // Build layout tree
      this.layoutTree = this.buildLayoutTree(mainScreen)
      
      // Compute layout
      if (this.layoutTree) {
        this.layoutEngine.computeLayout(this.layoutTree)
        
        // Render the computed layout
        this.renderLayoutNode(this.layoutTree)
      }
    }

    ;(this.screen as any).flush()
  }
  
  private buildLayoutTree(node: any): LayoutNode {
    // Handle component reference in layout
    if (node.component) {
      const component = this.components.get(node.component)
      if (component) {
        const layoutNode: LayoutNode = {
          type: component.type || 'container',
          props: {
            ...component.style,
            ...component.props,
            ...node, // Include layout-specific props like height, flex
            $id: component.$id,
            template: component.template,
            data: component.data,
            selectedIndex: component.selectedIndex,
            itemTemplate: component.itemTemplate,
            buttons: component.buttons,
            selected: component.selected,
            events: component.events,
            value: component.props?.value,
            placeholder: component.props?.placeholder
          }
        }
        
        // Process component children if any
        if (component.children) {
          layoutNode.children = Array.isArray(component.children)
            ? component.children.map((child: any) => this.buildLayoutTree(child))
            : [this.buildLayoutTree(component.children)]
        }
        
        return layoutNode
      }
    }
    
    // Resolve references
    if (typeof node === 'string') {
      node = this.components.get(node)
    } else if (node.$ref) {
      node = this.resolveReference(node.$ref)
    }
    
    // Build tree node
    const layoutNode: LayoutNode = {
      type: node.type || 'container',
      props: { ...node.props, ...node }
    }
    
    // Process children
    if (node.props?.children) {
      layoutNode.children = Array.isArray(node.props.children)
        ? node.props.children.map((child: any) => this.buildLayoutTree(child))
        : [this.buildLayoutTree(node.props.children)]
    } else if (node.children) {
      layoutNode.children = Array.isArray(node.children)
        ? node.children.map((child: any) => this.buildLayoutTree(child))
        : [this.buildLayoutTree(node.children)]
    }
    
    return layoutNode
  }
  
  private resolveReference(ref: string): any {
    const path = ref.replace('#/', '').split('/')
    let current: any = this.schema
    for (const segment of path) {
      current = current[segment]
      if (!current) return null
    }
    return current
  }
  
  private renderLayoutNode(node: LayoutNode): void {
    if (!node.computed) return
    
    const { borderBox, contentBox } = node.computed
    
    // Render border if needed
    if (node.props?.border || node.props?.style?.border) {
      const title = node.props?.title ? this.resolveValue(node.props.title) : ''
      const borderStyle = node.props?.style?.border || node.props?.border || 'single'
      this.drawBox(
        borderBox.x,
        borderBox.y,
        borderBox.width,
        borderBox.height,
        title || '',
        borderStyle === true ? 'single' : borderStyle
      )
    }
    
    // Render content based on type
    switch (node.type) {
      case 'text':
        // Text with template should use renderTemplate
        if (node.props?.template) {
          this.renderTemplate(node, contentBox)
        } else if (node.props?.text) {
          this.renderText(node, contentBox)
        }
        break
      case 'list':
        this.renderList(node, contentBox)
        break
      case 'input':
        this.renderInput(node, contentBox)
        break
      case 'buttonGroup':
        this.renderButtonGroup(node, contentBox)
        break
      case 'container':
        // Container with template
        if (node.props?.template) {
          this.renderTemplate(node, contentBox)
        }
        break
      case 'panel':
        // Panel is a container - children will be rendered below
        break
      case 'grid':
      case 'stack':
      case 'dock':
      case 'flexbox':
        // Layout containers - children will be rendered below
        break
      default:
        // Unknown types - try to render as text if there's text prop or template
        if (node.props?.text) {
          this.renderText(node, contentBox)
        } else if (node.props?.template) {
          this.renderTemplate(node, contentBox)
        }
        break
    }
    
    // Always render children if they exist
    if (node.children) {
      for (const child of node.children) {
        this.renderLayoutNode(child)
      }
    }
  }

  private registerComponentsWithScreenManager(): void {
    // Clear existing registrations to avoid conflicts
    for (const compId of this.focusableElements) {
      this.screen.unregisterComponent(compId)
    }

    // Register current focusable components with ScreenManager
    // This allows mouse events to work properly
    for (const compId of this.focusableElements) {
      const comp = this.components.get(compId)
      if (comp) {
        // Create a mock component region for ScreenManager
        const region = this.getComponentRegion(compId)
        if (region) {
          const mockComponent = {
            render: () => {}, // Already rendered by SchemaRenderer
            handleInput: () => false,
            handleMouse: (event: any) => {
              // Focus this component when clicked
              this.currentFocus = this.focusableElements.indexOf(compId)
              this.render()
              return true
            },
            isFocusable: true
          }
          this.screen.registerComponent(compId, mockComponent, region)
        }
      }
    }
  }

  private getComponentRegion(compId: string): any {
    // Calculate region for a component - simplified implementation
    // This would need proper region tracking in real implementation
    const { width, height } = this.screen.getDimensions()
    
    if (compId === 'TodoInput') {
      return { x: 0, y: 4, width: width, height: 3 }
    } else if (compId === 'TodoList') {
      return { x: 0, y: 7, width: width, height: 3 }
    } else if (compId.includes('FilterBar.child.')) {
      const index = parseInt(compId.split('.')[2])
      return { x: 2 + index * 10, y: height - 2, width: 8, height: 1 }
    }
    
    return { x: 0, y: 0, width: 10, height: 1 }
  }

  private renderComponent(component: any, region: any): void {
    if (!component) return

    const { x, y, width, height } = region
    const isFocused = this.isComponentFocused(component)

    // Apply styles with focus
    if (component.style) {
      this.applyStyles(component.style, region, isFocused)
    }

    // Render based on type
    switch (component.type) {
      case 'text':
        this.renderText(component, region)
        break
      case 'list':
        this.renderList(component, region)
        break
      case 'button':
        this.renderButton(component, region, isFocused)
        break
      case 'panel':
        this.renderPanel(component, region)
        break
      case 'custom':
        if (component.template) {
          this.renderTemplate(component, region)
        } else if (component.children) {
          this.renderChildren(component.children, region, component.name)
        }
        break
      default:
        // Check layout first for components without explicit type
        if (component.layout) {
          this.renderLayout(component.layout, region)
        } else if (component.template) {
          this.renderTemplate(component, region)
        } else if (component.children) {
          this.renderChildren(component.children, region, component.name)
        }
    }
  }

  private isComponentFocused(component: any): boolean {
    if (this.focusableElements.length === 0) return false
    const focused = this.focusableElements[this.currentFocus]
    
    // Check direct component focus
    for (const [name, comp] of this.components.entries()) {
      if (comp === component && focused === name) return true
    }
    
    return false
  }

  private renderLayout(layout: any, region: any): void {
    switch (layout.type) {
      case 'dock':
        this.renderDockLayout(layout.dock, region)
        break
      case 'stack':
        this.renderStackLayout(layout, region)
        break
      case 'grid':
        this.renderGridLayout(layout, region)
        break
    }
  }

  private renderDockLayout(dock: any, region: any): void {
    const { x, y, width, height } = region
    let contentY = y
    let contentHeight = height

    if (dock.top) {
      const topComponent = this.getComponent(dock.top)
      if (topComponent) {
        const topHeight = topComponent.style?.height || 3
        this.renderComponent(topComponent, { x, y: contentY, width, height: topHeight })
        contentY += topHeight
        contentHeight -= topHeight
      }
    }

    if (dock.center) {
      const centerHeight = contentHeight - (dock.bottom ? 3 : 0)
      
      if (typeof dock.center === 'string') {
        // It's a component name
        const centerComponent = this.getComponent(dock.center)
        if (centerComponent) {
          this.renderComponent(centerComponent, { x, y: contentY, width, height: centerHeight })
        }
      } else if (dock.center.$type === 'layout' || dock.center.type) {
        // It's a layout object
        this.renderLayout(dock.center, { x, y: contentY, width, height: centerHeight })
      }
      
      contentY += centerHeight
    }

    if (dock.bottom) {
      const bottomComponent = this.getComponent(dock.bottom)
      if (bottomComponent) {
        const bottomHeight = 3
        this.renderComponent(bottomComponent, { x, y: height - bottomHeight, width, height: bottomHeight })
      }
    }
  }

  private renderStackLayout(layout: any, region: any): void {
    const { x, y, width, height } = region
    let currentY = y

    for (const item of layout.children || []) {
      const component = this.getComponent(item)
      if (component) {
        const itemHeight = this.calculateComponentHeight(component, height - (currentY - y))
        this.renderComponent(component, { x, y: currentY, width, height: itemHeight })
        currentY += itemHeight
      }
    }
  }

  private renderGridLayout(layout: any, region: any): void {
    const { x, y, width, height } = region
    const rows = layout.props?.rows || 2
    const cols = layout.props?.cols || 2
    const gap = layout.props?.gap || 1
    const children = layout.props?.children || []
    
    const cellWidth = Math.floor((width - (cols - 1) * gap) / cols)
    const cellHeight = Math.floor((height - (rows - 1) * gap) / rows)
    
    let index = 0
    for (let row = 0; row < rows && index < children.length; row++) {
      for (let col = 0; col < cols && index < children.length; col++) {
        const child = children[index++]
        if (child) {
          const cellX = x + col * (cellWidth + gap)
          const cellY = y + row * (cellHeight + gap)
          
          if (child.$ref) {
            const refPath = child.$ref.replace('#/', '').split('/')
            let component: any = this.schema
            for (const part of refPath) {
              component = component[part]
            }
            if (component) {
              this.renderComponent(component, { x: cellX, y: cellY, width: cellWidth, height: cellHeight })
            }
          } else {
            this.renderComponent(child, { x: cellX, y: cellY, width: cellWidth, height: cellHeight })
          }
        }
      }
    }
  }

  private renderPanel(component: any, region: any): void {
    const { x, y, width, height } = region
    const title = this.resolveValue(component.props?.title || '')
    const border = component.props?.border !== false
    const children = component.props?.children || []
    
    if (border) {
      // Draw border
      this.drawBox(x, y, width, height, title)
      
      // Render children inside border
      const innerRegion = { x: x + 1, y: y + 1, width: width - 2, height: height - 2 }
      if (Array.isArray(children)) {
        let childY = innerRegion.y
        for (const child of children) {
          const childHeight = 1 // Each text line takes 1 row
          this.renderComponent(child, { x: innerRegion.x, y: childY, width: innerRegion.width, height: childHeight })
          childY += childHeight
        }
      } else {
        this.renderComponent(children, innerRegion)
      }
    } else {
      // No border, just render children
      if (Array.isArray(children)) {
        let childY = y
        for (const child of children) {
          const childHeight = 1
          this.renderComponent(child, { x, y: childY, width, height: childHeight })
          childY += childHeight
        }
      } else {
        this.renderComponent(children, region)
      }
    }
  }

  private getBoxChars(style: string = 'single'): any {
    const styles: Record<string, any> = {
      single: {
        topLeft: '┌', topRight: '┐',
        bottomLeft: '└', bottomRight: '┘',
        horizontal: '─', vertical: '│'
      },
      double: {
        topLeft: '╔', topRight: '╗',
        bottomLeft: '╚', bottomRight: '╝',
        horizontal: '═', vertical: '║'
      },
      rounded: {
        topLeft: '╭', topRight: '╮',
        bottomLeft: '╰', bottomRight: '╯',
        horizontal: '─', vertical: '│'
      }
    }
    return styles[style] || styles.single
  }
  
  private drawBox(x: number, y: number, width: number, height: number, title: string = '', style: string = 'single'): void {
    // Ensure minimum dimensions
    if (width < 3 || height < 3) return
    
    const chars = this.getBoxChars(style)
    
    // Top border with title
    let topLine = chars.topLeft
    const innerWidth = width - 2 // Space between corners
    
    if (title && title.length > 0) {
      // Calculate how much space we have for the title
      const maxTitleLen = innerWidth - 4 // Need spaces around title
      const displayTitle = title.length > maxTitleLen ? title.substring(0, maxTitleLen) : title
      const totalDashes = innerWidth - displayTitle.length - 2 // -2 for spaces around title
      const leftDashes = Math.floor(totalDashes / 2)
      const rightDashes = Math.ceil(totalDashes / 2)
      
      topLine += chars.horizontal.repeat(leftDashes) + ' ' + displayTitle + ' ' + chars.horizontal.repeat(rightDashes)
    } else {
      topLine += chars.horizontal.repeat(innerWidth)
    }
    topLine += chars.topRight
    this.screen.write(topLine, x, y)
    
    // Side borders
    for (let i = 1; i < height - 1; i++) {
      this.screen.write(chars.vertical, x, y + i)
      this.screen.write(chars.vertical, x + width - 1, y + i)
    }
    
    // Bottom border
    this.screen.write(chars.bottomLeft + chars.horizontal.repeat(width - 2) + chars.bottomRight, x, y + height - 1)
  }

  private calculateComponentHeight(component: any, availableHeight: number): number {
    if (component.style?.height) {
      return typeof component.style.height === 'number' ? component.style.height : 3
    }
    return 3
  }

  private getComponent(nameOrComponent: string | any): any {
    if (typeof nameOrComponent === 'string') {
      return this.components.get(nameOrComponent)
    }
    return nameOrComponent
  }

  private applyStyles(style: any, region: any, isFocused: boolean = false): void {
    let bgColor = style.background
    
    if (isFocused) {
      bgColor = style.focus?.background || '#ffff00'
    }
    
    if (bgColor) {
      let colorCode = ''
      if (bgColor.startsWith('#')) {
        const hex = bgColor.replace('#', '')
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)
        colorCode = `\x1b[48;2;${r};${g};${b}m`
      } else {
        colorCode = color(undefined, bgColor)
      }
      
      this.screen.fillRegion(region, ' ', colorCode)
    }
  }

  // Old renderTemplate removed - using the new LayoutNode version

  // calculateStats removed - now handled via store getters

  private resolveValue(value: any): any {
    if (value === null || value === undefined) return ''
    if (typeof value !== 'string') return value
    
    // Check if it's a simple template that should return the raw value
    const simpleTemplateMatch = value.match(/^\{\{([^}]+)\}\}$/)
    if (simpleTemplateMatch) {
      const path = simpleTemplateMatch[1].trim()
      const store = (global as any).$store || this.stateManager
      
      if (!store) return ''
      
      // Direct getter reference
      if (store.getters && store.getters[path] !== undefined) {
        return store.getters[path] // Return raw value, not string
      }
      
      // Direct state reference
      if (store.state && store.state[path] !== undefined) {
        return store.state[path] // Return raw value, not string
      }
      
      // Handle complex paths
      try {
        const parts = path.split('.')
        let current = { store, ...store.getters, ...store.state }
        
        for (const part of parts) {
          if (current && typeof current === 'object') {
            current = current[part]
          } else {
            return ''
          }
        }
        
        return current !== undefined ? current : ''
      } catch (e) {
        return ''
      }
    }
    
    // Handle template interpolation for string templates with mixed content
    const resolved = value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const trimmed = path.trim()
      const store = (global as any).$store || this.stateManager
      
      if (!store) return match
      
      // Direct getter reference
      if (store.getters && store.getters[trimmed] !== undefined) {
        return String(store.getters[trimmed])
      }
      
      // Direct state reference
      if (store.state && store.state[trimmed] !== undefined) {
        return String(store.state[trimmed])
      }
      
      // Handle complex paths
      try {
        const parts = trimmed.split('.')
        let current = { store, ...store.getters, ...store.state }
        
        for (const part of parts) {
          if (current && typeof current === 'object') {
            current = current[part]
          } else {
            return match
          }
        }
        
        if (current !== undefined) {
          return String(current)
        }
      } catch (e) {
        // Silent fail
      }
      
      return match
    })
    
    return resolved
  }

  private renderInput(node: LayoutNode, region: any): void {
    const { x, y, width, height } = region
    const store = (global as any).$store
    let placeholder = node.props?.placeholder || 'Enter text...'
    const style = node.props?.style || {}
    
    // Update placeholder based on editing mode
    if (this.inputMode && this.editingTodoId) {
      placeholder = 'Edit todo (Enter to save, Esc to cancel)'
    } else if (this.inputMode) {
      placeholder = 'Add new todo (Enter to save, Esc to cancel)'
    }
    
    // Get current value - use inputText if in input mode, otherwise store value
    const value = this.inputMode ? this.inputText : (store?.state?.inputText || '')
    
    // Draw border if specified
    if (style.border) {
      const borderStyle = style.border === 'single' ? 'single' : style.border
      this.drawBox(x, y, width, height || 3, '', borderStyle)
    }
    
    // Calculate text area inside border
    const textX = style.border ? x + 1 : x
    const textY = style.border ? y + 1 : y
    const textWidth = style.border ? width - 2 : width
    
    // Display value or placeholder
    const displayText = value || placeholder
    const textColor = value ? '\x1b[37m' : '\x1b[90m'
    
    // Clear the line first
    this.screen.write(' '.repeat(textWidth), textX, textY, '')
    
    // Write the text
    const truncated = displayText.length > textWidth - 1 ? displayText.substring(0, textWidth - 2) : displayText
    this.screen.write(truncated, textX, textY, textColor)
    
    // Show cursor if in input mode
    if (this.inputMode) {
      const cursorPos = value.length < textWidth - 1 ? value.length : textWidth - 2
      this.screen.write('▌', textX + cursorPos, textY, '\x1b[93m')
    }
  }
  
  private renderButtonGroup(node: LayoutNode, region: any): void {
    const { x, y, width, height } = region
    const store = (global as any).$store
    const buttons = node.props?.buttons || []
    const selected = this.resolveValue(node.props?.selected || '')
    const style = node.props?.style || {}
    
    // Background
    if (style.background) {
      for (let i = 0; i < (height || 1); i++) {
        this.screen.write(' '.repeat(width), x, y + i, '\x1b[48;5;234m')
      }
    }
    
    // Calculate button positions
    let currentX = x + 2
    buttons.forEach((button: any, index: number) => {
      const isSelected = button.value === selected
      const label = button.label || button.value
      
      if (isSelected) {
        // Selected button
        const buttonText = ` ${label} `
        this.screen.write(buttonText, currentX, y, '\x1b[48;5;25m\x1b[1m\x1b[97m')
        currentX += buttonText.length + 2
      } else {
        // Unselected button  
        const buttonText = ` [${index + 1}] ${label} `
        this.screen.write(buttonText, currentX, y, '\x1b[48;5;234m\x1b[90m')
        currentX += buttonText.length + 2
      }
    })
  }
  
  private renderTemplate(node: LayoutNode, region: any): void {
    const { x, y, width, height } = region
    const template = node.props?.template || ''
    const style = node.props?.style || {}
    
    // Resolve template with store values
    const text = this.resolveValue(template)
    
    if (!text) return // Skip if no text to render
    
    // Apply background if specified
    if (style.background) {
      const bgColor = this.getBackgroundColor(style.background)
      for (let i = 0; i < (height || 1); i++) {
        // Use screen.write properly with x,y coordinates
        this.screen.write(' '.repeat(width), x, y + i, bgColor)
      }
    }
    
    // Split text into lines
    const lines = text.split('\n')
    const padding = style.padding || 0
    const textX = x + padding
    const textY = y + padding
    const maxWidth = width - (padding * 2)
    
    // Render each line
    lines.forEach((line: string, index: number) => {
      if (index >= (height || lines.length) - (padding * 2)) return
      
      const truncated = line.length > maxWidth ? line.substring(0, maxWidth) : line
      const aligned = this.alignText(truncated, maxWidth, style.align || 'left')
      
      const textColor = style.color === 'white' ? '\x1b[97m' : '\x1b[37m'
      const bgColor = style.background ? this.getBackgroundColor(style.background) : ''
      const fullStyle = bgColor + textColor
      
      // Use screen.write with proper x,y coordinates
      this.screen.write(aligned, textX, textY + index, fullStyle)
    })
  }
  
  private getBackgroundColor(color: string): string {
    const colorMap: Record<string, string> = {
      '#1a1a2e': '\x1b[48;5;17m',
      '#0f0f0f': '\x1b[48;5;234m',
      '#222': '\x1b[48;5;235m',
      '#333': '\x1b[48;5;236m',
      '#4a4a4a': '\x1b[48;5;239m'
    }
    return colorMap[color] || '\x1b[48;5;0m'
  }
  
  private alignText(text: string, width: number, align: string): string {
    if (align === 'center') {
      const padding = Math.floor((width - text.length) / 2)
      return ' '.repeat(padding) + text + ' '.repeat(width - text.length - padding)
    } else if (align === 'right') {
      return ' '.repeat(width - text.length) + text
    } else {
      return text + ' '.repeat(width - text.length)
    }
  }

  private renderText(node: LayoutNode, region: any): void {
    const { x, y, width } = region
    const text = this.resolveValue(node.props?.text || '')
    const style = node.props?.style || {}
    
    // Skip empty text
    if (!text || text.trim() === '') {
      return
    }
    
    // IMPORTANT: Ensure we never exceed the content box width
    // This prevents text from overwriting the right border
    const maxWidth = Math.max(0, width)
    
    // Apply color styles
    let colorCode = ''
    if (style.color) {
      const resolvedColor = this.resolveValue(style.color)
      switch(resolvedColor) {
        case 'red': colorCode = '\x1b[31m'; break
        case 'green': colorCode = '\x1b[32m'; break
        case 'yellow': colorCode = '\x1b[33m'; break
        case 'blue': colorCode = '\x1b[34m'; break
        case 'magenta': colorCode = '\x1b[35m'; break
        case 'cyan': colorCode = '\x1b[36m'; break
        case 'gray': case 'grey': colorCode = '\x1b[90m'; break
        default: colorCode = '\x1b[37m'; break
      }
    }
    
    if (style.bold) colorCode += '\x1b[1m'
    if (style.dim) colorCode += '\x1b[2m'
    
    // Truncate text to fit within content box width
    // Remove any trailing spaces that would overflow
    const trimmedText = text.trimEnd()
    const displayText = trimmedText.length > maxWidth ? trimmedText.substring(0, maxWidth) : trimmedText
    
    // Write text with proper color code
    this.screen.write(displayText, x, y, colorCode)
  }

  private renderTextInput(component: any, region: any): void {
    const { x, y, width } = region
    
    if ((component as any).style?.border) {
      this.screen.drawBox(x, y, width, 3, (component as any).style.border.style)
    }
    
    const placeholder = component._props?.placeholder || 'Enter text...'
    const isInputFocused = this.inputMode && this.isCurrentlyFocusedInput()
    const displayText = isInputFocused ? this.inputText : placeholder
    const textColor = isInputFocused ? Color.White : Color.BrightBlack
    
    this.screen.write(' '.repeat(width - 4), x + 2, y + 1, '')
    this.screen.write(displayText, x + 2, y + 1, color(textColor))
    
    if (isInputFocused) {
      this.screen.setCursorPosition(x + 2 + this.inputText.length, y + 1)
    }
  }

  private isCurrentlyFocusedInput(): boolean {
    const focused = this.focusableElements[this.currentFocus]
    return !!(focused && focused.includes('input'))
  }

  private renderList(node: LayoutNode, region: any): void {
    const { x, y, width, height } = region
    const props = node.props || {}
    const style = props.style || {}
    const store = (global as any).$store
    
    // Draw border if specified
    if (style.border) {
      const borderStyle = style.border === 'rounded' ? 'rounded' : style.border
      this.drawBox(x, y, width, height, '', borderStyle)
    }
    
    // Get data from store using the data property
    let items: any[] = []
    if (props.data) {
      const dataValue = this.resolveValue(props.data)
      if (Array.isArray(dataValue)) {
        items = dataValue
      }
    }
    
    // Get selected index from store
    const selectedIndex = this.resolveValue(props.selectedIndex) || 0
    
    // Calculate content area
    const contentX = style.border ? x + 1 : x
    const contentY = style.border ? y + 1 : y
    const contentWidth = style.border ? width - 2 : width
    const contentHeight = style.border ? height - 2 : height
    
    // Handle empty state
    if (items.length === 0) {
      this.screen.write('No items to display', contentX, contentY, '\x1b[90m')
      this.screen.write('Press [a] to add one', contentX, contentY + 1, '\x1b[90m')
      return
    }
    
    // Render items with scrolling support
    const maxVisible = contentHeight
    const startIdx = Math.max(0, selectedIndex - maxVisible + 1)
    const endIdx = Math.min(items.length, startIdx + maxVisible)
    
    let itemY = contentY
    for (let i = startIdx; i < endIdx; i++) {
      const item = items[i]
      const isSelected = i === selectedIndex
      
      // Resolve item template
      let itemText = ''
      if (props.itemTemplate) {
        // Simple template replacement for item properties
        itemText = props.itemTemplate
          .replace('{{completed ? \'[✓]\' : \'[ ]\'}}', item.completed ? '[✓]' : '[ ]')
          .replace('{{text}}', item.text || '')
      } else {
        itemText = JSON.stringify(item)
      }
      
      // Apply styling based on selection and completion
      let bgColor = ''
      let textColor = ''
      
      if (isSelected) {
        bgColor = style.selectedBackground ? this.getBackgroundColor(style.selectedBackground) : '\x1b[48;5;236m'
      }
      
      if (item.completed && style.completedColor === 'gray') {
        textColor = '\x1b[90m'
      } else if (isSelected) {
        textColor = '\x1b[97m'
      } else {
        textColor = '\x1b[37m'
      }
      
      // Clear line and render item
      this.screen.write(' '.repeat(contentWidth), contentX, itemY, bgColor)
      
      const truncated = itemText.length > contentWidth - 2 ? 
        itemText.substring(0, contentWidth - 3) + '...' : itemText
      
      this.screen.write(truncated, contentX + 1, itemY, bgColor + textColor)
      itemY++
    }
    
    // Show scroll indicator if needed
    if (items.length > maxVisible) {
      const scrollText = `${selectedIndex + 1}/${items.length}`
      this.screen.write(scrollText, x + width - scrollText.length - 2, y + height - 1, '\x1b[90m')
    }
  }

  private renderButton(component: any, region: any, isFocused: boolean = false): void {
    const { x, y } = region
    const label = component._props?.label || component.props?.label || 'Button'
    
    let bgColor = Color.BrightBlack
    let textColor = Color.White
    
    if (isFocused) {
      bgColor = Color.BrightYellow
      textColor = Color.Black
    }
    
    const displayText = isFocused ? `[${label}]` : ` ${label} `
    this.screen.write(displayText, x, y, color(textColor as any, bgColor as any))
  }

  private renderChildren(children: any[], region: any, parentName?: string): void {
    const { x, y } = region
    let currentX = x + 2
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child.type === 'button') {
        const childId = parentName ? `${parentName}.child.${i}` : null
        const isFocused = childId && this.focusableElements[this.currentFocus] === childId
        
        const label = child._props?.label || child.props?.label || 'Button'
        this.renderButton(child, { x: currentX, y: y + 1, width: label.length + 4, height: 1 }, !!isFocused)
        currentX += label.length + 6
      }
    }
  }

  public run(): void {
    this.render()
    
    // Run onMount hooks
    if (this.schema.hooks?.onMount) {
      const hook = this.schema.hooks.onMount
      if (typeof hook === 'string' && hook.includes('dispatch')) {
        // Extract action name from hook like "store.dispatch('startMonitoring')"
        const match = hook.match(/dispatch\(['"]([^'"]+)['"]\)/)
        if (match) {
          this.stateManager.dispatch(match[1])
        }
      }
    }
    
    // Emit ready event
    this.emit('ready')
  }

  public get store() {
    return this.stateManager
  }

  public destroy(): void {
    this.screen.cleanup()
  }

  public quit(): void {
    this.screen.cleanup()
    process.exit(0)
  }
}