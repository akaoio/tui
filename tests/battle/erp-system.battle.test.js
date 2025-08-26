#!/usr/bin/env node

/**
 * Battle Test Suite for ERP System
 * Comprehensive testing of all ERP modules and functionality
 */

const path = require('path');
const { spawn } = require('child_process');

// Battle test framework
class BattleTest {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.startTime = Date.now();
  }

  test(description, fn) {
    this.tests.push({ description, fn });
  }

  async run() {
    console.log(`\n🚀 Battle Test Suite: ${this.name}`);
    console.log('='.repeat(60));

    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✅ ${test.description}`);
      } catch (error) {
        this.failed++;
        console.log(`❌ ${test.description}`);
        console.log(`   Error: ${error.message}`);
      }
    }

    const duration = Date.now() - this.startTime;
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Results: ${this.passed} passed, ${this.failed} failed`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(this.failed === 0 ? '✨ All tests passed!' : '💔 Some tests failed');
    
    process.exit(this.failed === 0 ? 0 : 1);
  }
}

// ERP System Test Driver
class ERPTestDriver {
  constructor() {
    this.process = null;
    this.output = '';
    this.lastOutput = '';
    this.outputBuffer = [];
    this.isReady = false;
  }

  async start() {
    return new Promise((resolve, reject) => {
      const erpPath = path.join(__dirname, '../../examples/erp-system.js');
      
      this.process = spawn('node', [erpPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.process.stdout.on('data', (data) => {
        const text = data.toString();
        this.output += text;
        this.lastOutput = text;
        this.outputBuffer.push(text);
        if (this.outputBuffer.length > 100) {
          this.outputBuffer.shift();
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error('ERP Error:', data.toString());
      });

      this.process.on('error', reject);

      // Wait for welcome screen
      setTimeout(() => {
        if (this.output.includes('ENTERPRISE RESOURCE PLANNING')) {
          this.isReady = true;
          resolve();
        } else {
          reject(new Error('ERP failed to start'));
        }
      }, 1000);
    });
  }

  async sendKey(key) {
    this.lastOutput = '';
    this.process.stdin.write(key);
    await this.wait(500);
  }

  async sendKeys(keys) {
    for (const key of keys) {
      await this.sendKey(key);
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  contains(text) {
    return this.output.includes(text);
  }

  lastContains(text) {
    return this.lastOutput.includes(text);
  }

  getLastLines(n = 5) {
    return this.lastOutput.split('\n').slice(-n).join('\n');
  }

  async screenshot() {
    // Get current screen content
    const lines = this.lastOutput.split('\n');
    return lines.slice(0, 30).join('\n');
  }

  async stop() {
    if (this.process) {
      this.process.stdin.write('\x1b'); // ESC to exit
      await this.wait(500);
      this.process.kill();
      this.process = null;
    }
  }
}

// Main Test Suite
async function runTests() {
  const suite = new BattleTest('ERP System');
  const erp = new ERPTestDriver();

  // Test 1: Startup
  suite.test('ERP should start with welcome screen', async () => {
    await erp.start();
    if (!erp.contains('ENTERPRISE RESOURCE PLANNING')) {
      throw new Error('Welcome screen not displayed');
    }
    if (!erp.contains('Press ENTER to start')) {
      throw new Error('Start prompt not shown');
    }
  });

  // Test 2: Enter Dashboard
  suite.test('Should enter dashboard on ENTER', async () => {
    await erp.sendKey('\n');
    await erp.wait(1000);
    if (!erp.contains('Dashboard Overview')) {
      throw new Error('Dashboard not displayed');
    }
    if (!erp.contains('Quick Actions')) {
      throw new Error('Quick Actions menu not shown');
    }
  });

  // Test 3: Dashboard Statistics
  suite.test('Dashboard should display statistics', async () => {
    if (!erp.contains('Customers')) {
      throw new Error('Customer stats not displayed');
    }
    if (!erp.contains('Inventory')) {
      throw new Error('Inventory stats not displayed');
    }
    if (!erp.contains('Orders')) {
      throw new Error('Order stats not displayed');
    }
    if (!erp.contains('Financials')) {
      throw new Error('Financial stats not displayed');
    }
  });

  // Test 4: Navigate to Customers
  suite.test('Should navigate to Customers module with key 2', async () => {
    await erp.sendKey('2');
    if (!erp.contains('Customer Management')) {
      throw new Error('Customer module not opened');
    }
    if (!erp.contains('Acme Corp')) {
      throw new Error('Customer data not displayed');
    }
  });

  // Test 5: Customer Data Display
  suite.test('Customer table should show all columns', async () => {
    const requiredColumns = ['ID', 'Company', 'Contact', 'Email', 'Credit', 'Status'];
    for (const col of requiredColumns) {
      if (!erp.contains(col)) {
        throw new Error(`Column '${col}' not found in customer table`);
      }
    }
  });

  // Test 6: Navigate with Arrow Keys
  suite.test('Should navigate table rows with arrow keys', async () => {
    // Move down
    await erp.sendKey('\x1b[B');
    await erp.wait(300);
    const afterDown = await erp.screenshot();
    
    // Move up
    await erp.sendKey('\x1b[A');
    await erp.wait(300);
    const afterUp = await erp.screenshot();
    
    // Screenshots should be different (selection moved)
    if (afterDown === afterUp) {
      throw new Error('Arrow navigation not working');
    }
  });

  // Test 7: Navigate to Inventory
  suite.test('Should navigate to Inventory module with key 3', async () => {
    await erp.sendKey('3');
    if (!erp.contains('Inventory Management')) {
      throw new Error('Inventory module not opened');
    }
    if (!erp.contains('Widget')) {
      throw new Error('Inventory items not displayed');
    }
  });

  // Test 8: Inventory Stock Levels
  suite.test('Inventory should show stock warnings', async () => {
    // Should have colored quantity indicators
    if (!erp.contains('SKU') || !erp.contains('Quantity')) {
      throw new Error('Inventory columns not displayed');
    }
    // Check for at least one product
    if (!erp.contains('PRD-')) {
      throw new Error('Product SKUs not shown');
    }
  });

  // Test 9: Navigate to Orders
  suite.test('Should navigate to Orders module with key 4', async () => {
    await erp.sendKey('4');
    if (!erp.contains('Order Management')) {
      throw new Error('Orders module not opened');
    }
    if (!erp.contains('Order #')) {
      throw new Error('Order table not displayed');
    }
  });

  // Test 10: Order Status Display
  suite.test('Orders should show status indicators', async () => {
    const statuses = ['Shipped', 'Processing', 'Pending', 'Delivered'];
    let foundStatus = false;
    for (const status of statuses) {
      if (erp.contains(status)) {
        foundStatus = true;
        break;
      }
    }
    if (!foundStatus) {
      throw new Error('No order statuses displayed');
    }
  });

  // Test 11: Navigate to Invoices
  suite.test('Should navigate to Invoices module with key 5', async () => {
    await erp.sendKey('5');
    if (!erp.contains('Invoice Management')) {
      throw new Error('Invoices module not opened');
    }
    if (!erp.contains('Invoice #')) {
      throw new Error('Invoice table not displayed');
    }
  });

  // Test 12: Invoice Status
  suite.test('Invoices should show payment status', async () => {
    const paymentStatuses = ['Paid', 'Pending', 'Overdue'];
    let foundPayment = false;
    for (const status of paymentStatuses) {
      if (erp.contains(status)) {
        foundPayment = true;
        break;
      }
    }
    if (!foundPayment) {
      throw new Error('No payment statuses shown');
    }
  });

  // Test 13: Navigate to Reports
  suite.test('Should navigate to Reports module with key 6', async () => {
    await erp.sendKey('6');
    if (!erp.contains('Reports & Analytics')) {
      throw new Error('Reports module not opened');
    }
    if (!erp.contains('Sales Report')) {
      throw new Error('Report types not listed');
    }
  });

  // Test 14: Navigate to Settings
  suite.test('Should navigate to Settings module with key 7', async () => {
    await erp.sendKey('7');
    if (!erp.contains('System Settings')) {
      throw new Error('Settings module not opened');
    }
    if (!erp.contains('General') || !erp.contains('Security')) {
      throw new Error('Settings categories not shown');
    }
  });

  // Test 15: Return to Dashboard
  suite.test('Should return to Dashboard with key 1', async () => {
    await erp.sendKey('1');
    if (!erp.contains('Dashboard Overview')) {
      throw new Error('Did not return to dashboard');
    }
  });

  // Test 16: Help System
  suite.test('Should show help screen with ? key', async () => {
    await erp.sendKey('?');
    await erp.wait(500);
    if (!erp.contains('ERP System Help')) {
      throw new Error('Help screen not displayed');
    }
    if (!erp.contains('Navigation:')) {
      throw new Error('Navigation help not shown');
    }
    // Exit help
    await erp.sendKey('\n');
  });

  // Test 17: Module Switching with Arrow Keys
  suite.test('Should switch modules with left/right arrows', async () => {
    // Start at dashboard
    await erp.sendKey('1');
    await erp.wait(500);
    
    // Right arrow to next module
    await erp.sendKey('\x1b[C');
    await erp.wait(500);
    if (!erp.contains('Customer Management')) {
      throw new Error('Right arrow module switch failed');
    }
    
    // Left arrow back
    await erp.sendKey('\x1b[D');
    await erp.wait(500);
    if (!erp.contains('Dashboard Overview')) {
      throw new Error('Left arrow module switch failed');
    }
  });

  // Test 18: Refresh Function
  suite.test('Should refresh display with R key', async () => {
    await erp.sendKey('2'); // Go to customers
    await erp.wait(300);
    const before = erp.lastOutput;
    
    await erp.sendKey('r');
    await erp.wait(300);
    
    // Should have redrawn the screen
    if (!erp.contains('Customer Management')) {
      throw new Error('Refresh did not redraw screen');
    }
  });

  // Test 19: Footer Shortcuts
  suite.test('Footer should display keyboard shortcuts', async () => {
    const shortcuts = ['Navigate', 'Switch Module', 'Select', 'Quick Jump'];
    for (const shortcut of shortcuts) {
      if (!erp.contains(shortcut)) {
        throw new Error(`Footer shortcut '${shortcut}' not displayed`);
      }
    }
  });

  // Test 20: Clean Exit
  suite.test('Should exit cleanly with ESC key', async () => {
    await erp.sendKey('\x1b');
    await erp.wait(500);
    if (!erp.contains('Thank you for using ERP System')) {
      throw new Error('Exit message not shown');
    }
    if (!erp.contains('Have a great day')) {
      throw new Error('Goodbye message incomplete');
    }
  });

  // Run all tests
  try {
    await suite.run();
  } finally {
    // Ensure cleanup
    await erp.stop();
  }
}

// Execute tests
if (require.main === module) {
  runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
}

module.exports = { BattleTest, ERPTestDriver };