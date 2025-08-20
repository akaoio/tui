#!/usr/bin/env node

/**
 * Todo App - Clean and complete implementation
 * A fully functional todo list application
 */

const { App, Component } = require('../../dist/index.js')
const fs = require('fs')
const path = require('path')

const TODOS_FILE = path.join(__dirname, 'todos.json')

/**
 * Todo Item Component
 */
class TodoItem extends Component {
  render(context) {
    const { region } = context
    const { todo, selected, focused } = this.props
    
    // Checkbox
    const checkbox = todo.completed ? '[✓]' : '[ ]'
    const checkColor = todo.completed ? '\x1b[32m' : '\x1b[37m'
    
    // Text with strikethrough if completed
    const textColor = todo.completed ? '\x1b[90m' : '\x1b[37m'
    const text = todo.completed ? `~${todo.text}~` : todo.text
    
    // Background if selected
    if (selected) {
      this.fillRegion(context, { x: 0, y: 0, width: region.width, height: 1 }, ' ', '\x1b[44m')
    }
    
    // Focus indicator
    const prefix = focused ? '▶ ' : '  '
    
    this.writeText(context, prefix, 0, 0, '\x1b[36m')
    this.writeText(context, checkbox, 2, 0, checkColor)
    this.writeText(context, ` ${text}`, 5, 0, textColor)
  }
}

/**
 * Input Field Component
 */
class InputField extends Component {
  constructor(props) {
    super(props)
    this.value = ''
    this.cursorPos = 0
  }
  
  render(context) {
    const { region } = context
    const { label, focused } = this.props
    
    // Draw input box
    this.drawBox(context, { x: 0, y: 0, width: region.width, height: 3 }, 'single')
    
    // Label
    this.writeText(context, ` ${label} `, 2, 0, '\x1b[36m')
    
    // Input value
    const displayValue = this.value || (focused ? '' : 'Press Enter to add...')
    const valueColor = this.value ? '\x1b[37m' : '\x1b[90m'
    this.writeText(context, displayValue, 2, 1, valueColor)
    
    // Cursor
    if (focused && this.props.editing) {
      this.writeText(context, '▌', 2 + this.cursorPos, 1, '\x1b[33m')
    }
  }
  
  handleKeypress(char, key) {
    if (!this.props.editing) return false
    
    if (key?.name === 'backspace') {
      if (this.cursorPos > 0) {
        this.value = this.value.slice(0, this.cursorPos - 1) + this.value.slice(this.cursorPos)
        this.cursorPos--
      }
      return true
    }
    
    if (key?.name === 'left') {
      this.cursorPos = Math.max(0, this.cursorPos - 1)
      return true
    }
    
    if (key?.name === 'right') {
      this.cursorPos = Math.min(this.value.length, this.cursorPos + 1)
      return true
    }
    
    if (char && char.length === 1 && !key?.ctrl) {
      this.value = this.value.slice(0, this.cursorPos) + char + this.value.slice(this.cursorPos)
      this.cursorPos++
      return true
    }
    
    return false
  }
  
  getValue() {
    return this.value
  }
  
  clear() {
    this.value = ''
    this.cursorPos = 0
  }
}

/**
 * Status Bar Component
 */
class StatusBar extends Component {
  render(context) {
    const { total, completed, filter } = this.props
    const remaining = total - completed
    
    this.fillRegion(context, { x: 0, y: 0, width: context.region.width, height: 1 }, ' ', '\x1b[44m')
    
    const left = ` ${remaining} items left `
    const center = `[All] [Active] [Completed]`
    const right = ` ${completed}/${total} done `
    
    this.writeText(context, left, 1, 0, '\x1b[44m\x1b[37m')
    
    const centerX = Math.floor((context.region.width - center.length) / 2)
    this.writeText(context, center, centerX, 0, '\x1b[44m\x1b[33m')
    
    const rightX = context.region.width - right.length - 1
    this.writeText(context, right, rightX, 0, '\x1b[44m\x1b[32m')
  }
}

/**
 * Main Todo App
 */
class TodoApp extends Component {
  constructor(props) {
    super(props)
    this.todos = this.loadTodos()
    this.selectedIndex = 0
    this.filter = 'all' // all, active, completed
    this.editingNew = false
    this.inputField = new InputField({ label: 'New Todo', focused: false, editing: false })
  }
  
  loadTodos() {
    try {
      if (fs.existsSync(TODOS_FILE)) {
        const data = JSON.parse(fs.readFileSync(TODOS_FILE, 'utf8'))
        // Convert old format if needed
        return data.map(item => ({
          id: item.id || Date.now(),
          text: item.text || item.title || 'Untitled',
          completed: item.completed || false,
          createdAt: item.createdAt || new Date().toISOString()
        }))
      }
    } catch (err) {
      // Ignore errors
    }
    return []
  }
  
