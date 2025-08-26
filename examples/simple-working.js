#!/usr/bin/env node

// Simple TUI example that actually works without hanging
const readline = require('readline');

class SimpleMenu {
  constructor(options) {
    this.options = options;
    this.selected = 0;
    this.rl = null;
  }

  async run() {
    return new Promise((resolve) => {
      // Create readline interface
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
      });

      // Enable raw mode for immediate key response
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }

      // Initial render
      this.render();

      // Handle keypress
      process.stdin.on('data', (key) => {
        const keyStr = key.toString();
        
        // Handle different keys
        if (keyStr === '\u0003' || keyStr === 'q') { // Ctrl+C or q
          this.cleanup();
          resolve(null);
        } else if (keyStr === '\r' || keyStr === '\n') { // Enter
          this.cleanup();
          resolve(this.options[this.selected]);
        } else if (keyStr === '\u001b[A' || keyStr === 'k') { // Up arrow or k
          this.selected = Math.max(0, this.selected - 1);
          this.render();
        } else if (keyStr === '\u001b[B' || keyStr === 'j') { // Down arrow or j
          this.selected = Math.min(this.options.length - 1, this.selected + 1);
          this.render();
        }
      });
    });
  }

  render() {
    // Clear screen and move to top
    process.stdout.write('\u001b[2J\u001b[H');
    
    // Title
    console.log('=== Simple TUI Menu ===\n');
    console.log('Use arrow keys or j/k to navigate, Enter to select, q to quit\n');
    
    // Render options
    this.options.forEach((option, index) => {
      const prefix = index === this.selected ? '> ' : '  ';
      const text = index === this.selected 
        ? `\u001b[36m${option}\u001b[0m`  // Cyan for selected
        : option;
      console.log(prefix + text);
    });
  }

  cleanup() {
    // Restore terminal state
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    process.stdin.removeAllListeners('data');
    this.rl.close();
    
    // Clear screen one more time
    process.stdout.write('\u001b[2J\u001b[H');
  }
}

// Test the menu
async function main() {
  const menu = new SimpleMenu([
    'Option 1: Start Server',
    'Option 2: Run Tests',
    'Option 3: Build Project',
    'Option 4: Deploy',
    'Option 5: Exit'
  ]);

  const selected = await menu.run();
  
  if (selected) {
    console.log(`You selected: ${selected}`);
  } else {
    console.log('Menu cancelled');
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

module.exports = { SimpleMenu };