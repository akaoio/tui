#!/usr/bin/env tsx

/**
 * Professional Todo App - Component-based architecture
 * Full-featured with modals, filtering, CRUD operations
 */

import { App, Component, RenderContext, ComponentProps } from '../../src'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Todo item interface
 */
interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Filter types
 */
type FilterType = 'all' | 'active' | 'completed'

/**
 * Modal Component - Reusable modal dialog
 */
class Modal extends Component {
  private isOpen: boolean = false
  private title: string = ''
  private inputValue: string = ''
  private onConfirm?: (value: string) => void
  private onCancel?: () => void

  open(title: string, defaultValue: string = '', onConfirm?: (value: string) => void, onCancel?: () => void) {
    this.isOpen = true
    this.title = title
    this.inputValue = defaultValue
    this.onConfirm = onConfirm
    this.onCancel = onCancel
  }

  close() {
    this.isOpen = false
    this.inputValue = ''
  }

  handleInput(char: string, key: any): boolean {
    if (!this.isOpen) return false

    if (key?.name === 'escape') {
      this.onCancel?.()
      this.close()
      return true
    }

    if (key?.name === 'return' || key?.name === 'enter') {
      if (this.inputValue.trim()) {
        this.onConfirm?.(this.inputValue.trim())
        this.close()
      }
      return true
    }

    if (key?.name === 'backspace') {
      this.inputValue = this.inputValue.slice(0, -1)
        return true
    }

    if (char && char.length === 1 && char >= ' ' && char <= '~') {
      this.inputValue += char
        return true
    }

    return true
  }

  render(context: RenderContext): void {
    if (!this.isOpen) return

    const { region } = context
    const modalWidth = Math.min(60, region.width - 10)
    const modalHeight = 9
    const x = Math.floor((region.width - modalWidth) / 2)
    const y = Math.floor((region.height - modalHeight) / 2)

    // Clear area first to prevent artifacts
    for (let i = 0; i < modalHeight + 2; i++) {
      this.writeText(context, ' '.repeat(modalWidth + 2), x - 1, y - 1 + i, '')
    }

    // Draw modal background (solid color)
    for (let i = 0; i < modalHeight; i++) {
      this.writeText(context, ' '.repeat(modalWidth), x, y + i, '\x1b[48;5;17m')
    }

    // Draw border with proper box drawing
    this.drawBox(context, { x, y, width: modalWidth, height: modalHeight }, 'double')

    // Title bar with background
    const titleBg = '\x1b[48;5;21m'
    this.writeText(context, ' '.repeat(modalWidth - 2), x + 1, y + 1, titleBg)
    const titleText = this.title
    const titleX = x + Math.floor((modalWidth - titleText.length) / 2)
    this.writeText(context, titleText, titleX, y + 1, `${titleBg}\x1b[1m\x1b[37m`)

    // Input label
    this.writeText(context, 'Enter value:', x + 3, y + 3, '\x1b[48;5;17m\x1b[37m')
    
    // Input field with border
    const inputWidth = modalWidth - 6
    this.drawBox(context, { x: x + 3, y: y + 4, width: inputWidth, height: 3 }, 'single')
    
    // Clear input area
    this.writeText(context, ' '.repeat(inputWidth - 2), x + 4, y + 5, '\x1b[48;5;0m')
    
    // Input value with cursor
    const displayValue = this.inputValue
    const cursorPos = displayValue.length
    this.writeText(context, displayValue, x + 4, y + 5, '\x1b[48;5;0m\x1b[37m')
    
    // Show blinking cursor
    this.writeText(context, '▌', x + 4 + cursorPos, y + 5, '\x1b[48;5;0m\x1b[93m')

    // Instructions at bottom
    const instructions = '[Enter] Save    [Esc] Cancel'
    const instrX = x + Math.floor((modalWidth - instructions.length) / 2)
    this.writeText(context, instructions, instrX, y + modalHeight - 2, '\x1b[48;5;17m\x1b[33m')
  }
}

/**
 * TodoList Component - Displays and manages todo items
 */
