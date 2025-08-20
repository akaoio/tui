#!/usr/bin/env node
import { SchemaRenderer } from '../../src/core/SchemaRenderer'
import * as fs from 'fs'
import * as path from 'path'

// Load the schema
const schemaPath = path.join(__dirname, 'dashboard-schema.json')
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))

// Create and run the app
const app = new SchemaRenderer(schema)

// Store the interval reference
let monitoringInterval: NodeJS.Timeout

// Set up monitoring
app.on('ready', () => {
  monitoringInterval = app.store.dispatch('startMonitoring')
})

// Handle process exit
process.on('SIGINT', () => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
  }
  app.destroy()
  process.exit(0)
})

// Run the app
app.run()