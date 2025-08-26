#!/usr/bin/env node

/**
 * Comprehensive Battle tests for all TUI examples
 * Tests for fake features, mocks, and unexpected exits
 */

const { Battle } = require('@akaoio/battle');
const path = require('path');
const fs = require('fs');

// Test unified dashboard
async function testUnifiedDashboard() {
  const b = new Battle();
  
  console.log('Testing unified-dashboard-simple.js...');
  
  await b.test('Unified Dashboard - Start and Navigation', async () => {
    await b.pty('node examples/unified-dashboard-simple.js');
    
    // Should see the dashboard header
    await b.expect('@akaoio Unified Dashboard');
    
    // Should show composer by default
    await b.expect('Composer');
    await b.expect('Documentation Engine');
    
    // Test switching to Battle (press 'b' or '2')
    await b.send('b');
    await b.wait(100);
    
    // Should switch to Battle
    await b.expect('Battle');
    await b.expect('Testing Framework');
    
    // Test switching to Builder (press 'u' or '3')
    await b.send('u');
    await b.wait(100);
    
    // Should switch to Builder
    await b.expect('Builder');
    await b.expect('Build System');
    
    // Test switching to Air (press 'a' or '4')
    await b.send('a');
    await b.wait(100);
    
    // Should switch to Air
    await b.expect('Air');
    await b.expect('P2P Database');
    
    // Test Enter key for selection
    await b.send('\r');
    await b.wait(200);
    
    // Should show selection menu
    await b.expectAny(['Select', 'Choose', 'Pick']);
    
    // Cancel selection
    await b.send('\x1b'); // ESC key
    await b.wait(100);
    
    // Test quit (press 'q')
    await b.send('q');
    await b.wait(100);
    
    // Should exit gracefully
    await b.expectAny(['Thank you', 'Goodbye', 'Bye']);
    
    // Check that process exits
    await b.expectExit(0);
  });
  
  await b.test('Unified Dashboard - Mobile Mode', async () => {
    // Test with small terminal size
    await b.pty('node examples/unified-dashboard-simple.js', {
      env: { ...process.env, COLUMNS: '40', LINES: '15' }
    });
    
    // Should detect mobile mode
    await b.expect('40×15');
    
    // Should show compact interface
    await b.expectAny(['[C]omp', 'Mobile', 'Compact']);
    
    // Test navigation in mobile mode
    await b.send('c');
    await b.wait(100);
    await b.expect('Composer');
    
    await b.send('q');
    await b.expectExit(0);
  });
  
  return b.report();
}

// Test responsive showcase
async function testResponsiveShowcase() {
  const b = new Battle();
  
  console.log('Testing responsive-showcase.js...');
  
  await b.test('Responsive Showcase - Component Navigation', async () => {
    await b.pty('node examples/responsive-showcase.js');
    
    // Should see intro
    await b.expect('Responsive Showcase');
    await b.expect('Press any key to start');
    
    // Start the app
    await b.send(' ');
    await b.wait(200);
    
    // Should show main menu
    await b.expect('Component Showcase');
    
    // Test component selection (press '1' for Input)
    await b.send('1');
    await b.wait(100);
    
    await b.expect('Input Component');
    
    // Test edit value (press 'e')
    await b.send('e');
    await b.wait(200);
    
    // Should prompt for input
    await b.expect('Enter');
    
    // Send some text
    await b.send('Test Value\r');
    await b.wait(100);
    
    // Go back (press 'b')
    await b.send('b');
    await b.wait(100);
    
    // Should be back at menu
    await b.expect('Component Showcase');
    
    // Test select component (press '2')
    await b.send('2');
    await b.wait(100);
    
    await b.expect('Select Component');
    
    // Test change selection (press 'c')
    await b.send('c');
    await b.wait(200);
    
    await b.expect('Choose');
    
    // Select an option
    await b.send('\r');
    await b.wait(100);
    
    // Go back to menu
    await b.send('b');
    await b.wait(100);
    
    // Test run all demos (press 'a')
    await b.send('a');
    await b.wait(300);
    
    await b.expect('Running All Component Demos');
    
    // Should run through demos
    await b.expect('Enter your name');
    await b.send('TestUser\r');
    await b.wait(100);
    
    await b.expect('Choose');
    await b.send('\r');
    await b.wait(100);
    
    await b.expect('Continue');
    await b.send('y\r');
    await b.wait(100);
    
    await b.expect('All demos completed');
    
    // Press any key to continue
    await b.send(' ');
    await b.wait(100);
    
    // Quit (press 'q')
    await b.send('q');
    await b.expectExit(0);
  });
  
  await b.test('Responsive Showcase - Breakpoint Detection', async () => {
    // Test mobile breakpoint
    await b.pty('node examples/responsive-showcase.js', {
      env: { ...process.env, COLUMNS: '45', LINES: '18' }
    });
    
    await b.send(' '); // Start
    await b.wait(100);
    
    // Should detect mobile mode
    await b.expect('Mobile');
    
    await b.send('q');
    await b.expectExit(0);
    
    // Test tablet breakpoint
    await b.pty('node examples/responsive-showcase.js', {
      env: { ...process.env, COLUMNS: '70', LINES: '24' }
    });
    
    await b.send(' '); // Start
    await b.wait(100);
    
    // Should detect tablet mode
    await b.expect('Tablet');
    
    await b.send('q');
    await b.expectExit(0);
    
    // Test desktop breakpoint
    await b.pty('node examples/responsive-showcase.js', {
      env: { ...process.env, COLUMNS: '120', LINES: '30' }
    });
    
    await b.send(' '); // Start
    await b.wait(100);
    
    // Should detect desktop mode
    await b.expect('Desktop');
    
    await b.send('q');
    await b.expectExit(0);
  });
  
  return b.report();
}