class TodoList extends Component {
  private todos: Todo[] = []
  private selectedIndex: number = 0
  private filter: FilterType = 'all'

  setTodos(todos: Todo[]) {
    this.todos = todos
  }

  setFilter(filter: FilterType) {
    this.filter = filter
    this.selectedIndex = 0
  }

  getFilteredTodos(): Todo[] {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(t => !t.completed)
      case 'completed':
        return this.todos.filter(t => t.completed)
      default:
        return this.todos
    }
  }

  getSelectedTodo(): Todo | null {
    const filtered = this.getFilteredTodos()
    return filtered[this.selectedIndex] || null
  }

  moveSelection(delta: number) {
    const filtered = this.getFilteredTodos()
    if (filtered.length === 0) return

    this.selectedIndex += delta
    if (this.selectedIndex < 0) {
      this.selectedIndex = filtered.length - 1
    } else if (this.selectedIndex >= filtered.length) {
      this.selectedIndex = 0
    }
  }

  render(context: RenderContext): void {
    const { region } = context
    const filtered = this.getFilteredTodos()

    // Draw border
    this.drawBox(context, { x: 0, y: 0, width: region.width, height: region.height }, 'rounded', '\x1b[36m')

    // Title
    this.writeText(context, ' Todo List ', 2, 0, '\x1b[1m\x1b[36m')

    if (filtered.length === 0) {
      this.writeText(context, 'No todos to display', 2, 2, '\x1b[90m')
      this.writeText(context, 'Press [a] to add one', 2, 3, '\x1b[90m')
      return
    }

    // Render todos
    let y = 2
    const maxVisible = region.height - 4
    const startIdx = Math.max(0, this.selectedIndex - maxVisible + 1)
    const endIdx = Math.min(filtered.length, startIdx + maxVisible)

    for (let i = startIdx; i < endIdx; i++) {
      const todo = filtered[i]
      const isSelected = i === this.selectedIndex
      
      // No indent, use bold for selection
      const boldStart = isSelected ? '\x1b[1m' : ''
      const boldEnd = isSelected ? '\x1b[22m' : ''
      const bgColor = isSelected ? '\x1b[48;5;236m' : ''
      const resetBg = isSelected ? '\x1b[0m' : ''
      
      // Checkbox with better colors
      const checkbox = todo.completed ? '[✓]' : '[ ]'
      const textColor = todo.completed ? '\x1b[90m' : (isSelected ? '\x1b[97m' : '\x1b[37m')
      const checkColor = todo.completed ? '\x1b[32m' : (isSelected ? '\x1b[36m' : '\x1b[37m')
      
      // Render line with padding
      const paddedText = ` ${checkbox} ${todo.text}`.padEnd(region.width - 4)
      const line = `${bgColor}${boldStart}  ${checkColor}${checkbox} ${textColor}${todo.text}${boldEnd}${resetBg}`
      
      // Clear the line first
      this.writeText(context, ' '.repeat(region.width - 4), 2, y, '')
      this.writeText(context, line, 2, y, '')
      y++
    }

    // Scroll indicator
    if (filtered.length > maxVisible) {
      const scrollText = `${this.selectedIndex + 1}/${filtered.length}`
      this.writeText(context, scrollText, region.width - scrollText.length - 2, region.height - 1, '\x1b[90m')
    }
  }
}

/**
 * FilterBar Component - Filter controls
 */
class FilterBar extends Component {
  private filter: FilterType = 'all'
  private onChange?: (filter: FilterType) => void

  setFilter(filter: FilterType) {
    this.filter = filter
  }

  onFilterChange(callback: (filter: FilterType) => void) {
    this.onChange = callback
  }

  handleInput(char: string): boolean {
    switch (char) {
      case '1':
        this.filter = 'all'
        this.onChange?.(this.filter)
            return true
      case '2':
        this.filter = 'active'
        this.onChange?.(this.filter)
            return true
      case '3':
        this.filter = 'completed'
        this.onChange?.(this.filter)
            return true
    }
    return false
  }

