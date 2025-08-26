#!/usr/bin/env node

/**
 * Test the fixed TUI examples with Battle
 */

const { Battle } = require('@akaoio/battle');
const path = require('path');

const projectRoot = path.join(__dirname, '../..');

async function testFixedUnifiedDashboard() {
  console.log('\n📋 Testing unified-dashboard-fixed.js...');
  
  const battle = new Battle({
    command: 'node',
    args: [path.join(projectRoot, 'examples/unified-dashboard-fixed.js')],
    timeout: 10000,
    cols: 80,
    rows: 24
  });
  
  try {
    await battle.spawn();
    await battle.wait(500);
    
    // Check header
    console.log('  Checking header...');
    const hasHeader = battle.output.includes('@akaoio Unified Dashboard');
    console.log(`    Header: ${hasHeader ? '✅' : '❌'}`);
    
    // Check Composer (default)
    console.log('  Checking Composer...');
    const hasComposer = battle.output.includes('Composer') && battle.output.includes('Documentation Engine');
    console.log(`    Composer: ${hasComposer ? '✅' : '❌'}`);
    
    // Switch to Battle
    console.log('  Testing Battle switch...');
    await battle.write('b');
    await battle.wait(500);
    const hasBattle = battle.output.includes('Battle') && battle.output.includes('Testing Framework');
    console.log(`    Battle: ${hasBattle ? '✅' : '❌'}`);
    
    // Test Enter for action
    console.log('  Testing tool action...');
    await battle.write('\r');
    await battle.wait(2000);
    
    // Should show TUI select
    const hasSelect = battle.output.includes('Select') || 
                     battle.output.includes('Cancel') ||
                     battle.output.includes('Run all');
    console.log(`    Select menu: ${hasSelect ? '✅' : '❌'}`);
    
    // Cancel with ESC
    if (hasSelect) {
      await battle.write('\x1b');
      await battle.wait(500);
    }
    
    // Test quit
    console.log('  Testing quit...');
    await battle.write('q');
    await battle.wait(1000);
    
    const hasExit = battle.output.includes('Thank you') || battle.output.includes('Goodbye');
    console.log(`    Clean exit: ${hasExit ? '✅' : '❌'}`);
    
    battle.cleanup();
    
    return hasHeader && hasComposer && hasBattle && hasSelect && hasExit;
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    battle.cleanup();
    return false;
  }
}

async function testFixedMobileOptimized() {
  console.log('\n📱 Testing mobile-optimized-fixed.js...');
  
  const battle = new Battle({
    command: 'node',
    args: [path.join(projectRoot, 'examples/mobile-optimized-fixed.js')],
    timeout: 10000,
    cols: 40,
    rows: 15
  });
  
  try {
    await battle.spawn();
    await battle.wait(500);
    
    // Check mobile UI
    console.log('  Checking mobile UI...');
    const hasMobileUI = battle.output.includes('Mobile TUI');
    console.log(`    Mobile UI: ${hasMobileUI ? '✅' : '❌'}`);
    
    // Check menu
    const hasMenu = battle.output.includes('1. Input') && 
                   battle.output.includes('2. Select') &&
                   battle.output.includes('3. List');
    console.log(`    Menu: ${hasMenu ? '✅' : '❌'}`);
    
    // Test Input
    console.log('  Testing input...');
    await battle.write('1');
    await battle.wait(1000);
    
    const hasInput = battle.output.includes('Name:') || battle.output.includes('Input');
    console.log(`    Input prompt: ${hasInput ? '✅' : '❌'}`);
    
    // Enter name
    await battle.write('TestUser\r');
    await battle.wait(1000);
    
    const hasResult = battle.output.includes('TestUser');
    console.log(`    Input captured: ${hasResult ? '✅' : '❌'}`);
    
    // Back to menu
    await battle.write('\r');
    await battle.wait(500);
    
    // Test quit
    console.log('  Testing quit...');
    await battle.write('4');
    await battle.wait(1000);
    
    const hasExit = battle.output.includes('Bye');
    console.log(`    Clean exit: ${hasExit ? '✅' : '❌'}`);
    
    battle.cleanup();
    
    return hasMobileUI && hasMenu && hasInput && hasResult && hasExit;
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    battle.cleanup();
    return false;
  }
}

async function testNoUnexpectedExits() {
  console.log('\n⚠️ Testing for unexpected exits in fixed versions...');
  
  const battle = new Battle({
    command: 'node',
    args: [path.join(projectRoot, 'examples/unified-dashboard-fixed.js')],
    timeout: 5000
  });
  
  try {
    await battle.spawn();
    await battle.wait(300);
    
    // Send rapid keystrokes
    console.log('  Sending rapid keystrokes...');
    await battle.write('123bcuabc');
    await battle.wait(500);
    
    // Check if still running
    const noErrors = !battle.output.includes('Error') && 
                    !battle.output.includes('TypeError') &&
                    !battle.output.includes('undefined');
    console.log(`    No crashes: ${noErrors ? '✅' : '❌'}`);
    
    // Should be able to quit
    await battle.write('q');
    await battle.wait(1000);
    
    const cleanExit = battle.output.includes('Thank you') || battle.output.includes('Goodbye');
    console.log(`    Clean exit: ${cleanExit ? '✅' : '❌'}`);
    
    battle.cleanup();
    
    return noErrors && cleanExit;
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    battle.cleanup();
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('========================================');
  console.log('  Testing Fixed TUI Examples');
  console.log('========================================');
  
  const results = [];
  
  results.push(await testFixedUnifiedDashboard());
  results.push(await testFixedMobileOptimized());
  results.push(await testNoUnexpectedExits());
  
  console.log('\n========================================');
  console.log('           Summary');
  console.log('========================================\n');
  
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All fixed examples work correctly!');
  } else {
    console.log('\n⚠️ Some tests still failing.');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});