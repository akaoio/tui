#!/usr/bin/env tsx

/**
 * JSON Configuration Editor
 * Interactive editor for JSON config files
 */

import { App, JsonEditor } from '../../src'
import * as fs from 'fs'
import * as path from 'path'

// Sample config or load from file
const configFile = process.argv[2] || path.join(__dirname, 'sample-config.json')

// Load or create config
let configData: any
try {
  if (fs.existsSync(configFile)) {
    configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'))
  } else {
    // Default config
    configData = {
      app: {
        name: "My TUI Application",
        version: "1.0.0",
        author: "Developer"
      },
      server: {
        host: "localhost",
        port: 3000,
        ssl: false,
        cors: {
          enabled: true,
          origins: ["http://localhost:3000", "https://example.com"]
        }
      },
      database: {
        type: "postgresql",
        host: "localhost",
        port: 5432,
        name: "myapp",
        credentials: {
          user: "admin",
          password: "secret"
        }
      },
      features: {
        authentication: true,
        logging: true,
        monitoring: false,
        cache: {
          enabled: true,
          ttl: 3600,
          provider: "redis"
        }
      },
      environments: ["development", "staging", "production"]
    }
  }
} catch (error) {
  console.error('Error loading config:', error)
  configData = {}
}

async function main() {
  const app = new App()
  
  // Create JSON editor
  const editor = new JsonEditor({
    data: configData,
    height: 30
  })
  
  // Handle data changes
  editor.onDataChange((data) => {
    // Auto-save
    try {
      fs.writeFileSync(configFile, JSON.stringify(data, null, 2))
      console.log('\rConfig saved to', configFile)
    } catch (error) {
      console.error('\rError saving config:', error)
    }
  })
  
  // Setup keyboard handlers
  app.on('keypress', (char: string, key: any) => {
    // Ctrl+S to save (redundant since we auto-save, but good UX)
    if (key?.ctrl && char === 's') {
      try {
        fs.writeFileSync(configFile, JSON.stringify(editor.getData(), null, 2))
        console.log('\rConfig saved!')
      } catch (error) {
        console.error('\rError saving:', error)
      }
      return
    }
    
    // Ctrl+K for virtual cursor
    if (key?.ctrl && char === 'k') {
      // Virtual cursor will be handled by ScreenManager
      return
    }
    
    // q or Escape to quit
    if (char === 'q' || key?.name === 'escape') {
      app.stop()
      console.log('\nGoodbye!')
      process.exit(0)
    }
    
    // Delegate to editor
    editor.handleInput(char, key)
    app.render()
  })
  
  // Set root component
  app.setRootComponent(editor)
  
  // Start app
  await app.start()
  
  console.log(`\nEditing: ${configFile}`)
  console.log('Controls: [↑↓] Navigate [←→] Fold/Unfold [e] Edit [a] Add [d] Delete [Ctrl+K] Cursor [q] Quit')
}

main().catch(console.error)