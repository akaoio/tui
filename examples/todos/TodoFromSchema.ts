#!/usr/bin/env tsx

/**
 * Todo App - Pure Schema-Driven
 * Loads UI definition from JSON schema file
 */

import { SchemaRenderer } from '../../src/core/SchemaRenderer'
import * as fs from 'fs'
import * as path from 'path'

class SchemaBasedTodoApp {
  private renderer: SchemaRenderer
  private dataFile: string
  private schemaFile: string
  
  constructor() {
    this.dataFile = path.join(__dirname, 'todos.json')
    this.schemaFile = path.join(__dirname, 'todo-schema.json')
    
    // Load schema from JSON file
    const schemaJson = fs.readFileSync(this.schemaFile, 'utf-8')
    const schema = JSON.parse(schemaJson)
    
    // Initialize renderer with schema
    this.renderer = new SchemaRenderer(schema)
    
    // Load saved todos
    this.loadTodos()
    
    // Setup business logic handlers
    this.setupHandlers()
  }
  
  private loadTodos(): void {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = fs.readFileSync(this.dataFile, 'utf-8')
        const todos = JSON.parse(data)
        
        // Access the global store created by SchemaRenderer
        const store = (global as any).$store
        if (store) {
          store.state.todos = todos
          console.log(`Loaded ${todos.length} todos from disk`)
        }
      } else {
        console.log('No existing todos file, starting fresh')
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
  
  private setupHandlers(): void {
    // Handle quit
    this.renderer.on('quit', () => {
      this.saveTodos()
      console.log('\n✓ Todos saved successfully')
      console.log('Goodbye!')
      process.exit(0)
    })
    
    // Auto-save on any state change
    this.renderer.on('input-submit', () => {
      this.saveTodos()
    })
    
    this.renderer.on('button-click', () => {
      this.saveTodos()
    })
    
    // Keyboard shortcuts are now handled by SchemaRenderer internally
    // based on the schema definition - no duplicate handlers needed
    
    // Just listen for state changes to save todos
    this.renderer.on('state-change', () => {
      this.saveTodos()
    })
  }
  
  run(): void {
    console.clear()
    console.log('Loading Todo App from schema...')
    
    // Display schema info
    const schemaJson = fs.readFileSync(this.schemaFile, 'utf-8')
    const schema = JSON.parse(schemaJson)
    console.log(`Schema: ${schema.name} v${schema.version}`)
    console.log(`Components: ${Object.keys(schema.components).join(', ')}`)
    console.log('---')
    
    // Small delay to show the info
    setTimeout(() => {
      console.clear()
      this.renderer.run()
    }, 1000)
  }
}

// Main entry point
async function main() {
  const app = new SchemaBasedTodoApp()
  app.run()
}

main().catch(error => {
  console.error('Failed to start app:', error)
  process.exit(1)
})