  saveTodos() {
    try {
      fs.writeFileSync(TODOS_FILE, JSON.stringify(this.todos, null, 2))
    } catch (err) {
      // Ignore errors
    }
  }
  
  addTodo(text) {
    if (!text.trim()) return
    
    this.todos.push({
      id: Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    })
    
    this.saveTodos()
  }
  
  toggleTodo(index) {
    if (index >= 0 && index < this.getFilteredTodos().length) {
      const filtered = this.getFilteredTodos()
      const todo = filtered[index]
      const realIndex = this.todos.indexOf(todo)
      this.todos[realIndex].completed = !this.todos[realIndex].completed
      this.saveTodos()
    }
  }
  
  deleteTodo(index) {
    if (index >= 0 && index < this.getFilteredTodos().length) {
      const filtered = this.getFilteredTodos()
      const todo = filtered[index]
      const realIndex = this.todos.indexOf(todo)
      this.todos.splice(realIndex, 1)
      this.saveTodos()
      
      if (this.selectedIndex >= this.getFilteredTodos().length) {
        this.selectedIndex = Math.max(0, this.getFilteredTodos().length - 1)
      }
    }
  }
  
  getFilteredTodos() {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(t => !t.completed)
      case 'completed':
        return this.todos.filter(t => t.completed)
      default:
        return this.todos
    }
  }
  
  render(context) {
    const { region } = context
    
    // Clear
    this.fillRegion(context, { x: 0, y: 0, width: region.width, height: region.height }, ' ')
    
    // Title
    const title = '═══ TODO APP ═══'
    const titleX = Math.floor((region.width - title.length) / 2)
    this.writeText(context, title, titleX, 0, '\x1b[1m\x1b[36m')
    
    // Input field
    this.inputField.props.focused = this.editingNew
    this.inputField.props.editing = this.editingNew
    this.inputField.render({
      ...context,
      region: { x: 2, y: 2, width: region.width - 4, height: 3 }
    })
    
    // Todo list
    const listY = 6
    const listHeight = region.height - 9
    const filtered = this.getFilteredTodos()
    
    if (filtered.length === 0) {
      this.writeText(context, 'No todos yet. Press Enter to add one!', 4, listY + 2, '\x1b[90m')
    } else {
      filtered.forEach((todo, index) => {
        if (index < listHeight) {
          const item = new TodoItem({
            todo,
            selected: index === this.selectedIndex && !this.editingNew,
            focused: index === this.selectedIndex && !this.editingNew
          })
          
          item.render({
            ...context,
            region: { x: 2, y: listY + index, width: region.width - 4, height: 1 }
          })
        }
      })
    }
    
    // Status bar
    const completed = this.todos.filter(t => t.completed).length
    const statusBar = new StatusBar({
      total: this.todos.length,
      completed,
      filter: this.filter
    })
    
    statusBar.render({
      ...context,
      region: { x: 0, y: region.height - 2, width: region.width, height: 1 }
    })
    
    // Help
    const help = ' ↑↓:Navigate | Space:Toggle | Enter:Add | Delete:Remove | Tab:Filter | Q:Quit '
    const helpX = Math.floor((region.width - help.length) / 2)
    this.writeText(context, help, helpX, region.height - 1, '\x1b[90m')
  }
  
  handleKeypress(char, key) {
    // Editing mode
    if (this.editingNew) {
      if (key?.name === 'escape') {
        this.editingNew = false
        this.inputField.clear()
        return true
      }
      
      if (key?.name === 'return') {
        const value = this.inputField.getValue()
        if (value) {
          this.addTodo(value)
          this.inputField.clear()
        }
        this.editingNew = false
        return true
      }
      
      return this.inputField.handleKeypress(char, key)
    }
    
    // Navigation mode
    const filtered = this.getFilteredTodos()
    
    if (key?.name === 'up') {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1)
      return true
    }
    
    if (key?.name === 'down') {
      this.selectedIndex = Math.min(filtered.length - 1, this.selectedIndex + 1)
      return true
    }
    
    if (char === ' ') {
      this.toggleTodo(this.selectedIndex)
      return true
    }
    
    if (key?.name === 'delete') {
      this.deleteTodo(this.selectedIndex)
      return true
    }
    
    if (key?.name === 'return') {
      this.editingNew = true
      return true
    }
    
    if (key?.name === 'tab') {
      const filters = ['all', 'active', 'completed']
      const currentIndex = filters.indexOf(this.filter)
      this.filter = filters[(currentIndex + 1) % filters.length]
      this.selectedIndex = 0
      return true
    }
    
    return false
  }
}

// Main
async function main() {
  const app = new App()
  const todoApp = new TodoApp({})
  
  app.on('keypress', (char, key) => {
    if (char === 'q' && !todoApp.editingNew) {
      app.stop()
      process.exit(0)
    }
    
    if (todoApp.handleKeypress(char, key)) {
      app.render()
    }
  })
  
  app.setRootComponent(todoApp)
  await app.start()
}

main().catch(console.error)