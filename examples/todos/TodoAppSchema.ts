#!/usr/bin/env tsx

/**
 * Todo App - Schema-driven approach
 * This demonstrates how to build TUI from JSON schema definitions
 */

import { SchemaRenderer, SchemaApp } from '../../src/core/SchemaRenderer'
import * as fs from 'fs'
import * as path from 'path'

// Define the schema for the Todo App
const todoAppSchema: SchemaApp = {
  name: 'TodoApp',
  version: '1.0.0',
  
  // Define the data store
  store: {
    $id: 'TodoStore',
    type: 'object',
    properties: {
      todos: {
        type: 'array',
        default: []
      },
      filter: {
        type: 'string',
        default: 'all'
      },
      newTodoText: {
        type: 'string',
        default: ''
      }
    },
    getters: {
      todoCount: {
        handler: `function() {
          return this.state.todos ? this.state.todos.length : 0
        }`
      },
      completedCount: {
        handler: `function() {
          return this.state.todos ? this.state.todos.filter(t => t.completed).length : 0
        }`
      },
      activeCount: {
        handler: `function() {
          const total = this.state.todos ? this.state.todos.length : 0
          const completed = this.state.todos ? this.state.todos.filter(t => t.completed).length : 0
          return total - completed
        }`
      }
    },
    mutations: {
      addTodo: {
        handler: `function(state, payload) {
          const newTodo = {
            id: Date.now().toString(),
            text: payload,
            completed: false,
            createdAt: new Date().toISOString()
          }
          state.todos.unshift(newTodo)
        }`
      },
      toggleTodo: {
        handler: `function(state, payload) {
          const todo = state.todos.find(t => t.id === payload)
          if (todo) {
            todo.completed = !todo.completed
          }
        }`
      },
      deleteTodo: {
        handler: `function(state, payload) {
          const index = state.todos.findIndex(t => t.id === payload)
          if (index !== -1) {
            state.todos.splice(index, 1)
          }
        }`
      },
      setFilter: {
        handler: `function(state, payload) {
          state.filter = payload
        }`
      }
    }
  },
  
  // Define reusable components
  components: {
    Header: {
      name: 'Header',
      type: 'custom',
      template: '╔══════════════════════════════════════════════════════════════════════════╗\n║                            TODO MANAGER v2.0                            ║\n║                   Total: {{todoCount}} | Active: {{activeCount}} | Done: {{completedCount}}                  ║\n╚══════════════════════════════════════════════════════════════════════════╝',
      style: {
        background: '#003366',
        color: 'white',
        height: 4
      }
    },
    
    TodoInput: {
      name: 'TodoInput',
      type: 'text',
      props: {
        placeholder: {
          type: 'string',
          default: 'What needs to be done?'
        }
      },
      style: {
        border: {
          style: 'single'
        },
        focus: {
          background: '#444444'
        }
      }
    },
    
    TodoList: {
      name: 'TodoList',
      type: 'list',
      style: {
        border: {
          style: 'rounded'
        },
        height: 15
      }
    },
    
    FilterBar: {
      name: 'FilterBar',
      type: 'custom',
      children: [
        {
          type: 'button',
          props: {
            label: 'All'
          }
        },
        {
          type: 'button',
          props: {
            label: 'Active'
          }
        },
        {
          type: 'button',
          props: {
            label: 'Completed'
          }
        }
      ],
      style: {
        background: '#222222',
        height: 3
      }
    }
  },
  
  // Define the main screen layout
  main: {
    $type: 'layout',
    type: 'dock',
    dock: {
      top: 'Header',
      center: {
        type: 'stack',
        children: [
          'TodoInput',
          'TodoList'
        ]
      },
      bottom: 'FilterBar'
    }
  }
}

// Business logic class to handle interactions
class TodoAppController {
  private renderer: SchemaRenderer
  private dataFile: string
  private selectedTodoIndex = 0
  
  constructor() {
    this.dataFile = path.join(__dirname, 'todos.json')
    this.renderer = new SchemaRenderer(todoAppSchema)
    
    // Load initial data
    this.loadTodos()
    
    // Setup event handlers
    this.setupEventHandlers()
  }
  
  private loadTodos(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf-8')
        const todos = JSON.parse(data)
        const store = (global as any).$store
        if (store) {
          store.state.todos = todos
        }
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  }
  
  private saveTodos(): void {
    try {
      const store = (global as any).$store
      if (store && store.state.todos) {
        fs.writeFileSync(this.dataFile, JSON.stringify(store.state.todos, null, 2))
      }
    } catch (error) {
      console.error('Failed to save todos:', error)
    }
  }
  
  private setupEventHandlers(): void {
    // Handle text input submission
    this.renderer.on('input-submit', (text: string) => {
      const store = (global as any).$store
      if (store && text.trim()) {
        store.commit('addTodo', text.trim())
        this.saveTodos()
        this.renderer.render()
      }
    })
    
    // Handle button clicks (filter changes)
    this.renderer.on('button-click', (label: string) => {
      const store = (global as any).$store
      if (store) {
        switch (label) {
          case 'All':
            store.commit('setFilter', 'all')
            break
          case 'Active':
            store.commit('setFilter', 'active')
            break
          case 'Completed':
            store.commit('setFilter', 'completed')
            break
        }
        this.renderer.render()
      }
    })
    
    // Handle keyboard shortcuts
    this.renderer.on('keypress', (char: string, key: any) => {
      const store = (global as any).$store
      if (!store || !store.state.todos) return
      
      // Delete todo with 'd'
      if (char === 'd' && this.selectedTodoIndex >= 0) {
        const todos = this.getFilteredTodos()
        if (todos[this.selectedTodoIndex]) {
          store.commit('deleteTodo', todos[this.selectedTodoIndex].id)
          this.saveTodos()
          this.renderer.render()
        }
      }
      
      // Toggle todo with space
      if (char === ' ' && this.selectedTodoIndex >= 0) {
        const todos = this.getFilteredTodos()
        if (todos[this.selectedTodoIndex]) {
          store.commit('toggleTodo', todos[this.selectedTodoIndex].id)
          this.saveTodos()
          this.renderer.render()
        }
      }
      
      // Navigate with arrow keys
      if (key?.name === 'up') {
        const todos = this.getFilteredTodos()
        if (this.selectedTodoIndex > 0) {
          this.selectedTodoIndex--
          this.renderer.render()
        }
      }
      
      if (key?.name === 'down') {
        const todos = this.getFilteredTodos()
        if (this.selectedTodoIndex < todos.length - 1) {
          this.selectedTodoIndex++
          this.renderer.render()
        }
      }
    })
    
    // Handle quit
    this.renderer.on('quit', () => {
      this.saveTodos()
      console.log('\nGoodbye! Your todos have been saved.')
      process.exit(0)
    })
  }
  
  private getFilteredTodos(): any[] {
    const store = (global as any).$store
    if (!store || !store.state.todos) return []
    
    const filter = store.state.filter || 'all'
    const todos = store.state.todos
    
    switch (filter) {
      case 'active':
        return todos.filter((t: any) => !t.completed)
      case 'completed':
        return todos.filter((t: any) => t.completed)
      default:
        return todos
    }
  }
  
  run(): void {
    console.clear()
    this.renderer.run()
  }
}

// Start the app
const app = new TodoAppController()
app.run()