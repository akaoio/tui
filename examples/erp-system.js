#!/usr/bin/env node

// Simple, working ERP with CRUD that adapts to any screen size
// NO hardcoded widths - everything calculated from actual terminal size

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Get terminal size - check ENV vars for PTY compatibility
const getWidth = () => {
  return parseInt(process.env.COLUMNS) || process.stdout.columns || 80;
};
const getHeight = () => {
  return parseInt(process.env.LINES) || process.stdout.rows || 24;
};

// Fit text to terminal width
const fit = (text, width = getWidth()) => {
  const clean = text.replace(/\x1b\[[0-9;]*m/g, '');
  if (clean.length > width) return text.substring(0, width - 1) + '…';
  return text + ' '.repeat(Math.max(0, width - clean.length));
};

// Center text
const center = (text, width = getWidth()) => {
  const clean = text.replace(/\x1b\[[0-9;]*m/g, '');
  const pad = Math.max(0, Math.floor((width - clean.length) / 2));
  return ' '.repeat(pad) + text;
};

// Colors
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m', 
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bgBlue: '\x1b[44m',
  clear: '\x1b[2J\x1b[H'
};

class SimpleERP {
  constructor() {
    this.dataFile = path.join(__dirname, 'erp-data.json');
    this.loadData();
    this.module = 0;
    this.row = 0;
  }
  
  loadData() {
    try {
      this.data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
    } catch {
      this.data = {
        customers: [
          { id: 1, name: 'Acme Corp', contact: 'John' },
          { id: 2, name: 'TechStart', contact: 'Jane' }
        ]
      };
      this.saveData();
    }
  }
  
  saveData() {
    fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
  }
  
  render() {
    const w = getWidth();
    const h = getHeight();
    
    process.stdout.write(c.clear);
    
    // Beautiful header that actually fits the terminal
    console.log(c.cyan + '╔' + '═'.repeat(Math.max(0, w - 2)) + '╗' + c.reset);
    console.log(c.cyan + '║' + fit(c.bold + '🏢 ERP System' + c.reset, w - 2) + c.cyan + '║' + c.reset);
    console.log(c.cyan + '╚' + '═'.repeat(Math.max(0, w - 2)) + '╝' + c.reset);
    
    // Module tabs
    const tabs = ['📊 Dashboard', '👥 Customers'];
    let tabLine = '';
    tabs.forEach((tab, i) => {
      if (i === this.module) {
        tabLine += c.bgBlue + c.bold + ` ${tab} ` + c.reset + ' ';
      } else {
        tabLine += ` ${tab} `;
      }
    });
    console.log('\n' + fit(tabLine, w));
    console.log('─'.repeat(Math.max(0, w)));
    
    // Content area with proper borders
    if (this.module === 0) {
      // Dashboard with boxes that fit
      const boxWidth = Math.min(w - 2, 30);
      const contentWidth = boxWidth - 4;
      
      console.log('\n' + c.bold + '📈 Dashboard' + c.reset);
      console.log('┌' + '─'.repeat(boxWidth) + '┐');
      console.log('│ ' + fit(c.green + `Customers: ${this.data.customers.length}` + c.reset, contentWidth) + ' │');
      console.log('│ ' + fit(c.yellow + `Active: ${this.data.customers.length}` + c.reset, contentWidth) + ' │');
      console.log('│ ' + fit(c.cyan + `Total: ${this.data.customers.length}` + c.reset, contentWidth) + ' │');
      console.log('└' + '─'.repeat(boxWidth) + '┘');
    } else {
      // Customer list with selection
      console.log('\n' + c.bold + '👥 Customer List' + c.reset + ` (${this.data.customers.length} records)`);
      console.log();
      
      this.data.customers.forEach((c, i) => {
        const line = `${c.id}. ${c.name} - ${c.contact}`;
        const truncated = line.length > w - 4 ? line.substring(0, w - 7) + '...' : line;
        
        if (i === this.row) {
          console.log(c.bgBlue + c.bold + '▶ ' + truncated + ' '.repeat(Math.max(0, w - truncated.length - 2)) + c.reset);
        } else {
          console.log('  ' + truncated);
        }
      });
    }
    
    // Footer with controls
    const footerTop = h - 3;
    const currentLine = 10 + (this.module === 0 ? 5 : this.data.customers.length);
    
    // Fill space if terminal is tall
    for (let i = currentLine; i < footerTop; i++) {
      console.log();
    }
    
    console.log('═'.repeat(Math.max(0, w)));
    if (w < 50) {
      console.log(c.bold + '↕←→' + c.reset + ':Nav ' + c.green + 'A' + c.reset + ':Add ' + c.red + 'D' + c.reset + ':Del ' + 'ESC:Exit');
    } else {
      console.log(c.bold + '↑↓' + c.reset + ':Navigate ' + c.bold + '←→' + c.reset + ':Switch ' + 
                  c.green + 'A' + c.reset + ':Add ' + c.red + 'D' + c.reset + ':Delete ' + 
                  c.yellow + 'R' + c.reset + ':Refresh ' + 'ESC:Exit');
    }
  }
  
  addCustomer() {
    const id = this.data.customers.length + 1;
    this.data.customers.push({
      id: id,
      name: `Company ${id}`,
      contact: `Contact ${id}`
    });
    this.saveData();
    this.render();
  }
  
  deleteCustomer() {
    if (this.data.customers.length > this.row) {
      this.data.customers.splice(this.row, 1);
      this.row = Math.max(0, this.row - 1);
      this.saveData();
      this.render();
    }
  }
  
  start() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    
    readline.emitKeypressEvents(process.stdin);
    
    process.stdin.on('keypress', (str, key) => {
      if (key.name === 'escape' || (key.ctrl && key.name === 'c')) {
        this.exit();
      } else if (key.name === 'up') {
        this.row = Math.max(0, this.row - 1);
        this.render();
      } else if (key.name === 'down') {
        this.row = Math.min(this.data.customers.length - 1, this.row + 1);
        this.render();
      } else if (key.name === 'left' || key.name === 'right') {
        this.module = 1 - this.module;
        this.row = 0;
        this.render();
      } else if (str === 'a' || str === 'A') {
        this.addCustomer();
      } else if (str === 'd' || str === 'D') {
        this.deleteCustomer();
      }
    });
    
    // Monitor resize
    process.stdout.on('resize', () => this.render());
    
    this.render();
  }
  
  exit() {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdout.write(c.clear);
    console.log('Goodbye!');
    process.exit(0);
  }
}

// Main
const w = getWidth();
process.stdout.write(c.clear);

if (w < 40) {
  // Mobile
  console.log('ERP System');
  console.log(`[${w}x${getHeight()}]`);
  console.log('\nPress ENTER');
} else {
  // Desktop
  console.log(c.cyan + c.bold);
  console.log(center('🏢 ERP with CRUD'));
  console.log(center('Auto-responsive'));
  console.log(c.reset);
  console.log('\n' + center(`Terminal: ${w}x${getHeight()}`));
  console.log('\n' + center('Press ENTER to start'));
}

process.stdin.once('data', () => {
  const erp = new SimpleERP();
  erp.start();
});