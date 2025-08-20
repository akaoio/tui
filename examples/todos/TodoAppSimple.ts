#!/usr/bin/env tsx

/**
 * Todo App - Optimized for Termux and small screens
 * Simplified rendering for better compatibility
 */

import { App, Component } from '../../src'
import * as fs from 'fs'
import * as path from 'path'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

type FilterType = 'all' | 'active' | 'completed'

class SimpleTodoApp {
  private app: App
  private todos: Todo[] = []
  private selectedIndex = 0
  private filter: FilterType = 'all'
  private mode: 'normal' | 'add' | 'edit' = 'normal'
  private inputText = ''
  private editingId: string | null = null
  private dataFile: string

  constructor() {
    this.app = new App()
    this.dataFile = path.join(__dirname, 'todos.json')
    this.loadTodos()
    this.setupUI()
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
      }
    } catch (error) {
      this.todos = []
    }
  }

  private saveTodos(): void {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.todos, null, 2))
    } catch (error) {
      // Silent fail
    }
  }

  private getFilteredTodos(): Todo[] {
    switch (this.filter) {
      case 'active':
        return this.todos.filter(t => !t.completed)
      case 'completed':
        return this.todos.filter(t => t.completed)
      default:
        return this.todos
    }
  }

  private setupUI(): void {
    const root = new Component()

    root.render = (context) => {
      const { region } = context
      const filtered = this.getFilteredTodos()
      
      // Clear screen
      for (let y = 0; y < region.height; y++) {
        root.writeText(context, ' '.repeat(region.width), 0, y, '')
      }
      
      // Simple header - more compact for small screens
      const title = region.width < 40 ? 'TODOS' : '=== TODO APP ==='
      const titleX = Math.floor((region.width - title.length) / 2)
      root.writeText(context, title, titleX, 0, '\x1b[1m\x1b[36m')
      
      // Stats line
      const total = this.todos.length
      const active = this.todos.filter(t => !t.completed).length
      const completed = total - active
      const stats = `Total:${total} Active:${active} Done:${completed}`
      root.writeText(context, stats, 2, 1, '\x1b[33m')
      
      // Mode indicator
      if (this.mode === 'add' || this.mode === 'edit') {
        const modeText = this.mode === 'add' ? 'NEW:' : 'EDIT:'
        root.writeText(context, modeText, 2, 3, '\x1b[32m')
        root.writeText(context, this.inputText + '_', 8, 3, '\x1b[37m')
        root.writeText(context, '[Enter] Save [Esc] Cancel', 2, 4, '\x1b[90m')
      }
      
      // Todo list
      let y = this.mode === 'normal' ? 3 : 6
      const maxItems = Math.min(filtered.length, region.height - y - 4)
      
      if (filtered.length === 0) {
        root.writeText(context, 'No todos. Press [a] to add', 2, y, '\x1b[90m')
      } else {
        for (let i = 0; i < maxItems; i++) {
          const todo = filtered[i]
          const isSelected = i === this.selectedIndex
          
          // Simple selection indicator
          const prefix = isSelected ? '>' : ' '
          const check = todo.completed ? '[X]' : '[ ]'
          const textStyle = todo.completed ? '\x1b[90m' : '\x1b[37m'
          const selectedStyle = isSelected ? '\x1b[1m' : ''
          
          const line = `${prefix} ${check} ${todo.text}`
          root.writeText(context, line, 1, y + i, `${selectedStyle}${textStyle}`)
        }
        
        // Scroll indicator
        if (filtered.length > maxItems) {
          const indicator = `(${this.selectedIndex + 1}/${filtered.length})`
          root.writeText(context, indicator, region.width - 10, y, '\x1b[90m')
        }
      }
      
      // Filter bar
      const filterY = region.height - 3
      root.writeText(context, 'Filter:', 2, filterY, '\x1b[36m')
      const filters = ['All', 'Active', 'Done']
      const filterValues: FilterType[] = ['all', 'active', 'completed']
      let fx = 10
      filterValues.forEach((f, i) => {
        const isActive = f === this.filter
        const style = isActive ? '\x1b[1m\x1b[33m' : '\x1b[90m'
        const text = `[${i+1}]${filters[i]}`
        root.writeText(context, text, fx, filterY, style)
        fx += text.length + 2
      })
      
      // Help line - compact for small screens
      const helpY = region.height - 1
      const help = region.width < 50 
        ? '[a]+ [e]✎ [d]✕ [␣]✓ [↑↓] [q]Exit'
        : '[a]Add [e]Edit [d]Del [Space]Toggle [↑↓]Move [q]Quit'
      root.writeText(context, help, 2, helpY, '\x1b[90m')
    }

    root.handleInput = (char: string, key: any): boolean => {
      // Input mode handling
      if (this.mode === 'add' || this.mode === 'edit') {
        if (key?.name === 'escape') {
          this.mode = 'normal'
          this.inputText = ''
          this.editingId = null
          this.app.render()
          return true
        }
        
        if (key?.name === 'return' || key?.name === 'enter') {
          if (this.inputText.trim()) {
            if (this.mode === 'add') {
              this.todos.unshift({
                id: Date.now().toString(),
                text: this.inputText.trim(),
                completed: false,
                createdAt: new Date(),
                updatedAt: new Date()
              })
            } else if (this.editingId) {
              const todo = this.todos.find(t => t.id === this.editingId)
              if (todo) {
                todo.text = this.inputText.trim()
                todo.updatedAt = new Date()
              }
            }
            this.saveTodos()
          }
          this.mode = 'normal'
          this.inputText = ''
          this.editingId = null
          this.app.render()
          return true
        }
        
        if (key?.name === 'backspace') {
          this.inputText = this.inputText.slice(0, -1)
          this.app.render()
          return true
        }
        
        if (char && char.length === 1 && char >= ' ' && char <= '~') {
          this.inputText += char
          this.app.render()
          return true
        }
        
        return true
      }
      
      // Normal mode
      const filtered = this.getFilteredTodos()
      
      // Navigation
      if (key?.name === 'up' || char === 'k') {
        if (this.selectedIndex > 0) {
          this.selectedIndex--
          this.app.render()
        }
        return true
      }
      
      if (key?.name === 'down' || char === 'j') {
        if (this.selectedIndex < filtered.length - 1) {
          this.selectedIndex++
          this.app.render()
        }
        return true
      }
      
      // Actions
      if (char === 'a') {
        this.mode = 'add'
        this.inputText = ''
        this.app.render()
        return true
      }
      
      if (char === 'e' && filtered[this.selectedIndex]) {
        this.mode = 'edit'
        this.editingId = filtered[this.selectedIndex].id
        this.inputText = filtered[this.selectedIndex].text
        this.app.render()
        return true
      }
      
      if (char === 'd' && filtered[this.selectedIndex]) {
        const id = filtered[this.selectedIndex].id
        const index = this.todos.findIndex(t => t.id === id)
        if (index !== -1) {
          this.todos.splice(index, 1)
          this.saveTodos()
          if (this.selectedIndex >= filtered.length - 1 && this.selectedIndex > 0) {
            this.selectedIndex--
          }
          this.app.render()
        }
        return true
      }
      
      if ((char === ' ' || char === 'x') && filtered[this.selectedIndex]) {
        filtered[this.selectedIndex].completed = !filtered[this.selectedIndex].completed
        filtered[this.selectedIndex].updatedAt = new Date()
        this.saveTodos()
        this.app.render()
        return true
      }
      
      // Filters
      if (char === '1') {
        this.filter = 'all'
        this.selectedIndex = 0
        this.app.render()
        return true
      }
      
      if (char === '2') {
        this.filter = 'active'
        this.selectedIndex = 0
        this.app.render()
        return true
      }
      
      if (char === '3') {
        this.filter = 'completed'
        this.selectedIndex = 0
        this.app.render()
        return true
      }
      
      // Quit
      if (char === 'q' || key?.name === 'escape') {
        this.app.stop()
        console.log('\nGoodbye!')
        process.exit(0)
      }
      
      return false
    }

    this.app.setRootComponent(root)
    
    this.app.on('keypress', (char: string, key: any) => {
      root.handleInput(char, key)
    })
  }

  async start(): Promise<void> {
    // Hide cursor for cleaner display on small screens
    process.stdout.write('\x1b[?25l')
    
    // Handle terminal cleanup on exit
    process.on('SIGINT', () => {
      process.stdout.write('\x1b[?25h') // Show cursor
      process.stdout.write('\x1b[2J\x1b[H') // Clear screen
      console.log('\nGoodbye!')
      process.exit(0)
    })
    
    await this.app.start()
  }
}

// Start
async function main() {
  const app = new SimpleTodoApp()
  await app.start()
}

main().catch(console.error)