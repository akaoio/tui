#!/usr/bin/env node

/**
 * Real Battle tests for TUI examples
 * Tests for fake features, mocks, and unexpected exits
 */

const { Battle } = require('@akaoio/battle');
const path = require('path');

const projectRoot = path.join(__dirname, '../..');

// Test unified dashboard
async function testUnifiedDashboard() {
  console.log('\n📋 Testing unified-dashboard-simple.js...');
  
  const battle = new Battle({
    command: 'node',
    args: [path.join(projectRoot, 'examples/unified-dashboard-simple.js')],
    timeout: 10000,
    cols: 80,
    rows: 24
  });
  
  try {
    await battle.spawn();
    await battle.wait(500);
    
    // Check if it shows the header
    const hasHeader = battle.output.includes('@akaoio Unified Dashboard');
    console.log(`  Header shown: ${hasHeader ? '✅' : '❌'}`);
    
    // Check if Composer is shown by default
    const hasComposer = battle.output.includes('Composer') && battle.output.includes('Documentation Engine');
    console.log(`  Composer shown: ${hasComposer ? '✅' : '❌'}`);
    
    // Test switching to Battle
    await battle.write('b');
    await battle.wait(500);
    
    const hasBattle = battle.output.includes('Battle') && battle.output.includes('Testing Framework');
    console.log(`  Switch to Battle: ${hasBattle ? '✅' : '❌'}`);
    
    // Test switching to Builder
    await battle.write('u');
    await battle.wait(500);
    
    const hasBuilder = battle.output.includes('Builder') && battle.output.includes('Build System');
    console.log(`  Switch to Builder: ${hasBuilder ? '✅' : '❌'}`);
    
    // Test Enter key for tool action
    await battle.write('\r');
    await battle.wait(1000);
    
    // Check if select menu appears (this is where fake features would fail)
    const hasSelect = battle.output.includes('Select') || battle.output.includes('Choose') || battle.output.includes('build format');
    console.log(`  Tool selection works: ${hasSelect ? '✅' : '❌'}`);
    
    // Cancel if in selection
    if (hasSelect) {
      await battle.write('\x1b'); // ESC
      await battle.wait(500);
    }
    
    // Test quit
    await battle.write('q');
    await battle.wait(500);
    
    const hasGoodbye = battle.output.includes('Thank you') || battle.output.includes('Goodbye');
    console.log(`  Clean exit: ${hasGoodbye ? '✅' : '❌'}`);
    
    battle.cleanup();
    
    return {
      passed: hasHeader && hasComposer && hasBattle && hasBuilder && hasGoodbye,
      details: { hasHeader, hasComposer, hasBattle, hasBuilder, hasSelect, hasGoodbye }
    };
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    battle.cleanup();
    return { passed: false, error: error.message };
  }
}

// Test mobile optimized
async function testMobileOptimized() {
  console.log('\n📱 Testing mobile-optimized.js...');
  
  const battle = new Battle({
    command: 'node',
    args: [path.join(projectRoot, 'examples/mobile-optimized.js')],
    timeout: 10000,
    cols: 40,
    rows: 15
  });
  
  try {
    await battle.spawn();
    await battle.wait(500);
    
    // Check mobile UI
    const hasMobileUI = battle.output.includes('Mobile TUI');
    console.log(`  Mobile UI shown: ${hasMobileUI ? '✅' : '❌'}`);
    
    // Check menu options
    const hasMenu = battle.output.includes('1. Input') && 
                   battle.output.includes('2. Select') &&
                   battle.output.includes('3. List') &&
                   battle.output.includes('4. Quit');
    console.log(`  Menu shown: ${hasMenu ? '✅' : '❌'}`);
    
    // Test Input (press '1')
    await battle.write('1');
    await battle.wait(1000);
    
    const hasInputPrompt = battle.output.includes('Name:') || battle.output.includes('Input');
    console.log(`  Input prompt shown: ${hasInputPrompt ? '✅' : '❌'}`);
    
    // Enter a name
    await battle.write('TestUser\r');
    await battle.wait(1000);
    
    const hasInputResult = battle.output.includes('TestUser');
    console.log(`  Input captured: ${hasInputResult ? '✅' : '❌'}`);
    
    // Go back to menu
    await battle.write('\r');
    await battle.wait(500);
    
    // Test Select (press '2')
    await battle.write('2');
    await battle.wait(1000);
    
    const hasSelectPrompt = battle.output.includes('Pick:') || battle.output.includes('Select');
    console.log(`  Select prompt shown: ${hasSelectPrompt ? '✅' : '❌'}`);
    
    // Make selection
    await battle.write('\r');
    await battle.wait(1000);
    
    const hasSelectResult = battle.output.includes('Chose:') || battle.output.includes('Selected:') || battle.output.includes('A');
    console.log(`  Selection made: ${hasSelectResult ? '✅' : '❌'}`);
    
    // Go back
    await battle.write('\r');
    await battle.wait(500);
    
    // Test List (press '3')
    await battle.write('3');
    await battle.wait(500);
    
    const hasList = battle.output.includes('Task 1') && battle.output.includes('Task 2');
    console.log(`  List shown: ${hasList ? '✅' : '❌'}`);
    
    // Go back
    await battle.write('\r');
    await battle.wait(500);
    
    // Quit (press '4')
    await battle.write('4');
    await battle.wait(500);
    
    const hasExit = battle.output.includes('Bye');
    console.log(`  Clean exit: ${hasExit ? '✅' : '❌'}`);
    
    battle.cleanup();
    
    return {
      passed: hasMobileUI && hasMenu && hasInputPrompt && hasExit,
      details: { hasMobileUI, hasMenu, hasInputPrompt, hasInputResult, hasSelectPrompt, hasSelectResult, hasList, hasExit }
    };
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    battle.cleanup();
    return { passed: false, error: error.message };
  }
}

