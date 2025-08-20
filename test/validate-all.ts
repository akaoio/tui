#!/usr/bin/env tsx

/**
 * Complete validation of TUI framework
 * Tests all components and features
 */

import { TUI } from '../src/TUI'
import { RenderMode } from '../src/core/RenderMode'
import { ThemeManager, Themes } from '../src/core/Theme'
import { Viewport } from '../src/core/Viewport'
import { Color, color, reset } from '../src/utils/colors'
import { bold, dim } from '../src/utils/styles'

async function validateTUI() {
    console.log('=' .repeat(60))
    console.log(bold('TUI FRAMEWORK VALIDATION'))
    console.log('=' .repeat(60))
    
    const results: { test: string; passed: boolean; error?: string }[] = []
    
    // Test 1: TUI Initialization
    try {
        const ui = new TUI({
            title: 'Validation Test',
            renderMode: RenderMode.STREAM
        })
        results.push({ test: 'TUI Initialization', passed: true })
        ui.close()
    } catch (error) {
        results.push({ test: 'TUI Initialization', passed: false, error: String(error) })
    }
    
    // Test 2: Theme System
    try {
        const themeManager = ThemeManager.getInstance()
        themeManager.setTheme('modern')
        const theme = themeManager.getTheme()
        if (theme.name !== 'modern') throw new Error('Theme not set correctly')
        results.push({ test: 'Theme System', passed: true })
    } catch (error) {
        results.push({ test: 'Theme System', passed: false, error: String(error) })
    }
    
    // Test 3: Viewport System
    try {
        const viewport = Viewport.getInstance()
        const dims = viewport.getDimensions()
        if (!dims.width || !dims.height) throw new Error('Invalid dimensions')
        results.push({ test: 'Viewport System', passed: true })
    } catch (error) {
        results.push({ test: 'Viewport System', passed: false, error: String(error) })
    }
    
    // Test 4: Stream Components
    try {
        const ui = new TUI({ renderMode: RenderMode.STREAM })
        
        // Test each component type
        const header = ui.createHeader()
        if (!header) throw new Error('Header creation failed')
        
        const status = ui.createStatusSection('Test', [
            { label: 'Status', value: 'OK', status: 'success' }
        ])
        if (!status) throw new Error('Status section creation failed')
        
        results.push({ test: 'Stream Components', passed: true })
        ui.close()
    } catch (error) {
        results.push({ test: 'Stream Components', passed: false, error: String(error) })
    }
    
    // Test 5: Color and Style Utils
    try {
        const colored = color(Color.Green) + 'Test' + reset()
        const styled = bold('Bold') + dim('Dim')
        if (!colored || !styled) throw new Error('Styling failed')
        results.push({ test: 'Color/Style Utils', passed: true })
    } catch (error) {
        results.push({ test: 'Color/Style Utils', passed: false, error: String(error) })
    }
    
    // Test 6: Responsive Values
    try {
        const viewport = Viewport.getInstance()
        const responsive = {
            xs: 10,
            md: 20,
            lg: 30,
            default: 15
        }
        const value = viewport.getResponsiveValue(responsive)
        if (typeof value !== 'number') throw new Error('Responsive value failed')
        results.push({ test: 'Responsive Values', passed: true })
    } catch (error) {
        results.push({ test: 'Responsive Values', passed: false, error: String(error) })
    }
    
    // Test 7: Messages
    try {
        const ui = new TUI({ renderMode: RenderMode.STREAM })
        ui.showSuccess('Success test')
        ui.showError('Error test')
        ui.showWarning('Warning test')
        ui.showInfo('Info test')
        results.push({ test: 'Message Display', passed: true })
        ui.close()
    } catch (error) {
        results.push({ test: 'Message Display', passed: false, error: String(error) })
    }
    
    // Test 8: Progress and Spinner
    try {
        const ui = new TUI({ renderMode: RenderMode.STREAM })
        const progress = ui.showProgress('Testing', 50, 100)
        const spinner = ui.createSpinner('Loading')
        spinner.start()
        spinner.stop()
        results.push({ test: 'Progress/Spinner', passed: true })
        ui.close()
    } catch (error) {
        results.push({ test: 'Progress/Spinner', passed: false, error: String(error) })
    }
    
    // Display Results
    console.log('\n' + bold('VALIDATION RESULTS:'))
    console.log('─'.repeat(60))
    
    let allPassed = true
    results.forEach(result => {
        const icon = result.passed ? '✅' : '❌'
        const status = result.passed ? color(Color.Green) + 'PASSED' + reset() : color(Color.Red) + 'FAILED' + reset()
        console.log(`${icon} ${result.test}: ${status}`)
        if (result.error) {
            console.log(`   ${dim('Error: ' + result.error)}`)
        }
        if (!result.passed) allPassed = false
    })
    
    console.log('─'.repeat(60))
    if (allPassed) {
        console.log('\n' + color(Color.Green) + bold('✅ ALL VALIDATION TESTS PASSED!') + reset())
        console.log(dim('The TUI framework is working correctly.'))
    } else {
        console.log('\n' + color(Color.Red) + bold('❌ SOME TESTS FAILED') + reset())
        console.log(dim('Please review the errors above.'))
        process.exit(1)
    }
    
    // Test Interactive Components (if in TTY)
    if (process.stdin.isTTY) {
        console.log('\n' + bold('Testing Interactive Components:'))
        console.log(dim('This will test prompt, select, and confirm...'))
        
        const ui = new TUI({
            title: 'Interactive Test',
            renderMode: RenderMode.STREAM
        })
        
        try {
            // Test prompt
            const name = await ui.prompt('Enter test name', 'Test')
            console.log('Prompt result:', name)
            
            // Test select
            const choice = await ui.select('Choose option', ['Option 1', 'Option 2', 'Option 3'])
            console.log('Select result:', choice)
            
            // Test confirm
            const confirmed = await ui.confirm('Confirm test?', true)
            console.log('Confirm result:', confirmed)
            
            console.log(color(Color.Green) + '\n✅ Interactive components working!' + reset())
        } catch (error) {
            console.log(color(Color.Red) + '\n❌ Interactive test failed: ' + error + reset())
        }
        
        ui.close()
    } else {
        console.log('\n' + dim('Skipping interactive tests (not in TTY)'))
    }
    
    console.log('\n' + '=' .repeat(60))
    console.log(bold('VALIDATION COMPLETE'))
    console.log('=' .repeat(60))
}

// Run validation
validateTUI().catch(console.error)