#!/usr/bin/env tsx
/**
 * Real viewport implementation test using Battle framework
 * Tests the improved terminal detection and responsiveness
 */

import { Battle } from '@akaoio/battle'

export async function testViewportRealDetection() {
  console.log('\n=== Testing Viewport Real Terminal Detection ===\n')
  
  const results = { total: 0, passed: 0, failed: 0 }
  
  // Test: Real terminal dimensions detection
  results.total++
  try {
    const battle = new Battle({ 
      verbose: false,
      timeout: 5000,
      cols: 120,
      rows: 40
    })
    
    const result = await battle.run(async (b) => {
      await b.spawn('node', ['-e', `
        const { Viewport } = require('./dist/index.js')
        const viewport = Viewport.getInstance()
        const dims = viewport.getDimensions()
        const caps = viewport.getCapabilities()
        
        console.log('VIEWPORT_DIMS:' + dims.width + 'x' + dims.height)
        console.log('VIEWPORT_ASPECT:' + viewport.getAspectRatio().toFixed(2))
        console.log('VIEWPORT_ORIENTATION:' + viewport.getOrientation())
        console.log('TERMINAL_PROGRAM:' + (caps.terminalProgram || 'unknown'))
        console.log('COLOR_SUPPORT:' + caps.supportsColor)
        console.log('UNICODE_SUPPORT:' + caps.supportsUnicode)
        
        if (dims.width === 80 && dims.height === 24) {
          console.log('WARNING: Using hardcoded fallback dimensions')
        } else {
          console.log('SUCCESS: Got real terminal dimensions')
        }
        
        console.log('VIEWPORT_TEST_COMPLETE')
      `])
      
      await b.expect('VIEWPORT_DIMS:120x40')
      await b.expect('VIEWPORT_ASPECT:3.00')
      await b.expect('VIEWPORT_ORIENTATION:landscape')
      await b.expect('VIEWPORT_TEST_COMPLETE')
    })
    
    if (result.success) {
      console.log('✅ Real terminal dimensions detected correctly')
      results.passed++
    } else {
      console.log('❌ Real terminal dimensions detection failed:', result.error)
      results.failed++
    }
  } catch (e: any) {
    console.log('❌ Real terminal dimensions detection failed:', e.message)
    results.failed++
  }
  
  // Test: Terminal capabilities detection
  results.total++
  try {
    const battle = new Battle({ 
      verbose: false,
      timeout: 5000
    })
    
    const result = await battle.run(async (b) => {
      await b.spawn('node', ['-e', `
        const { Viewport } = require('./dist/index.js')
        const viewport = Viewport.getInstance()
        const caps = viewport.getCapabilities()
        
        console.log('CAPS_COLOR:' + caps.supportsColor)
        console.log('CAPS_UNICODE:' + caps.supportsUnicode)
        console.log('CAPS_COLOR_DEPTH:' + caps.colorDepth)
        console.log('CAPS_RESIZE:' + caps.supportsResize)
        
        const hasCapabilities = caps.supportsColor || caps.supportsUnicode || caps.supportsResize
        console.log('CAPS_DETECTED:' + hasCapabilities)
        
        console.log('CAPS_TEST_COMPLETE')
      `])
      
      await b.expect('CAPS_DETECTED:true')
      await b.expect('CAPS_TEST_COMPLETE')
    })
    
    if (result.success) {
      console.log('✅ Terminal capabilities detected successfully')
      results.passed++
    } else {
      console.log('❌ Terminal capabilities detection failed:', result.error)
      results.failed++
    }
  } catch (e: any) {
    console.log('❌ Terminal capabilities detection failed:', e.message)
    results.failed++
  }
  
  // Test: Terminal resize handling
  results.total++
  try {
    const battle = new Battle({ 
      verbose: false,
      timeout: 5000,
      cols: 80,
      rows: 24
    })
    
    const result = await battle.run(async (b) => {
      await b.spawn('node', ['-e', `
        const { Viewport } = require('./dist/index.js')
        const viewport = Viewport.getInstance()
        
        console.log('INITIAL_DIMS:' + viewport.getWidth() + 'x' + viewport.getHeight())
        
        // Set up resize listener
        viewport.onResize((newDims, oldDims) => {
          console.log('RESIZE_EVENT:' + oldDims.width + 'x' + oldDims.height + '->' + newDims.width + 'x' + newDims.height)
        })
        
        // Simulate dimension change by forcing update
        setTimeout(() => {
          viewport.forceUpdate()
          console.log('RESIZE_TESTED')
        }, 200)
        
        setTimeout(() => {
          console.log('RESIZE_TEST_COMPLETE')
        }, 500)
      `])
      
      await b.expect('INITIAL_DIMS:80x24')
      await b.expect('RESIZE_TEST_COMPLETE')
    })
    
    if (result.success) {
      console.log('✅ Terminal resize handling works')
      results.passed++
    } else {
      console.log('❌ Terminal resize handling failed:', result.error)
      results.failed++
    }
  } catch (e: any) {
    console.log('❌ Terminal resize handling failed:', e.message)
    results.failed++
  }
  
  // Test: Responsive breakpoints
  results.total++
  try {
    const battle = new Battle({ 
      verbose: false,
      timeout: 5000,
      cols: 120,
      rows: 30
    })
    
    const result = await battle.run(async (b) => {
      await b.spawn('node', ['-e', `
        const { Viewport } = require('./dist/index.js')
        const viewport = Viewport.getInstance()
        
        const breakpoint = viewport.getBreakpoint()
        const isLandscape = viewport.isLandscape()
        const safeArea = viewport.getSafeArea(2)
        const grid = viewport.grid(4, 3)
        
        console.log('BREAKPOINT:' + breakpoint)
        console.log('LANDSCAPE:' + isLandscape)
        console.log('SAFE_AREA:' + safeArea.width + 'x' + safeArea.height)
        console.log('GRID_4x3:' + grid.colWidth + 'x' + grid.rowHeight)
        
        console.log('RESPONSIVE_TEST_COMPLETE')
      `])
      
      await b.expect('BREAKPOINT:lg')
      await b.expect('LANDSCAPE:true')
      await b.expect('SAFE_AREA:116x26')
      await b.expect('RESPONSIVE_TEST_COMPLETE')
    })
    
    if (result.success) {
      console.log('✅ Responsive breakpoints working correctly')
      results.passed++
    } else {
      console.log('❌ Responsive breakpoints failed:', result.error)
      results.failed++
    }
  } catch (e: any) {
    console.log('❌ Responsive breakpoints failed:', e.message)
    results.failed++
  }
  
  // Test: Grid and percentage calculations
  results.total++
  try {
    const battle = new Battle({ 
      verbose: false,
      timeout: 5000,
      cols: 100,
      rows: 40
    })
    
    const result = await battle.run(async (b) => {
      await b.spawn('node', ['-e', `
        const { Viewport } = require('./dist/index.js')
        const viewport = Viewport.getInstance()
        
        const dims = viewport.getDimensions()
        const halfWidth = viewport.percentWidth(50)
        const halfHeight = viewport.percentHeight(50)
        
        console.log('PERCENT_WIDTH_50:' + halfWidth)
        console.log('PERCENT_HEIGHT_50:' + halfHeight)
        console.log('EXPECTED_WIDTH_50:' + Math.floor(dims.width * 0.5))
        console.log('EXPECTED_HEIGHT_50:' + Math.floor(dims.height * 0.5))
        
        const grid = viewport.grid(5, 4)
        console.log('GRID_5x4:' + grid.colWidth + 'x' + grid.rowHeight)
        console.log('EXPECTED_GRID:' + Math.floor(dims.width/5) + 'x' + Math.floor(dims.height/4))
        
        console.log('CALCULATIONS_TEST_COMPLETE')
      `])
      
      await b.expect('PERCENT_WIDTH_50:50')
      await b.expect('PERCENT_HEIGHT_50:20')
      await b.expect('EXPECTED_WIDTH_50:50')
      await b.expect('EXPECTED_HEIGHT_50:20')
      await b.expect('GRID_5x4:20x10')
      await b.expect('EXPECTED_GRID:20x10')
      await b.expect('CALCULATIONS_TEST_COMPLETE')
    })
    
    if (result.success) {
      console.log('✅ Grid and percentage calculations working correctly')
      results.passed++
    } else {
      console.log('❌ Grid and percentage calculations failed:', result.error)
      results.failed++
    }
  } catch (e: any) {
    console.log('❌ Grid and percentage calculations failed:', e.message)
    results.failed++
  }
  
  // Test: Dimension history tracking
  results.total++
  try {
    const battle = new Battle({ 
      verbose: false,
      timeout: 5000
    })
    
    const result = await battle.run(async (b) => {
      await b.spawn('node', ['-e', `
        const { Viewport } = require('./dist/index.js')
        const viewport = Viewport.getInstance()
        
        const history = viewport.getDimensionHistory()
        console.log('HISTORY_LENGTH:' + history.length)
        console.log('HISTORY_AVAILABLE:' + (history.length > 0))
        
        if (history.length > 0) {
          const latest = history[history.length - 1]
          console.log('LATEST_DIMS:' + latest.width + 'x' + latest.height)
          console.log('HAS_TIMESTAMP:' + (typeof latest.timestamp === 'number'))
        }
        
        console.log('HISTORY_TEST_COMPLETE')
      `])
      
      await b.expect('HISTORY_AVAILABLE:true')
      await b.expect('HAS_TIMESTAMP:true')
      await b.expect('HISTORY_TEST_COMPLETE')
    })
    
    if (result.success) {
      console.log('✅ Dimension history tracking works')
      results.passed++
    } else {
      console.log('❌ Dimension history tracking failed:', result.error)
      results.failed++
    }
  } catch (e: any) {
    console.log('❌ Dimension history tracking failed:', e.message)
    results.failed++
  }
  
  // Test: Non-TTY environment handling
  results.total++
  try {
    const battle = new Battle({ 
      verbose: false,
      timeout: 5000
    })
    
    const result = await battle.run(async (b) => {
      // Test with script that doesn't have TTY
      await b.spawn('node', ['-e', `
        // Simulate non-TTY environment
        const originalDescriptor = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY')
        Object.defineProperty(process.stdout, 'isTTY', {
          value: false,
          configurable: true
        })
        
        const { Viewport } = require('./dist/index.js')
        const viewport = Viewport.getInstance()
        const dims = viewport.getDimensions()
        
        console.log('NON_TTY_DIMS:' + dims.width + 'x' + dims.height)
        console.log('DIMS_VALID:' + (dims.width > 0 && dims.height > 0))
        
        // Restore
        if (originalDescriptor) {
          Object.defineProperty(process.stdout, 'isTTY', originalDescriptor)
        }
        
        console.log('NON_TTY_TEST_COMPLETE')
      `])
      
      await b.expect('DIMS_VALID:true')
      await b.expect('NON_TTY_TEST_COMPLETE')
    })
    
    if (result.success) {
      console.log('✅ Non-TTY environment handling works')
      results.passed++
    } else {
      console.log('❌ Non-TTY environment handling failed:', result.error)
      results.failed++
    }
  } catch (e: any) {
    console.log('❌ Non-TTY environment handling failed:', e.message)
    results.failed++
  }
  
  
  console.log(`\nViewport Real Detection Tests: ${results.passed}/${results.total} passed`)
  return results
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testViewportRealDetection()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0)
    })
    .catch(error => {
      console.error('Test failed:', error)
      process.exit(1)
    })
}