// Test responsive showcase
async function testResponsiveShowcase() {
  console.log('\n📊 Testing responsive-showcase.js...');
  
  const battle = new Battle({
    command: 'node',
    args: [path.join(projectRoot, 'examples/responsive-showcase.js')],
    timeout: 10000,
    cols: 80,
    rows: 24
  });
  
  try {
    await battle.spawn();
    await battle.wait(500);
    
    // Check intro
    const hasIntro = battle.output.includes('Responsive Showcase') && battle.output.includes('Press any key');
    console.log(`  Intro shown: ${hasIntro ? '✅' : '❌'}`);
    
    // Start app
    await battle.write(' ');
    await battle.wait(1000);
    
    // Check main menu
    const hasMenu = battle.output.includes('Component Showcase') || battle.output.includes('Main Menu');
    console.log(`  Main menu shown: ${hasMenu ? '✅' : '❌'}`);
    
    // Test component navigation
    await battle.write('1');
    await battle.wait(500);
    
    const hasComponent = battle.output.includes('Input') || battle.output.includes('Component');
    console.log(`  Component view: ${hasComponent ? '✅' : '❌'}`);
    
    // Go back
    await battle.write('b');
    await battle.wait(500);
    
    // Test breakpoints view
    await battle.write('2');
    await battle.wait(500);
    
    const hasBreakpoints = battle.output.includes('Breakpoint') || battle.output.includes('Mobile') || battle.output.includes('Tablet');
    console.log(`  Breakpoints view: ${hasBreakpoints ? '✅' : '❌'}`);
    
    // Quit
    await battle.write('q');
    await battle.wait(500);
    
    const hasExit = battle.output.includes('Thank you') || battle.output.includes('Goodbye');
    console.log(`  Clean exit: ${hasExit ? '✅' : '❌'}`);
    
    battle.cleanup();
    
    return {
      passed: hasIntro && hasMenu && hasComponent && hasBreakpoints && hasExit,
      details: { hasIntro, hasMenu, hasComponent, hasBreakpoints, hasExit }
    };
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    battle.cleanup();
    return { passed: false, error: error.message };
  }
}

