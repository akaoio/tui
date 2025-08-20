import { EventEmitter } from 'events'
import { ScreenManager } from './ScreenManager'
import { MetaSchemaEngine } from './MetaSchema'
import { Store } from './StateManager'
import { color, Color } from '../utils/colors'

export interface SchemaApp {
  name: string
  version: string
  store?: any
  components?: Record<string, any>
  screens?: Record<string, any>
  main?: string | any
}

export class SchemaRenderer extends EventEmitter {
  private screen: ScreenManager
  private engine: MetaSchemaEngine
  private stateManager: Store
  private schema: SchemaApp
  private components: Map<string, any> = new Map()
  private focusableElements: string[] = []
  private currentFocus = 0
  private inputMode = false
  private inputText = ''

  constructor(schema: SchemaApp) {
    super()
    this.schema = schema
    this.screen = ScreenManager.getInstance()
    this.engine = new MetaSchemaEngine()
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
                const match = handler.match(/function\s*\([^)]*\)\s*\{([\s\S]*)\}/);
                if (match) {
                  const funcBody = match[1].trim()
                  const func = new Function(funcBody)
                  return func.call({ state: store.state })
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
            const match = handler.match(/function\s*\([^)]*\)\s*\{([\s\S]*)\}/);
            if (match) {
              const funcBody = match[1].trim()
              const func = new Function('state', 'payload', funcBody)
              func.call({ state: store.state }, store.state, payload)
              this.render() // Re-render on state change
            }
          }
        } catch (error) {
          // Silently handle mutation errors
        }
      }
    }

    // Make globally accessible
    ;(global as any).$store = store
  }

  private isFocusable(component: any): boolean {
    return component.type === 'text' || component.type === 'button' || component.type === 'list'
  }

  private setupEventHandlers(): void {
    this.screen.on('keypress', (char: string, key: any) => {
      
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

      // Tab navigation
      if (key?.name === 'tab') {
        this.handleTabNavigation(key.shift)
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
    if (key?.name === 'return' || key?.name === 'enter') {
      if (this.inputText.trim()) {
        this.emit('input-submit', this.inputText.trim())
        this.inputText = ''
      }
      this.inputMode = false
      this.screen.setCursorVisible(false)
      this.render()
    } else if (key?.name === 'escape') {
      this.inputMode = false
      this.screen.setCursorVisible(false)
      this.render()
    } else if (key?.name === 'backspace') {
      this.inputText = this.inputText.slice(0, -1)
      this.render()
    } else if (char && char.length === 1 && char >= ' ' && char <= '~') {
      this.inputText += char
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

    if (this.schema.screens?.main || this.schema.main) {
      const mainScreen = this.schema.screens?.main || this.schema.main
      const screenComponent = typeof mainScreen === 'string' 
        ? this.components.get(mainScreen) 
        : mainScreen
        
      this.renderComponent(screenComponent, { x: 0, y: 0, width, height })
    }

    // Don't register with ScreenManager for now - it conflicts with our rendering
    // this.registerComponentsWithScreenManager()

    ;(this.screen as any).flush()
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
        this.renderTextInput(component, region)
        break
      case 'list':
        this.renderList(component, region)
        break
      case 'button':
        this.renderButton(component, region, isFocused)
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

  private renderTemplate(component: any, region: any): void {
    const { x, y } = region
    if (!component.template) return

    let text = component.template

    // Template interpolation
    text = text.replace(/\{\{(.+?)\}\}/g, (match: string, expr: string) => {
      const trimmed = expr.trim()
      
      if (trimmed === 'title') {
        return component._props?.title || component.props?.title || 'App'
      } else if (trimmed === 'stats') {
        return this.calculateStats()
      }
      
      return match
    })

    // Use component's text color or white with background color preserved
    const textColor = component.style?.color || 'white'
    const bgColor = component.style?.background
    
    let styleCode = ''
    if (bgColor && bgColor.startsWith('#')) {
      const hex = bgColor.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      styleCode = `\x1b[48;2;${r};${g};${b}m`
    }
    
    // Add text color
    if (textColor === 'white') {
      styleCode += '\x1b[37m'
    } else if (textColor === 'black') {
      styleCode += '\x1b[30m'
    }

    this.screen.write(text, x, y, styleCode)
  }

  private calculateStats(): string {
    const store = (global as any).$store
    if (store?.state?.todos) {
      const todos = store.state.todos
      const completed = todos.filter((t: any) => t.completed).length
      return `${completed}/${todos.length}`
    }
    return '0/0'
  }

  private renderTextInput(component: any, region: any): void {
    const { x, y, width } = region
    
    if (component.style?.border) {
      this.screen.drawBox(x, y, width, 3, component.style.border.style)
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

  private renderList(component: any, region: any): void {
    const { x, y, width, height } = region
    
    if (component.style?.border) {
      this.screen.drawBox(x, y, width, height, component.style.border.style)
    }
    
    const store = (global as any).$store
    let items: any[] = []
    
    if (store?.state?.todos) {
      const filter = store.state.filter || 'all'
      const allTodos = store.state.todos
      
      switch (filter) {
        case 'all':
          items = allTodos
          break
        case 'active':
          items = allTodos.filter((t: any) => !t.completed)
          break
        case 'completed':
          items = allTodos.filter((t: any) => t.completed)
          break
      }
    }
    
    let itemY = y + 1
    for (const item of items) {
      if (itemY >= y + height - 1) break
      
      const checkbox = item.completed ? '[✓]' : '[ ]'
      const text = `${checkbox} ${item.text}`
      const textColor = item.completed ? Color.BrightBlack : Color.White
      
      this.screen.write(text, x + 2, itemY, color(textColor))
      itemY++
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
  }

  public quit(): void {
    this.screen.cleanup()
    process.exit(0)
  }
}