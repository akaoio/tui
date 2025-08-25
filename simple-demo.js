#!/usr/bin/env node

// Simple TUI Demo - Test basic components
const { 
  Screen, 
  Keyboard,
  Input,
  Select,
  Checkbox,
  Radio,
  ProgressBar,
  Spinner,
  Form
} = require('./dist/index.js');

async function runDemo() {
  const screen = new Screen();
  const keyboard = new Keyboard();
  
  console.clear();
  console.log('=================================');
  console.log('     TUI Framework Demo v1.0.7   ');
  console.log('=================================\n');
  
  // 1. Input Demo
  console.log('📝 Input Component:');
  const input = new Input({
    label: 'Enter your name',
    placeholder: 'Type here...',
    value: ''
  });
  
  // Render input
  screen.clear();
  screen.write('Enter your name: ');
  
  // 2. Select Demo
  console.log('\n\n📋 Select Component:');
  const select = new Select({
    label: 'Choose option',
    options: [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
      { label: 'Option 3', value: '3' }
    ]
  });
  
  // 3. Checkbox Demo  
  console.log('\n✅ Checkbox Component:');
  const checkbox = new Checkbox({
    label: 'I agree to terms',
    checked: false
  });
  console.log(`[${checkbox.isChecked() ? 'x' : ' '}] ${checkbox.label}`);
  
  // 4. Radio Demo
  console.log('\n🔘 Radio Component:');
  const radio = new Radio({
    label: 'Select one',
    options: [
      { label: 'Red', value: 'red' },
      { label: 'Green', value: 'green' },
      { label: 'Blue', value: 'blue' }
    ]
  });
  
  // 5. Progress Bar Demo
  console.log('\n📊 Progress Bar:');
  const progress = new ProgressBar({
    label: 'Loading',
    total: 100,
    current: 0
  });
  
  // Animate progress
  for (let i = 0; i <= 100; i += 10) {
    progress.setProgress(i);
    process.stdout.write(`\rProgress: [${Array(Math.floor(i/5)).fill('=').join('')}${Array(20-Math.floor(i/5)).fill(' ').join('')}] ${i}%`);
    await new Promise(r => setTimeout(r, 100));
  }
  
  // 6. Spinner Demo
  console.log('\n\n⏳ Spinner Component:');
  const spinner = new Spinner({
    text: 'Processing...'
  });
  spinner.start();
  await new Promise(r => setTimeout(r, 2000));
  spinner.succeed('Done!');
  
  console.log('\n\n=================================');
  console.log('     Demo Complete! 🎉           ');
  console.log('=================================\n');
  
  console.log('Framework Features:');
  console.log('✅ Component-based architecture');
  console.log('✅ TypeScript support');  
  console.log('✅ Zero dependencies');
  console.log('✅ Schema-driven UI');
  console.log('✅ Keyboard navigation');
  console.log('✅ State management');
  
  process.exit(0);
}

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

// Run the demo
console.log('Starting TUI Demo...\n');
runDemo().catch(err => {
  console.error('Demo failed:', err);
  process.exit(1);
});