  render(context: RenderContext): void {
    const { region } = context
    const filters: { key: string, label: string, value: FilterType }[] = [
      { key: '1', label: 'All', value: 'all' },
      { key: '2', label: 'Active', value: 'active' },
      { key: '3', label: 'Completed', value: 'completed' }
    ]

    // Draw filter bar background
    this.writeText(context, ' '.repeat(region.width), 0, 0, '\x1b[48;5;234m')
    this.writeText(context, 'Filter: ', 2, 0, '\x1b[48;5;234m\x1b[37m')
    
    let x = 10
    filters.forEach(f => {
      const isActive = f.value === this.filter
      
      if (isActive) {
        // Active filter - bold with colored background
        const text = ` ${f.label} `
        this.writeText(context, text, x, 0, '\x1b[48;5;25m\x1b[1m\x1b[97m')
        x += text.length + 2
      } else {
        // Inactive filter
        const text = ` [${f.key}] ${f.label} `
        this.writeText(context, text, x, 0, '\x1b[48;5;234m\x1b[90m')
        x += text.length + 2
      }
    })
  }
}

/**
 * StatusBar Component - Shows statistics and help
 */
class StatusBar extends Component {
  private stats = { total: 0, active: 0, completed: 0 }

  updateStats(todos: Todo[]) {
    this.stats.total = todos.length
    this.stats.completed = todos.filter(t => t.completed).length
    this.stats.active = this.stats.total - this.stats.completed
  }

  render(context: RenderContext): void {
    const { region } = context
    
    // Draw help bar background
    this.writeText(context, ' '.repeat(region.width), 0, 0, '\x1b[48;5;235m')
    
    // Stats with icon
    const statsText = ` 📊 Total: ${this.stats.total} | Active: ${this.stats.active} | Done: ${this.stats.completed}`
    this.writeText(context, statsText, 1, 0, '\x1b[48;5;235m\x1b[36m')

    // Help shortcuts - build string manually to avoid ANSI issues
    const helpItems = [
      'a:Add',
      'e:Edit', 
      'd:Del',
      'Space:Toggle',
      '↑↓:Move',
      '1-3:Filter',
      'q:Quit'
    ]
    
    const helpStr = ' ' + helpItems.join(' ')
    const statsLen = statsText.length
    const availableSpace = region.width - statsLen - 2
    
    if (availableSpace > helpStr.length) {
      this.writeText(context, helpStr, statsLen + 2, 0, '\x1b[48;5;235m\x1b[93m')
    }
  }
}

/**
 * Main TodoApp
 */
class TodoApp {
  private app: App
  private todos: Todo[] = []
  private dataFile: string
  private todoList: TodoList
  private filterBar: FilterBar
  private statusBar: StatusBar
  private modal: Modal
  private rootComponent: Component

  constructor() {
    this.app = new App()
    this.dataFile = path.join(__dirname, 'todos.json')
    
    // Create components
    this.todoList = new TodoList()
    this.filterBar = new FilterBar()
    this.statusBar = new StatusBar()
    this.modal = new Modal()

    // Load todos
    this.loadTodos()

    // Setup UI
    this.setupUI()

    // Setup event handlers
    this.setupEventHandlers()
  }

