#!/usr/bin/env node

/**
 * Debug Battle Test - Proves real interaction with ERP System
 * Shows actual output and keyboard input in real-time
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class DebugBattleTest {
  constructor() {
    this.logFile = 'battle-debug.log';
    this.screenshotDir = 'battle-screenshots';
    this.testNumber = 0;
    
    // Create screenshot directory
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir);
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(this.logFile, logMessage);
    console.log(message);
  }

  async saveScreenshot(name, content) {
    const filename = `${this.screenshotDir}/test-${this.testNumber}-${name}.txt`;
    fs.writeFileSync(filename, content);
    this.log(`📸 Screenshot saved: ${filename}`);
  }

  async runTest() {
    this.log('🚀 Starting DEBUG Battle Test - REAL INTERACTION PROOF');
    this.log('=' .repeat(60));
    
    // Start the REAL ERP process
    const erpPath = path.join(__dirname, '../../examples/erp-system.js');
    this.log(`Starting real process: ${erpPath}`);
    
    const erp = spawn('node', [erpPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let fullOutput = '';
    let lastChunk = '';
    
    // Capture REAL stdout from the process
    erp.stdout.on('data', (data) => {
      const text = data.toString();
      fullOutput += text;
      lastChunk = text;
      
      // Show first 3 lines of output to prove it's real
      const preview = text.split('\n').slice(0, 3).join('\n');
      if (preview.trim()) {
        this.log(`📺 REAL OUTPUT: ${preview.substring(0, 100)}...`);
      }
    });

    erp.stderr.on('data', (data) => {
      this.log(`❌ REAL ERROR: ${data.toString()}`);
    });

    // Helper to send key and wait
    const sendKey = async (key, description) => {
      this.testNumber++;
      this.log(`\n🎹 TEST ${this.testNumber}: Sending key '${description}' (${key.charCodeAt(0)})...`);
      
      // Clear last chunk to see new output
      lastChunk = '';
      
      // Send REAL keyboard input to the process
      erp.stdin.write(key);
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Save screenshot of what happened
      await this.saveScreenshot(description.replace(/\s+/g, '-'), lastChunk);
      
      // Check if we got output
      if (lastChunk.length > 0) {
        this.log(`✅ Process responded with ${lastChunk.length} bytes`);
        
        // Show key indicators from the output
        if (lastChunk.includes('Dashboard')) {
          this.log('  → Found: Dashboard');
        }
        if (lastChunk.includes('Customer')) {
          this.log('  → Found: Customer data');
        }
        if (lastChunk.includes('Inventory')) {
          this.log('  → Found: Inventory data');
        }
        if (lastChunk.includes('Thank you')) {
          this.log('  → Found: Exit message');
        }
      } else {
        this.log(`⚠️  No output received`);
      }
      
      return lastChunk;
    };

    // Run the actual test sequence
    try {
      // Wait for startup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TEST 1: Check if we got welcome screen
      if (fullOutput.includes('ENTERPRISE RESOURCE PLANNING')) {
        this.log('✅ VERIFIED: Real ERP welcome screen received');
        await this.saveScreenshot('welcome', fullOutput);
      } else {
        this.log('❌ FAILED: No welcome screen - process might not be running');
        throw new Error('Process not responding');
      }

      // TEST 2: Press ENTER to start
      await sendKey('\n', 'ENTER to start');
      
      // TEST 3: Navigate to Customers
      await sendKey('2', 'Number 2 for Customers');
      
      // TEST 4: Arrow down in table
      await sendKey('\x1b[B', 'Arrow DOWN');
      
      // TEST 5: Arrow up in table  
      await sendKey('\x1b[A', 'Arrow UP');
      
      // TEST 6: Navigate to Inventory
      await sendKey('3', 'Number 3 for Inventory');
      
      // TEST 7: Navigate to Orders
      await sendKey('4', 'Number 4 for Orders');
      
      // TEST 8: Back to Dashboard
      await sendKey('1', 'Number 1 for Dashboard');
      
      // TEST 9: Show help
      await sendKey('?', 'Question mark for Help');
      
      // TEST 10: Exit help
      await sendKey('\n', 'ENTER to exit help');
      
      // TEST 11: Exit application
      await sendKey('\x1b', 'ESC to exit');
      
      // Wait for exit
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Final verification
      this.log('\n' + '=' .repeat(60));
      this.log('📊 FINAL VERIFICATION:');
      this.log(`  Total output received: ${fullOutput.length} bytes`);
      this.log(`  Screenshots saved: ${this.testNumber}`);
      
      // Check key features were displayed
      const features = {
        'Welcome Screen': 'ENTERPRISE RESOURCE PLANNING',
        'Dashboard': 'Dashboard Overview',
        'Customers': 'Customer Management',
        'Inventory': 'Inventory Management',
        'Orders': 'Order Management',
        'Help System': 'ERP System Help',
        'Exit Message': 'Thank you for using'
      };
      
      let passed = 0;
      let failed = 0;
      
      for (const [name, text] of Object.entries(features)) {
        if (fullOutput.includes(text)) {
          this.log(`  ✅ ${name}: FOUND`);
          passed++;
        } else {
          this.log(`  ❌ ${name}: NOT FOUND`);
          failed++;
        }
      }
      
      this.log('\n' + '=' .repeat(60));
      this.log(`🏁 RESULTS: ${passed} passed, ${failed} failed`);
      
      if (failed === 0) {
        this.log('✨ ALL TESTS PASSED - REAL INTERACTION VERIFIED!');
        this.log(`📁 Check ${this.screenshotDir}/ for proof of interaction`);
        this.log(`📝 Check ${this.logFile} for complete log`);
      } else {
        this.log('💔 Some features not detected - check screenshots');
      }
      
    } catch (error) {
      this.log(`❌ Test failed: ${error.message}`);
    } finally {
      // Kill the process
      erp.kill();
      this.log('\n🔚 Test completed - process terminated');
    }
  }
}

// Run the debug test
const test = new DebugBattleTest();
test.runTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});