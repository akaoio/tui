#!/usr/bin/env tsx

import { TUI } from '../src/index'

async function testConfirm() {
    const ui = new TUI({ title: 'Test Confirm Method' })
    
    // Test 1: After clearing and header
    console.log('Test 1: With header')
    ui.clear()
    const header = ui.createHeader()
    console.log(header)
    
    const result1 = await ui.confirm('Do you want to continue?', false)
    console.log(`Result: ${result1}\n`)
    
    // Test 2: Without clearing
    console.log('Test 2: Without clear')
    const result2 = await ui.confirm('Enable feature?', true)
    console.log(`Result: ${result2}\n`)
    
    // Test 3: Multiple in sequence
    console.log('Test 3: Multiple prompts')
    const result3 = await ui.confirm('First question?', false)
    console.log(`First: ${result3}`)
    const result4 = await ui.confirm('Second question?', true)
    console.log(`Second: ${result4}\n`)
    
    ui.close()
    console.log('All tests complete!')
}

testConfirm().catch(console.error)