  private loadTodos(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf-8')
        this.todos = JSON.parse(data).map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt)
        }))
      } else {
        // Sample todos
        this.todos = [
          {
            id: '1',
            text: 'Build professional TUI framework',
            completed: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            text: 'Create component-based architecture',
            completed: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '3',
            text: 'Implement modal dialogs',
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
        this.saveTodos()
      }
    } catch (error) {
      this.todos = []
    }
    
    this.updateComponents()
  }

  private saveTodos(): void {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.todos, null, 2))
    } catch (error) {
      // Silent fail
    }
  }

  private updateComponents(): void {
    this.todoList.setTodos(this.todos)
    this.statusBar.updateStats(this.todos)
  }

  private setupUI(): void {
    // Create root component with layout
    const root = new Component()

    // Override render to create layout
    root.render = (context: RenderContext) => {
      const { region } = context
      
      // Clear screen properly
      for (let y = 0; y < region.height; y++) {
        root.writeText(context, ' '.repeat(region.width), 0, y, '')
      }
      
      // Header with background
      root.writeText(context, ' '.repeat(region.width), 0, 0, '\x1b[48;5;17m')
      root.writeText(context, ' '.repeat(region.width), 0, 1, '\x1b[48;5;17m')
      const title = '✓ TODO MANAGER'
      const titleX = Math.floor((region.width - title.length) / 2)
      root.writeText(context, title, titleX, 0, '\x1b[48;5;17m\x1b[1m\x1b[97m')

      // Todo list (main area with proper spacing)
      this.todoList.render({
        ...context,
        region: {
          x: region.x + 1,
          y: region.y + 2,
          width: region.width - 2,
          height: region.height - 7
        }
      })

      // Filter bar
      this.filterBar.render({
        ...context,
        region: {
          x: region.x + 1,
          y: region.y + region.height - 4,
          width: region.width - 2,
          height: 2
        }
      })

      // Status bar (bottom)
      this.statusBar.render({
        ...context,
        region: {
          x: region.x,
          y: region.y + region.height - 1,
          width: region.width,
          height: 1
        }
      })

      // Modal (if open) - render last to be on top
      this.modal.render(context)
    }

    // Override handleInput to delegate to components
    root.handleInput = (char: string, key: any): boolean => {
      // Modal takes priority
      if (this.modal.handleInput(char, key)) {
        return true
      }

      // Handle app shortcuts
      switch (char) {
        case 'a':
          this.showAddModal()
          return true
        case 'e':
          this.showEditModal()
          return true
        case 'd':
          this.deleteTodo()
          return true
        case ' ':
        case 'x':
          this.toggleTodo()
          return true
        case 'q':
          this.quit()
          return true
      }

      // Arrow navigation
      if (key?.name === 'up' || char === 'k') {
        this.todoList.moveSelection(-1)
        this.app.render()
        return true
      }
      if (key?.name === 'down' || char === 'j') {
        this.todoList.moveSelection(1)
        this.app.render()
        return true
      }

      // Filter bar input
      if (this.filterBar.handleInput(char)) {
        this.app.render()
        return true
      }

      return false
    }

    this.rootComponent = root
    this.app.setRootComponent(root)
  }

  private setupEventHandlers(): void {
    // Filter change
    this.filterBar.onFilterChange((filter) => {
      this.todoList.setFilter(filter)
      this.app.render()
    })

    // Keyboard events
    this.app.on('keypress', (char: string, key: any) => {
      this.rootComponent.handleInput(char, key)
    })
  }

  private showAddModal(): void {
    this.modal.open('Add New Todo', '', (text) => {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      this.todos.unshift(newTodo)
      this.saveTodos()
      this.updateComponents()
      this.app.render()
    })
    this.app.render()
  }

  private showEditModal(): void {
    const selected = this.todoList.getSelectedTodo()
    if (!selected) return

    this.modal.open('Edit Todo', selected.text, (text) => {
      selected.text = text
      selected.updatedAt = new Date()
      this.saveTodos()
      this.updateComponents()
      this.app.render()
    })
    this.app.render()
  }

  private deleteTodo(): void {
    const selected = this.todoList.getSelectedTodo()
    if (!selected) return

    const index = this.todos.findIndex(t => t.id === selected.id)
    if (index !== -1) {
      this.todos.splice(index, 1)
      this.saveTodos()
      this.updateComponents()
      this.app.render()
    }
  }

  private toggleTodo(): void {
    const selected = this.todoList.getSelectedTodo()
    if (!selected) return

    selected.completed = !selected.completed
    selected.updatedAt = new Date()
    this.saveTodos()
    this.updateComponents()
    this.app.render()
  }

  private quit(): void {
    this.saveTodos()
    this.app.stop()
    console.log('\nGoodbye! Your todos have been saved.')
    process.exit(0)
  }

  async start(): Promise<void> {
    // Show system cursor for proper rendering
    process.stdout.write('\x1b[?25h')
    await this.app.start()
  }
}

// Start the app
async function main() {
  const todoApp = new TodoApp()
  await todoApp.start()
}

main().catch(console.error)