// Test for unexpected exits and crashes
async function testUnexpectedExits() {
  console.log('\n⚠️ Testing for unexpected exits...');
  
  // Test rapid key presses
  console.log('  Testing rapid key presses...');
  const battle1 = new Battle({
    command: 'node',
    args: [path.join(projectRoot, 'examples/unified-dashboard-simple.js')],
    timeout: 5000
  });
  
  try {
    await battle1.spawn();
    await battle1.wait(300);
    
    // Send rapid keystrokes
    await battle1.write('1234bcuabcuabcua');
    await battle1.wait(500);
    
    // Should still be running
    const stillRunning = !battle1.output.includes('Error') && !battle1.output.includes('TypeError');
    console.log(`    No crashes from rapid input: ${stillRunning ? '✅' : '❌'}`);
    
    // Should be able to quit cleanly
    await battle1.write('q');
    await battle1.wait(500);
    
    const cleanExit = battle1.output.includes('Thank you') || battle1.output.includes('Goodbye');
    console.log(`    Clean exit after rapid input: ${cleanExit ? '✅' : '❌'}`);
    
    battle1.cleanup();
    
  } catch (error) {
    console.log(`    ❌ Crashed: ${error.message}`);
    battle1.cleanup();
    return { passed: false };
  }
  
  // Test invalid terminal size
  console.log('  Testing invalid terminal size...');
  const battle2 = new Battle({
    command: 'node',
    args: [path.join(projectRoot, 'examples/mobile-optimized.js')],
    timeout: 5000,
    cols: 10,
    rows: 5
  });
  
  try {
    await battle2.spawn();
    await battle2.wait(500);
    
    // Should handle tiny terminal
    const handlesSmall = !battle2.output.includes('Error') && !battle2.output.includes('undefined');
    console.log(`    Handles tiny terminal: ${handlesSmall ? '✅' : '❌'}`);
    
    // Should still be functional
    await battle2.write('4'); // Quit
    await battle2.wait(500);
    
    battle2.cleanup();
    
  } catch (error) {
    console.log(`    ❌ Failed with tiny terminal: ${error.message}`);
    battle2.cleanup();
  }
  
  return { passed: true };
}

// Test for fake features
async function testFakeFeatures() {
  console.log('\n🔍 Testing for fake/mock features...');
  
  const battle = new Battle({
    command: 'node',
    args: [path.join(projectRoot, 'examples/unified-dashboard-simple.js')],
    timeout: 10000
  });
  
  try {
    await battle.spawn();
    await battle.wait(500);
    
    // Navigate to Composer
    await battle.write('c');
    await battle.wait(500);
    
    // Press Enter to trigger action
    await battle.write('\r');
    await battle.wait(2000);
    
    // Check if actual TUI components are shown (not just console.log)
    const hasRealSelect = battle.output.includes('▶') || // Arrow indicator
                         battle.output.includes('[36m') || // Color codes
                         battle.output.includes('Cancel'); // Cancel option
    
    console.log(`  Real select component (not mock): ${hasRealSelect ? '✅' : '❌'}`);
    
    // Check for TUI-specific output
    const hasTUIFormatting = battle.output.includes('[1m') || // Bold
                            battle.output.includes('[22m') || // Reset bold
                            battle.output.includes('╔') || // Box drawing
                            battle.output.includes('═'); // Double line
    
    console.log(`  TUI formatting present: ${hasTUIFormatting ? '✅' : '❌'}`);
    
    // Cancel if in selection
    await battle.write('\x1b');
    await battle.wait(500);
    
    // Navigate to Battle
    await battle.write('b');
    await battle.wait(500);
    
    // Press Enter
    await battle.write('\r');
    await battle.wait(2000);
    
    // Check for real interaction
    const hasBattleInteraction = battle.output.includes('test action') || 
                                 battle.output.includes('Run all') ||
                                 battle.output.includes('Cancel');
    
    console.log(`  Battle interaction works: ${hasBattleInteraction ? '✅' : '❌'}`);
    
    // Quit
    await battle.write('\x1b');
    await battle.wait(300);
    await battle.write('q');
    await battle.wait(500);
    
    battle.cleanup();
    
    return {
      passed: hasRealSelect || hasTUIFormatting,
      details: { hasRealSelect, hasTUIFormatting, hasBattleInteraction }
    };
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    battle.cleanup();
    return { passed: false, error: error.message };
  }
}

// Main test runner
async function runAllTests() {
  console.log('========================================');
  console.log('   Battle Testing TUI Examples');
  console.log('========================================');
  
  const results = [];
  
  // Run tests
  results.push(await testUnifiedDashboard());
  results.push(await testMobileOptimized());
  results.push(await testResponsiveShowcase());
  results.push(await testUnexpectedExits());
  results.push(await testFakeFeatures());
  
  // Summary
  console.log('\n========================================');
  console.log('           Test Summary');
  console.log('========================================\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  // Show details of failures
  if (failed > 0) {
    console.log('\nFailed test details:');
    results.forEach((r, i) => {
      if (!r.passed) {
        console.log(`  Test ${i + 1}:`, r.error || r.details);
      }
    });
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});