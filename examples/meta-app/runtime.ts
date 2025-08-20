#!/usr/bin/env tsx

/**
 * Meta-Schema Runtime - Simplified
 * Uses TUI framework's SchemaRenderer for all functionality
 */

import * as fs from 'fs'
import * as path from 'path'
import { SchemaRenderer, ScreenManager } from '../../src'

// Parse command line arguments
const args = process.argv.slice(2)
const debugMode = args.includes('--debug')
const schemaPath = args.find(arg => !arg.startsWith('--')) || path.join(__dirname, 'app.schema.json')

if (!fs.existsSync(schemaPath)) {
    console.error(`Schema file not found: ${schemaPath}`)
    process.exit(1)
}

console.log(`[Runtime] Loading schema from: ${schemaPath}`)
if (debugMode) {
    console.log(`[Runtime] Debug mode enabled - output will be written to tui-debug.log`)
}

// Load schema
const schemaContent = fs.readFileSync(schemaPath, 'utf8')
const appSchema = JSON.parse(schemaContent)

// Add demo todos to schema store for this example
if (appSchema.store && appSchema.store.properties && appSchema.store.properties.todos) {
    appSchema.store.properties.todos.default = [
        { id: 1, text: 'Learn TUI Framework', completed: false },
        { id: 2, text: 'Build Todo App', completed: true },
        { id: 3, text: 'Add Interactive Features', completed: false }
    ]
}

// Create renderer with framework-level functionality
const renderer = new SchemaRenderer(appSchema)

// Enable debug mode if requested
if (debugMode) {
    ScreenManager.getInstance().enableDebugMode()
}

// Setup business logic event handlers
renderer.on('keypress', (char: string, key: any) => {
    // Any app-specific key handling goes here
    // Framework handles all navigation, cursor mode, etc.
})

renderer.on('input-submit', (text: string) => {
    // Add new todo - this is the only business logic we need
    const store = (global as any).$store
    if (store && store.state.todos && text.trim()) {
        const newId = Math.max(0, ...store.state.todos.map((t: any) => t.id)) + 1
        store.state.todos.push({
            id: newId,
            text: text.trim(),
            completed: false
        })
        console.log(`[Business] Added todo: ${text}`)
    }
})

renderer.on('button-click', (label: string, button: any) => {
    // Handle button clicks - pure business logic
    const store = (global as any).$store
    if (!store) return
    
    console.log(`[Business] Button clicked: ${label}`)
    
    // Filter buttons
    if (label === 'All') {
        store.commit('SET_FILTER', 'all')
    } else if (label === 'Active') {
        store.commit('SET_FILTER', 'active')
    } else if (label === 'Completed') {
        store.commit('SET_FILTER', 'completed')
    }
})

renderer.on('quit', () => {
    // Save persisted data if configured
    if (appSchema.store?.persist) {
        const store = (global as any).$store
        if (store) {
            const persistConfig = appSchema.store.persist
            if (persistConfig.storage === 'file') {
                const filePath = path.join(process.cwd(), `${persistConfig.key}.json`)
                try {
                    fs.writeFileSync(filePath, JSON.stringify(store.state, null, 2))
                    console.log(`[Storage] Saved data to ${filePath}`)
                } catch (error) {
                    console.error('[Storage] Failed to save data:', error)
                }
            }
        }
    }
    
    console.log('\n[Runtime] App terminated')
    renderer.quit()
})

// Start the app - framework handles everything else
console.log(`[Runtime] Starting ${appSchema.name} v${appSchema.version}`)
console.log(`[Runtime] Schema: ${appSchema.$id}`)

ScreenManager.getInstance().enterAlternateScreen()
ScreenManager.getInstance().enableMouse()
ScreenManager.getInstance().setCursorVisible(true)

renderer.run()

// Handle graceful shutdown
process.on('SIGINT', () => {
    ScreenManager.getInstance().cleanup()
    process.exit(0)
})