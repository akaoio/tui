#!/usr/bin/env tsx
/**
 * TUI Battle Test Suite
 * Real PTY-based testing for Terminal UI components
 */

import { testSimpleIntegration } from './simple.battle.test.js'

export async function runTUIBattleTests() {
    console.log('========================================')
    console.log('   TUI BATTLE TEST SUITE')
    console.log('   Real PTY Terminal Testing')
    console.log('========================================')
    console.log()
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0
    }
    
    // Run simple integration tests
    const integrationResults = await testSimpleIntegration()
    results.total += integrationResults.total
    results.passed += integrationResults.passed
    results.failed += integrationResults.failed
    
    // Print final summary
    console.log()
    console.log('========================================')
    console.log('   TUI BATTLE TEST SUMMARY')
    console.log('========================================')
    console.log(`Total Tests: ${results.total}`)
    console.log(`✅ Passed: ${results.passed}`)
    console.log(`❌ Failed: ${results.failed}`)
    console.log('════════════════════════════════════════')
    
    if (results.failed === 0) {
        console.log('\n🎉 All TUI Battle tests passed!')
        console.log('✅ TUI is now properly integrated with Battle PTY testing')
    } else {
        console.log('\n❌ Some tests failed. Please review the output above.')
    }
    
    return results
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTUIBattleTests()
        .then(results => {
            process.exit(results.failed > 0 ? 1 : 0)
        })
        .catch(error => {
            console.error('Test suite failed:', error)
            process.exit(1)
        })
}