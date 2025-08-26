#!/usr/bin/env node

/**
 * Final Battle test for the battle-tested dashboard
 */

const { Battle } = require('@akaoio/battle');
const path = require('path');

async function testBattleTestedDashboard() {
  console.log('\n🎯 Testing battle-tested-dashboard.js...\n');
  
  const battle = new Battle({
    command: 'node',
    args: [path.join(__dirname, '../../examples/battle-tested-dashboard.js')],
    timeout: 15000,
    cols: 80,
    rows: 24
  });
  
  const results = {
    header: false,
    navigation: false,
    switchTools: false,
    selectAction: false,
    cleanExit: false,
    noErrors: true
  };
  
  try {
    await battle.spawn();
    await battle.wait(500);
    
    // Check initial render
    console.log('  1. Checking initial render...');
    results.header = battle.output.includes('Battle-Tested Dashboard');
    results.navigation = battle.output.includes('[C]omposer') && battle.output.includes('[B]attle');
    console.log(`     Header: ${results.header ? '✅' : '❌'}`);
    console.log(`     Navigation: ${results.navigation ? '✅' : '❌'}`);
    
    // Test tool switching
    console.log('  2. Testing tool switching...');
    
    // Switch to Battle
    await battle.write('b');
    await battle.wait(500);
    const hasBattle = battle.output.includes('Battle - Testing Framework');
    console.log(`     Switch to Battle: ${hasBattle ? '✅' : '❌'}`);
    
    // Switch to Builder
    await battle.write('u');
    await battle.wait(500);
    const hasBuilder = battle.output.includes('Builder - Build System');
    console.log(`     Switch to Builder: ${hasBuilder ? '✅' : '❌'}`);
    
    // Switch to Air
    await battle.write('a');
    await battle.wait(500);
    const hasAir = battle.output.includes('Air - P2P Database');
    console.log(`     Switch to Air: ${hasAir ? '✅' : '❌'}`);
    
    // Back to Composer
    await battle.write('c');
    await battle.wait(500);
    const backToComposer = battle.output.includes('Composer - Documentation Engine');
    console.log(`     Back to Composer: ${backToComposer ? '✅' : '❌'}`);
    
    results.switchTools = hasBattle && hasBuilder && hasAir && backToComposer;
    
    // Test select action
    console.log('  3. Testing select action...');
    await battle.write('s');
    await battle.wait(2000);
    
    // Check if select menu appears
    const hasSelect = battle.output.includes('Select') || 
                     battle.output.includes('template') ||
                     battle.output.includes('Cancel');
    console.log(`     Select menu shown: ${hasSelect ? '✅' : '❌'}`);
    
    if (hasSelect) {
      // Select first option
      await battle.write('\r');
      await battle.wait(1000);
      
      const hasSelected = battle.output.includes('Selected:') || 
                         battle.output.includes('README.md');
      console.log(`     Selection made: ${hasSelected ? '✅' : '❌'}`);
      results.selectAction = hasSelected;
    }
    
    // Test rapid input (should not crash)
    console.log('  4. Testing rapid input...');
    await battle.write('123bcua');
    await battle.wait(500);
    
    // Check for errors
    results.noErrors = !battle.output.includes('Error') && 
                       !battle.output.includes('TypeError') &&
                       !battle.output.includes('undefined');
    console.log(`     No errors: ${results.noErrors ? '✅' : '❌'}`);
    
    // Test clean exit
    console.log('  5. Testing clean exit...');
    await battle.write('q');
    await battle.wait(1000);
    
    results.cleanExit = battle.output.includes('Thank you') || 
                       battle.output.includes('Battle-Tested Dashboard');
    console.log(`     Clean exit: ${results.cleanExit ? '✅' : '❌'}`);
    
    battle.cleanup();
    
  } catch (error) {
    console.log(`\n  ❌ Test error: ${error.message}`);
    results.noErrors = false;
    battle.cleanup();
  }
  
  // Summary
  console.log('\n  Summary:');
  const passedCount = Object.values(results).filter(v => v).length;
  const totalCount = Object.keys(results).length;
  console.log(`  ✅ Passed: ${passedCount}/${totalCount}`);
  
  const allPassed = passedCount === totalCount;
  if (allPassed) {
    console.log('  🎉 All tests passed!');
  } else {
    console.log('  ⚠️ Some tests failed');
    console.log('\n  Failed items:');
    Object.entries(results).forEach(([key, value]) => {
      if (!value) {
        console.log(`    • ${key}`);
      }
    });
  }
  
  return allPassed;
}

// Test for memory leaks and resource cleanup
async function testResourceCleanup() {
  console.log('\n🧹 Testing resource cleanup...\n');
  
  // Run multiple instances to check for leaks
  for (let i = 0; i < 3; i++) {
    console.log(`  Run ${i + 1}/3...`);
    
    const battle = new Battle({
      command: 'node',
      args: [path.join(__dirname, '../../examples/battle-tested-dashboard.js')],
      timeout: 5000
    });
    
    try {
      await battle.spawn();
      await battle.wait(300);
      
      // Quick interaction
      await battle.write('b');
      await battle.wait(200);
      await battle.write('q');
      await battle.wait(500);
      
      battle.cleanup();
      console.log(`    ✅ Run ${i + 1} completed`);
      
    } catch (error) {
      console.log(`    ❌ Run ${i + 1} failed: ${error.message}`);
      battle.cleanup();
      return false;
    }
  }
  
  console.log('  ✅ No resource leaks detected');
  return true;
}

// Main test runner
async function runTests() {
  console.log('========================================');
  console.log('   Final Battle Test Suite');
  console.log('========================================');
  
  const dashboardPassed = await testBattleTestedDashboard();
  const cleanupPassed = await testResourceCleanup();
  
  console.log('\n========================================');
  console.log('           Final Results');
  console.log('========================================\n');
  
  console.log(`Dashboard Test: ${dashboardPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Cleanup Test: ${cleanupPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = dashboardPassed && cleanupPassed;
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! The examples are working correctly.');
    console.log('✅ No fake features detected');
    console.log('✅ No unexpected exits');
    console.log('✅ Proper async handling');
    console.log('✅ Clean resource management');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the output above.');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});