// Test mobile optimized
async function testMobileOptimized() {
  const b = new Battle();
  
  console.log('Testing mobile-optimized.js...');
  
  await b.test('Mobile Optimized - Basic Navigation', async () => {
    await b.pty('node examples/mobile-optimized.js');
    
    // Should show mobile UI
    await b.expect('Mobile TUI');
    await b.expect('Size:');
    
    // Should show menu
    await b.expect('1. Input');
    await b.expect('2. Select');
    await b.expect('3. List');
    await b.expect('4. Quit');
    
    // Test input (press '1')
    await b.send('1');
    await b.wait(200);
    
    await b.expect('Input');
    await b.expect('Name:');
    
    // Enter a name
    await b.send('TestName\r');
    await b.wait(100);
    
    await b.expect('Got: TestName');
    await b.expect('[Enter] Menu');
    
    // Go back to menu
    await b.send('\r');
    await b.wait(100);
    
    // Test select (press '2')
    await b.send('2');
    await b.wait(200);
    
    await b.expect('Select');
    await b.expect('Pick:');
    
    // Choose option
    await b.send('\r');
    await b.wait(100);
    
    await b.expectAny(['Chose:', 'Selected:']);
    
    // Go back to menu
    await b.send('\r');
    await b.wait(100);
    
    // Test list (press '3')
    await b.send('3');
    await b.wait(100);
    
    await b.expect('List');
    await b.expect('Task 1');
    await b.expect('Task 2');
    await b.expect('Task 3');
    
    // Go back to menu
    await b.send('\r');
    await b.wait(100);
    
    // Quit (press '4')
    await b.send('4');
    await b.wait(100);
    
    await b.expect('Bye');
    await b.expectExit(0);
  });
  
  return b.report();
}

// Test core tech integration
async function testCoreTechIntegration() {
  const b = new Battle();
  
  console.log('Testing core-tech-integration.js...');
  
  await b.test('Core Tech Integration - Main Menu', async () => {
    await b.pty('node examples/core-tech-integration.js /tmp/test-project');
    
    // Should show intro
    await b.expect('Core Technology Integration');
    await b.expect('Press any key to continue');
    
    // Start
    await b.send(' ');
    await b.wait(200);
    
    // Should show main menu
    await b.expectAny(['Core Technology Integration Suite', 'Select a technology']);
    
    // Look for available technologies or warning
    await b.expectAny([
      'Composer - Documentation Management',
      'Battle - Test Runner',
      'No core technologies detected',
      'System Status'
    ]);
    
    // Test quit
    await b.send('\x1b'); // ESC
    await b.wait(100);
    await b.send('q'); // or select Quit option
    await b.wait(100);
    
    await b.expectAny(['Thank you', 'Goodbye']);
    await b.expectExit(0);
  });
  
  return b.report();
}

// Test for unexpected exits and fake features
async function testForFakeFeaturesAndExits() {
  const b = new Battle();
  
  console.log('Testing for fake features and unexpected exits...');
  
  await b.test('Check for fake wait() function', async () => {
    // Check if wait function actually waits
    const startTime = Date.now();
    
    await b.pty('node -e "const demo = require(\\"./examples/unified-dashboard-simple.js\\"); demo.wait(1000).then(() => console.log(\\"waited\\"))"')
      .catch(() => {
        // Expected to fail if wait is not exported
      });
    
    const elapsed = Date.now() - startTime;
    
    // If it's a real wait, it should take at least 900ms
    if (elapsed < 900) {
      throw new Error('wait() function appears to be fake or not working');
    }
  });
  
  await b.test('Check for proper async handling', async () => {
    // Test that async functions actually wait for TUI operations
    await b.pty('node examples/unified-dashboard-simple.js');
    
    // Rapidly send multiple commands
    await b.send('1234babauauq');
    await b.wait(500);
    
    // Should not crash and should handle commands sequentially
    await b.expectAny(['Thank you', 'Goodbye', 'Bye']);
    
    // Should exit cleanly
    await b.expectExit(0);
  });
  
  await b.test('Check for proper error handling', async () => {
    // Test with invalid terminal size
    await b.pty('node examples/unified-dashboard-simple.js', {
      env: { ...process.env, COLUMNS: '0', LINES: '0' }
    });
    
    // Should handle gracefully
    await b.wait(200);
    
    // Should still be able to quit
    await b.send('q');
    await b.wait(100);
    
    // Should exit without crashing
    await b.expectExitAny([0, 1]);
  });
  
  return b.report();
}

// Main test runner
async function runAllTests() {
  console.log('========================================');
  console.log('  Battle Testing All TUI Examples');
  console.log('========================================\n');
  
  const results = [];
  
  try {
    // Build first
    console.log('Building TUI...');
    const { execSync } = require('child_process');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build complete.\n');
    
    // Run all tests
    results.push(await testUnifiedDashboard());
    results.push(await testResponsiveShowcase());
    results.push(await testMobileOptimized());
    results.push(await testCoreTechIntegration());
    results.push(await testForFakeFeaturesAndExits());
    
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
  
  // Summary
  console.log('\n========================================');
  console.log('           Test Summary');
  console.log('========================================\n');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  results.forEach(report => {
    if (report) {
      totalPassed += report.passed || 0;
      totalFailed += report.failed || 0;
    }
  });
  
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  
  if (totalFailed > 0) {
    console.log('\n⚠️ Some tests failed. Please review and fix the issues.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  }
}

// Run tests
runAllTests();