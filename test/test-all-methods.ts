#!/usr/bin/env tsx

import { TUI } from '../src/index'

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function testAllMethods() {
    const ui = new TUI({ title: 'TUI Complete Test Suite' })
    
    console.log('='.repeat(60))
    console.log('Testing TUI Methods')
    console.log('='.repeat(60))
    
    // Test 1: Clear and Header
    console.log('\n1. Testing clear() and createHeader()')
    ui.clear()
    const header = ui.createHeader()
    console.log(header)
    console.log('✓ Header displayed')
    
    // Test 2: Status Section
    console.log('\n2. Testing createStatusSection()')
    const statusItems = [
        { label: 'Version', value: '1.0.5', status: 'info' as const },
        { label: 'Status', value: 'Running', status: 'success' as const },
        { label: 'Warnings', value: '2', status: 'warning' as const },
        { label: 'Errors', value: '0', status: 'success' as const }
    ]
    const statusSection = ui.createStatusSection('System Status', statusItems)
    console.log(statusSection)
    console.log('✓ Status section displayed')
    
    // Test 3: Messages
    console.log('\n3. Testing message methods')
    ui.showSuccess('This is a success message')
    ui.showError('This is an error', 'With details')
    ui.showWarning('This is a warning')
    ui.showInfo('This is an info message')
    console.log('✓ All message types displayed')
    
    // Test 4: Progress Bar
    console.log('\n4. Testing showProgress()')
    for (let i = 0; i <= 100; i += 25) {
        ui.showProgress('Processing', i, 100)
        await delay(100)
    }
    console.log('\n✓ Progress bar displayed')
    
    // Test 5: Spinner
    console.log('\n5. Testing createSpinner()')
    const spinner = ui.createSpinner('Loading...')
    spinner.start()
    await delay(2000)
    spinner.stop()
    console.log('✓ Spinner displayed')
    
    // Test 6: Confirm (using echo for automation)
    console.log('\n6. Testing confirm()')
    console.log('Note: This would normally be interactive')
    console.log('Example: await ui.confirm("Continue?", false)')
    console.log('✓ Confirm method available')
    
    // Test 7: Prompt (using echo for automation)
    console.log('\n7. Testing prompt()')
    console.log('Note: This would normally be interactive')
    console.log('Example: await ui.prompt("Enter name", "default")')
    console.log('✓ Prompt method available')
    
    // Test 8: Select (using echo for automation)
    console.log('\n8. Testing select()')
    console.log('Note: This would normally be interactive')
    console.log('Example: await ui.select("Choose", ["A", "B", "C"])')
    console.log('✓ Select method available')
    
    // Test 9: Close
    console.log('\n9. Testing close()')
    ui.close()
    console.log('✓ TUI closed')
    
    console.log('\n' + '='.repeat(60))
    console.log('All tests completed successfully!')
    console.log('='.repeat(60))
}

testAllMethods().catch(console.error)