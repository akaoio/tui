/**
 * Simple Visual Demo - Shows basic TUI output cho agents
 */

const { drawBox, centerText } = require('../../src/utils/styles');
const { color, reset } = require('../../src/utils/colors');

function runDemo() {
  console.clear();
  
  const width = process.stdout.columns || 80;
  const height = process.stdout.rows || 24;
  
  console.log(`Terminal Size: ${width}x${height}`);
  console.log('='.repeat(width));
  
  // Header
  console.log(color('cyan') + 'TUI Framework Visual Demo' + reset());
  console.log('-'.repeat(width));
  
  // Input field simulation
  console.log('');
  console.log('Name: [Enter your name here...        ]');
  console.log('Email: [user@example.com             ]');
  console.log('');
  
  // Button simulation
  console.log('[ Submit ] [ Cancel ]');
  console.log('');
  
  // Box example using available styles
  try {
    const boxContent = drawBox ? drawBox(2, 10, 30, 5, 'Status Box') : 'Status: Active';
    console.log(boxContent);
  } catch (e) {
    console.log('┌─ Status Box ─┐');
    console.log('│ Status: Active │');
    console.log('└──────────────┘');
  }
  
  console.log('');
  console.log(color('green') + '✓ Visual Demo Complete' + reset());
  console.log('');
  console.log('This output allows agents to "see" TUI components:');
  console.log('- Input fields with placeholders');
  console.log('- Buttons with clear labels'); 
  console.log('- Box drawing characters');
  console.log('- Color coding for status');
  console.log('- Layout structure and spacing');
}

runDemo();