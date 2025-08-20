/**
 * Todo App Components - App-specific implementation
 * Framework không biết gì về những components này
 */

import { Component, RenderContext, ComponentProps } from '../../src/core/Component'

/**
 * App-specific: Dock Layout Component
 * Framework không biết gì về "dock", "top", "bottom" - đây là app logic
 */
export class DockLayout extends Component {
  constructor(props: ComponentProps) {
    super(props)
  }

  render(context: RenderContext): void {
    const { region } = context
    
    // App tự quyết định layout logic
    const topHeight = this.props.topHeight || 3
    const bottomHeight = this.props.bottomHeight || 2
    
    // Render top component
    if (this.props.top) {
      const topComponent = this.findById(this.props.top) || this.children.find(c => c.id === this.props.top)
      if (topComponent) {
        topComponent.render({
          ...context,
          region: { x: region.x, y: region.y, width: region.width, height: topHeight }
        })
      }
    }
    
    // Render center component  
    if (this.props.center) {
      const centerComponent = this.findById(this.props.center) || this.children.find(c => c.id === this.props.center)
      if (centerComponent) {
        centerComponent.render({
          ...context,
          region: { 
            x: region.x, 
            y: region.y + topHeight, 
            width: region.width, 
            height: region.height - topHeight - bottomHeight 
          }
        })
      }
    }
    
    // Render bottom component
    if (this.props.bottom) {
      const bottomComponent = this.findById(this.props.bottom) || this.children.find(c => c.id === this.props.bottom)
      if (bottomComponent) {
        bottomComponent.render({
          ...context,
          region: { 
            x: region.x, 
            y: region.y + region.height - bottomHeight, 
            width: region.width, 
            height: bottomHeight 
          }
        })
      }
    }
  }
}

/**
 * App-specific: Header Component với blue background
 */
export class TodoHeader extends Component {
  constructor(props: ComponentProps) {
    super(props)
  }

  render(context: RenderContext): void {
    const { region } = context
    
    // App tự quyết định styling
    const blueBackground = '\x1b[48;2;0;102;204m'
    const whiteText = '\x1b[37m'
    const reset = '\x1b[0m'
    
    // Fill với blue background
    this.fillRegion(context, { x: 0, y: 0, width: region.width, height: region.height }, ' ', blueBackground)
    
    // Render title với computed stats
    const title = this.props.title || 'Todo App'
    const stats = this.computeStats()
    const text = `${title} - ${stats}`
    
    this.writeText(context, text, 0, 0, blueBackground + whiteText)
  }
  
  private computeStats(): string {
    // Business logic để tính stats từ global state
    const store = (global as any).$store
    if (store?.state?.todos) {
      const todos = store.state.todos
      const completed = todos.filter((t: any) => t.completed).length
      return `${completed}/${todos.length}`
    }
    return '0/0'
  }
}

/**
 * App-specific: Input Field với border styling
 */
export class TodoInput extends Component {
  private inputText = ''
  private cursorPos = 0
  
  constructor(props: ComponentProps) {
    super({ focusable: true, ...props })
  }

  render(context: RenderContext): void {
    const { region } = context
    
    // App tự quyết định border và colors
    this.drawBox(context, { x: 0, y: 0, width: region.width, height: 3 }, 'single')
    
    // Placeholder text
    const placeholder = this.props.placeholder || 'What needs to be done?'
    const displayText = this.inputText || placeholder
    const textStyle = this.inputText ? '\x1b[37m' : '\x1b[90m' // white hoặc gray
    
    this.writeText(context, displayText, 2, 1, textStyle)
    
    // Cursor nếu focused
    if (context.focused || this.focused) {
      context.screen.setCursorPosition(
        context.region.x + 2 + this.cursorPos,
        context.region.y + 1
      )
    }
  }
  
  handleKeypress(char: string, key: any): boolean {
    if (key?.name === 'return' && this.inputText.trim()) {
      this.emit('submit', this.inputText.trim())
      this.inputText = ''
      this.cursorPos = 0
      return true
    }
    
    if (key?.name === 'backspace' && this.cursorPos > 0) {
      this.inputText = this.inputText.slice(0, this.cursorPos - 1) + this.inputText.slice(this.cursorPos)
      this.cursorPos--
      return true
    }
    
    if (char && char.length === 1 && char >= ' ' && char <= '~') {
      this.inputText = this.inputText.slice(0, this.cursorPos) + char + this.inputText.slice(this.cursorPos)
      this.cursorPos++
      return true
    }
    
    return false
  }
  
