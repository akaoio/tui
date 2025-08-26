#!/usr/bin/env node

/**
 * Viewport Demo - Shows the improved terminal detection capabilities
 */

import { Viewport } from '../src/core/Viewport'

console.log('🖥️  TUI Viewport - Enhanced Terminal Detection Demo')
console.log('===================================================')

const viewport = Viewport.getInstance()

// Display current terminal info
const dims = viewport.getDimensions()
const caps = viewport.getCapabilities()

console.log('\n📏 Terminal Dimensions:')
console.log(`   Size: ${dims.width} × ${dims.height}`)
console.log(`   Aspect Ratio: ${viewport.getAspectRatio().toFixed(2)}`)
console.log(`   Orientation: ${viewport.getOrientation()}`)
console.log(`   Breakpoint: ${viewport.getBreakpoint()}`)

console.log('\n🔧 Terminal Capabilities:')
console.log(`   Program: ${caps.terminalProgram || 'Unknown'}`)
console.log(`   Type: ${caps.terminalType || 'Unknown'}`)
console.log(`   Color Support: ${caps.supportsColor ? `Yes (${caps.colorDepth}-bit)` : 'No'}`)
console.log(`   Unicode: ${caps.supportsUnicode ? 'Yes' : 'No'}`)
console.log(`   Mouse: ${caps.supportsMouse ? 'Yes' : 'No'}`)
console.log(`   Resize Events: ${caps.supportsResize ? 'Yes' : 'No'}`)

if (caps.isSSH) console.log('   🔗 SSH Session detected')
if (caps.isTmux) console.log('   📟 Tmux detected')
if (caps.isScreen) console.log('   🖥️  GNU Screen detected')

console.log('\n🧮 Layout Calculations:')
console.log(`   50% Width: ${viewport.percentWidth(50)} cols`)
console.log(`   50% Height: ${viewport.percentHeight(50)} rows`)
console.log(`   Safe Area: ${JSON.stringify(viewport.getSafeArea())}`)
console.log(`   Grid 3×3: ${JSON.stringify(viewport.grid(3, 3))}`)

console.log('\n📊 Responsive Design:')
const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const
breakpoints.forEach(bp => {
  const matches = viewport.matchesBreakpoint(bp)
  console.log(`   ${bp.toUpperCase()}: ${matches ? '✅' : '❌'}`)
})

console.log('\n👂 Resize Detection:')
console.log('   Try resizing your terminal window...')

viewport.onResize((newDims, oldDims) => {
  console.log(`\n🔄 Resized: ${oldDims.width}×${oldDims.height} → ${newDims.width}×${newDims.height}`)
  console.log(`   New Breakpoint: ${viewport.getBreakpoint()}`)
  console.log(`   Orientation: ${viewport.getOrientation()}`)
})

console.log('\n🆔 Detection Methods Used:')
console.log('   1. Direct TTY dimensions (process.stdout.columns/rows)')
console.log('   2. Unix tput command (tput cols/lines)')  
console.log('   3. Unix stty command (stty size)')
console.log('   4. Environment variables (COLUMNS/LINES)')
console.log('   5. Windows PowerShell (UI.RawUI.WindowSize)')
console.log('   6. Smart fallbacks based on terminal type')

console.log('\nPress Ctrl+C to exit...')

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!')
  process.exit(0)
})