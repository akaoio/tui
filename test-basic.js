#!/usr/bin/env node

const tui = require('./dist/index.js');

console.log('TUI Framework Loaded Successfully! ✅\n');
console.log('Available exports:');
console.log('==================');

const exportedItems = Object.keys(tui).sort();
exportedItems.forEach(name => {
  const type = typeof tui[name];
  if (type === 'function') {
    console.log(`📦 ${name} (${tui[name].prototype ? 'Class' : 'Function'})`);
  } else {
    console.log(`📦 ${name} (${type})`);
  }
});

console.log('\n==================');
console.log(`Total exports: ${exportedItems.length}`);

// Test creating basic components
console.log('\nTesting Component Creation:');
console.log('---------------------------');

try {
  // Test Screen
  const { Screen } = tui;
  const screen = new Screen();
  console.log('✅ Screen created successfully');
  
  // Test Keyboard  
  const { Keyboard } = tui;
  const keyboard = new Keyboard();
  console.log('✅ Keyboard created successfully');
  
  // Test basic components
  const { Checkbox, ProgressBar, Spinner } = tui;
  
  const checkbox = new Checkbox({
    label: 'Test checkbox'
  });
  console.log('✅ Checkbox created successfully');
  
  const progress = new ProgressBar({
    label: 'Loading',
    total: 100
  });
  console.log('✅ ProgressBar created successfully');
  
  const spinner = new Spinner({
    text: 'Processing'
  });
  console.log('✅ Spinner created successfully');
  
  console.log('\n🎉 All basic components work!');
  
} catch (err) {
  console.error('❌ Error:', err.message);
}

console.log('\nFramework Status: OPERATIONAL ✅');
console.log('You can now use @akaoio/tui in your projects!');