  getCursorPosition(): { x: number; y: number } | null {
    if (this.focused) {
      return { x: 2 + this.cursorPos, y: 1 }
    }
    return null
  }
}

/**
 * App-specific: Todo List với custom todo rendering
 */
export class TodoList extends Component {
  constructor(props: ComponentProps) {
    super({ focusable: true, ...props })
  }

  render(context: RenderContext): void {
    const { region } = context
    
    // App tự quyết định list styling
    this.drawBox(context, { x: 0, y: 0, width: region.width, height: 3 }, 'single')
    
    // Get todos từ global state
    const store = (global as any).$store
    let todos: any[] = []
    
    if (store?.state?.todos) {
      const filter = store.state.filter || 'all'
      const allTodos = store.state.todos
      
      switch (filter) {
        case 'all': todos = allTodos; break
        case 'active': todos = allTodos.filter((t: any) => !t.completed); break
        case 'completed': todos = allTodos.filter((t: any) => t.completed); break
      }
    }
    
    // Render first todo với focus highlight
    if (todos.length > 0) {
      const todo = todos[0]
      const checkbox = todo.completed ? '[✓]' : '[ ]'
      const text = `${checkbox} ${todo.text}`
      const textColor = todo.completed ? '\x1b[90m' : '\x1b[37m' // gray or white
      
      // Yellow highlight nếu focused
      if (context.focused || this.focused) {
        this.fillRegion(context, { x: 1, y: 1, width: region.width - 2, height: 1 }, ' ', '\x1b[48;2;255;255;0m')
        this.writeText(context, text, 2, 1, '\x1b[48;2;255;255;0m\x1b[30m') // yellow bg, black text
      } else {
        this.writeText(context, text, 2, 1, textColor)
      }
    }
  }
  
  handleKeypress(char: string, key: any): boolean {
    if (key?.name === 'return') {
      this.emit('toggle-todo')
      return true
    }
    return false
  }
}

/**
 * App-specific: Filter Bar với gray background
 */
export class FilterBar extends Component {
  constructor(props: ComponentProps) {
    super(props)
    
    // Tạo button children
    this.addChild(new FilterButton({ id: 'all-btn', label: 'All', filter: 'all', focusable: true }))
    this.addChild(new FilterButton({ id: 'active-btn', label: 'Active', filter: 'active', focusable: true }))
    this.addChild(new FilterButton({ id: 'completed-btn', label: 'Completed', filter: 'completed', focusable: true }))
  }

  render(context: RenderContext): void {
    const { region } = context
    
    // App tự quyết định gray background
    const grayBackground = '\x1b[48;2;240;240;240m'
    this.fillRegion(context, { x: 0, y: 0, width: region.width, height: region.height }, ' ', grayBackground)
    
    // Render buttons ngang hàng
    let x = 2
    for (const button of this.children) {
      const buttonWidth = (button.props.label?.length || 0) + 4
      button.render({
        ...context,
        region: { x: context.region.x + x, y: context.region.y + 1, width: buttonWidth, height: 1 }
      })
      x += buttonWidth + 2
    }
  }
}

/**
 * App-specific: Filter Button
 */
export class FilterButton extends Component {
  constructor(props: ComponentProps) {
    super({ focusable: true, ...props })
  }

  render(context: RenderContext): void {
    const label = this.props.label || 'Button'
    const style = '\x1b[37m\x1b[90m' // white + dim
    
    this.writeText(context, ` ${label} `, 0, 0, style)
  }
  
  handleKeypress(char: string, key: any): boolean {
    if (key?.name === 'return' || char === ' ') {
      this.emit('click', this.props.filter)
      return true
    }
    return false
  }
}

/**
 * App-specific: Stack Layout
 */
export class StackLayout extends Component {
  render(context: RenderContext): void {
    const { region } = context
    let currentY = 0
    
    for (const child of this.children) {
      const childHeight = this.getChildHeight(child)
      
      child.render({
        ...context,
        region: { 
          x: region.x, 
          y: region.y + currentY, 
          width: region.width, 
          height: childHeight 
        }
      })
      
      currentY += childHeight
    }
  }
  
  private getChildHeight(child: Component): number {
    // App tự quyết định child heights
    if (child instanceof TodoInput) return 3
    if (child instanceof TodoList) return 3
    return 1
  }
}