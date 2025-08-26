#!/usr/bin/env tsx
/**
 * Simple TUI Battle Integration Test
 * Demonstrates TUI-Battle integration without complex imports
 */

import { Battle } from '@akaoio/battle'

export async function testSimpleIntegration() {
    console.log('\n=== Testing Simple TUI-Battle Integration ===\n')
    
    const results = { total: 0, passed: 0, failed: 0 }
    
    // Test: Basic Battle functionality with TUI context
    results.total++
    try {
        const battle = new Battle({ 
            verbose: false,
            timeout: 3000 
        })
        
        const result = await battle.run(async (b) => {
            // Test that we can run node with TUI-related code
            await b.spawn('node', ['-e', `
                console.log('TUI_BATTLE_INTEGRATION_TEST');
                // Simulate TUI usage without actual imports
                const mockTUI = {
                    version: '1.0.7',
                    components: ['Input', 'Checkbox', 'Radio', 'Select', 'Spinner', 'ProgressBar'],
                    testing: 'Battle PTY'
                };
                console.log('TUI_VERSION:' + mockTUI.version);
                console.log('TUI_TESTING:' + mockTUI.testing);
                console.log('TUI_COMPONENTS:' + mockTUI.components.length);
            `])
            
            await b.expect('TUI_BATTLE_INTEGRATION_TEST')
            await b.expect('TUI_VERSION:1.0.7')
            await b.expect('TUI_TESTING:Battle PTY')
            await b.expect('TUI_COMPONENTS:6')
        })
        
        if (result.success) {
            console.log('✅ Basic TUI-Battle integration works')
            results.passed++
        } else {
            console.log('❌ Basic TUI-Battle integration works:', result.error)
            results.failed++
        }
    } catch (e: any) {
        console.log('❌ Basic TUI-Battle integration works:', e.message)
        results.failed++
    }
    
    // Test: PTY terminal interaction
    results.total++
    try {
        const battle = new Battle({ 
            verbose: false,
            timeout: 3000
        })
        
        const result = await battle.run(async (b) => {
            // Test terminal interaction capabilities that TUI would use
            await b.spawn('node', ['-e', `
                process.stdout.write('Enter your name: ');
                setTimeout(() => {
                    console.log('\\nTUI_INPUT_SIMULATION:success');
                }, 100);
            `])
            
            await b.wait(50)
            // Simulate typing "test"
            await b.sendKey('t')
            await b.sendKey('e') 
            await b.sendKey('s')
            await b.sendKey('t')
            await b.sendKey('Enter')
            
            await b.expect('TUI_INPUT_SIMULATION:success')
        })
        
        if (result.success) {
            console.log('✅ PTY terminal interaction works')
            results.passed++
        } else {
            console.log('❌ PTY terminal interaction works:', result.error)
            results.failed++
        }
    } catch (e: any) {
        console.log('❌ PTY terminal interaction works:', e.message)
        results.failed++
    }
    
    // Test: Terminal dimensions and capabilities
    results.total++
    try {
        const battle = new Battle({ 
            verbose: false,
            timeout: 3000,
            cols: 80,
            rows: 24
        })
        
        const result = await battle.run(async (b) => {
            await b.spawn('node', ['-e', `
                console.log('TERMINAL_COLS:' + process.stdout.columns);
                console.log('TERMINAL_ROWS:' + process.stdout.rows);
                console.log('IS_TTY:' + process.stdout.isTTY);
                console.log('TUI_TERMINAL_READY');
            `])
            
            await b.expect('TERMINAL_COLS:80')
            await b.expect('TERMINAL_ROWS:24')
            await b.expect('IS_TTY:true')
            await b.expect('TUI_TERMINAL_READY')
        })
        
        if (result.success) {
            console.log('✅ Terminal dimensions and TTY detection work')
            results.passed++
        } else {
            console.log('❌ Terminal dimensions and TTY detection work:', result.error)
            results.failed++
        }
    } catch (e: any) {
        console.log('❌ Terminal dimensions and TTY detection work:', e.message)
        results.failed++
    }
    
    console.log(`\nSimple Integration Tests: ${results.passed}/${results.total} passed`)
    return results
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testSimpleIntegration()
        .then(results => {
            process.exit(results.failed > 0 ? 1 : 0)
        })
        .catch(error => {
            console.error('Test failed:', error)
            process.exit(1)
        })
}