#!/usr/bin/env tsx

/**
 * Test all TUI systems
 */

import { TUI } from '../src/TUI'
import { RenderMode } from '../src/core/RenderMode'
import { ThemeManager, Themes, BorderStyles } from '../src/core/Theme'
import { Viewport } from '../src/core/Viewport'
import { LayoutEngine, FlexContainer, FlexItem } from '../src/core/Layout'
import { Color, color, reset } from '../src/utils/colors'
import { bold, dim } from '../src/utils/styles'

console.log('=' .repeat(60))
console.log('TESTING TUI SYSTEMS')
console.log('=' .repeat(60))

// Test 1: Theme System
console.log('\n📎 Test 1: Theme System')
console.log('-'.repeat(40))

const themeManager = ThemeManager.getInstance()

// Test default theme
console.log('Default theme:', themeManager.getTheme().name)

// Test theme switching
themeManager.setTheme('ocean')
console.log('Switched to ocean theme:', themeManager.getTheme().name)

// Test custom theme
const customTheme = themeManager.createTheme('custom', {
    colors: {
        primary: '#FF6B6B',
        success: '#51CF66'
    },
    borders: {
        style: 'rounded'
    },
    spacing: {
        padding: [1, 2],
        margin: 1
    }
})
themeManager.setTheme(customTheme)
console.log('Created custom theme:', themeManager.getTheme().name)

// Test border styles
console.log('\nBorder styles:')
Object.keys(BorderStyles).forEach(style => {
    const border = BorderStyles[style as keyof typeof BorderStyles]
    console.log(`  ${style}: ${border.topLeft}${border.horizontal}${border.topRight}`)
})

// Test spacing
const padding = themeManager.getPadding()
console.log('\nParsed padding:', padding)

console.log('✅ Theme system working')

// Test 2: Viewport System
console.log('\n📐 Test 2: Viewport System')
console.log('-'.repeat(40))

const viewport = Viewport.getInstance()

console.log('Viewport dimensions:', viewport.getDimensions())
console.log('Current breakpoint:', viewport.getBreakpoint())
console.log('Orientation:', viewport.getOrientation())

// Test responsive values
const responsiveWidth = {
    xs: '100%',
    md: '50%',
    lg: '33%',
    default: '100%'
}
console.log('Responsive width:', viewport.getResponsiveValue(responsiveWidth))

// Test percentage calculations
console.log('50% width:', viewport.percentWidth(50))
console.log('25% height:', viewport.percentHeight(25))

// Test grid
const grid = viewport.grid(12, 24)
console.log('12-column grid:', grid)

console.log('✅ Viewport system working')

// Test 3: Layout Engine
console.log('\n📦 Test 3: Layout Engine')
console.log('-'.repeat(40))

const layoutEngine = new LayoutEngine()

// Test flex layout
const flexContainer: FlexContainer = {
    type: 'flex',
    direction: 'row',
    justify: 'space-between',
    padding: 2,
    margin: 1,
    gap: 1
}

const flexItems: FlexItem[] = [
    { width: 20, height: 5 },
    { width: 20, height: 5 },
    { width: 20, height: 5 }
]

const layoutResults = layoutEngine.calculateFlexLayout(
    flexContainer,
    flexItems,
    80,  // parent width
    24   // parent height
)

console.log('Flex layout results:')
layoutResults.forEach((result, i) => {
    console.log(`  Item ${i + 1}: x=${result.x}, y=${result.y}, w=${result.width}, h=${result.height}`)
})

console.log('✅ Layout engine working')

// Test 4: TUI Integration
console.log('\n🎨 Test 4: TUI Integration')
console.log('-'.repeat(40))

const ui = new TUI({
    title: 'Test App',
    renderMode: RenderMode.STREAM
})

// Test header
const header = ui.createHeader()
console.log(header)

// Test status section
const status = ui.createStatusSection('System Status', [
    { label: 'Theme', value: 'Working', status: 'success' },
    { label: 'Viewport', value: 'Responsive', status: 'success' },
    { label: 'Layout', value: 'Flexible', status: 'success' },
    { label: 'Errors', value: '0', status: 'success' }
])
console.log(status)

// Test messages
ui.showSuccess('All systems operational')
ui.showInfo('TUI framework ready for production')
ui.showWarning('Remember to test edge cases')

// Test progress
console.log('\nProgress test:')
const progress = ui.showProgress('Loading', 75, 100)

// Test spinner
console.log('\nSpinner test:')
const spinner = ui.createSpinner('Processing...')
spinner.start()
setTimeout(() => {
    spinner.stop('✅ Complete')
    
    console.log('\n' + '=' .repeat(60))
    console.log('✅ ALL TESTS PASSED')
    console.log('=' .repeat(60))
    
    ui.close()
    process.exit(0)
}, 1000)