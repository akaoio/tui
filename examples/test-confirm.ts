#!/usr/bin/env tsx

import { TUI } from '../src/index'

async function main() {
    const ui = new TUI({ title: 'Test Confirm Method' })
    
    try {
        console.log('Testing confirm method...\n')
        
        // Test 1: Default false
        const result1 = await ui.confirm('Do you want to continue?', false)
        console.log(`Result 1: ${result1}\n`)
        
        // Test 2: Default true
        const result2 = await ui.confirm('Enable feature X?', true)
        console.log(`Result 2: ${result2}\n`)
        
        // Test 3: Long question
        const result3 = await ui.confirm('This is a very long question that might wrap on smaller terminals. Do you agree with the terms and conditions?', false)
        console.log(`Result 3: ${result3}\n`)
        
        ui.showSuccess('All tests completed!')
    } catch (error) {
        ui.showError('Test failed', error.message)
    } finally {
        ui.close()
    }
}

main().catch(console.error)