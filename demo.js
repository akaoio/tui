#!/usr/bin/env node

const { Lipgloss, initLip, huh } = require('./dist/index.js');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🎨 Initializing @akaoio/tui Demo...\n');
  
  // Initialize WASM
  const initialized = await initLip();
  if (!initialized) {
    console.error('❌ Failed to initialize WASM');
    process.exit(1);
  }
  
  console.log('✅ WASM initialized successfully!\n');
  console.log('=' .repeat(60));
  
  const lip = new Lipgloss();
  
  // Demo 1: Basic Styling
  console.log('\n📝 DEMO 1: Basic Text Styling\n');
  
  await lip.createStyle({
    id: 'title',
    canvasColor: { color: '#FF6B6B', background: '#4ECDC4' },
    bold: true,
    padding: [1, 4],
    margin: [1, 0]
  });
  
  const title = await lip.apply({ 
    value: '  Welcome to @akaoio/tui Demo!  ', 
    id: 'title' 
  });
  console.log(title);
  
  // Demo 2: Borders
  console.log('\n📦 DEMO 2: Border Styles\n');
  
  const borderTypes = ['rounded', 'block', 'thick', 'double'];
  
  for (const borderType of borderTypes) {
    await lip.createStyle({
      id: `border-${borderType}`,
      border: { 
        type: borderType, 
        foreground: '#00FF00',
        sides: [true, true, true, true]
      },
      padding: [1, 2],
      margin: [0, 0, 1, 0]
    });
    
    const bordered = await lip.apply({ 
      value: `This has ${borderType} border`, 
      id: `border-${borderType}`
    });
    console.log(bordered);
  }
  
  // Demo 3: Join Elements
  console.log('\n🔗 DEMO 3: Joining Elements\n');
  
  await lip.createStyle({
    id: 'box1',
    canvasColor: { background: '#FF00FF' },
    padding: [1, 2],
    width: 20,
    height: 5
  });
  
  await lip.createStyle({
    id: 'box2',
    canvasColor: { background: '#00FFFF' },
    padding: [1, 2],
    width: 20,
    height: 5
  });
  
  const box1 = await lip.apply({ value: 'Box 1', id: 'box1' });
  const box2 = await lip.apply({ value: 'Box 2', id: 'box2' });
  
  const joined = await lip.join({
    direction: 'horizontal',
    position: 'center',
    elements: [box1, box2]
  });
  console.log(joined);
  
  // Demo 4: Tables
  console.log('\n📊 DEMO 4: Tables\n');
  
  const table = await lip.newTable({
    data: {
      headers: ['Name', 'Age', 'City'],
      rows: [
        ['Alice', '25', 'New York'],
        ['Bob', '30', 'London'],
        ['Charlie', '35', 'Tokyo']
      ]
    },
    table: { 
      border: 'rounded', 
      color: '#FFFF00',
      width: 50
    },
    header: { 
      color: '#00FF00', 
      bold: true 
    },
    rows: {
      even: { color: '#808080' },
      odd: { color: '#FFFFFF' }
    }
  });
  console.log(table);
  
  // Demo 5: Lists
  console.log('\n📋 DEMO 5: Lists\n');
  
  const list = await lip.List({
    data: ['Install package', 'Import modules', 'Initialize WASM', 'Create styles', 'Apply styles'],
    selected: ['Initialize WASM'],
    listStyle: 'arabic',
    styles: {
      numeratorColor: '99',
      itemColor: '212',
      marginRight: 2
    }
  });
  console.log(list);
  
  // Demo 6: Markdown Rendering
  console.log('\n📄 DEMO 6: Markdown Rendering\n');
  
  const markdown = `
# @akaoio/tui Features

- **Bold text** support
- *Italic text* support
- \`Code blocks\`
- Lists and tables
- Multiple themes
  `;
  
  const renderedMd = await lip.RenderMD(markdown, 'dark');
  console.log(renderedMd);
  
  // Demo 7: Huh Forms (if available)
  console.log('\n📝 DEMO 7: Interactive Forms (Huh)\n');
  
  try {
    // Input form
    const inputPtr = huh.CreateInput(0);
    huh.SetInputOptions(inputPtr, {
      Title: 'What is your name?',
      Description: 'Enter your full name',
      Placeholder: 'John Doe',
      validators: ''
    });
    console.log('Input form created (would be interactive in terminal)');
    
    // Confirmation dialog
    console.log('\nConfirm Dialog Example:');
    console.log('Would you like to continue? [Y/n]');
    
    // Selection menu
    console.log('\nSelect Menu Example:');
    console.log('Choose your favorite color:');
    console.log('  > Red');
    console.log('    Blue');
    console.log('    Green');
    
    huh.FreeStruct(inputPtr);
  } catch (error) {
    console.log('Note: Interactive forms require terminal interaction');
  }
  
  // Demo 8: Themes
  console.log('\n🎨 DEMO 8: Color Themes\n');
  
  await lip.createStyle({
    id: 'adaptive',
    canvasColor: {
      color: {
        adaptiveColor: {
          Light: '#000000',
          Dark: '#FFFFFF'
        }
      },
      background: {
        adaptiveColor: {
          Light: '#FFFFFF',
          Dark: '#000000'
        }
      }
    },
    padding: [1, 3]
  });
  
  const adaptive = await lip.apply({
    value: 'This adapts to your terminal theme!',
    id: 'adaptive'
  });
  console.log(adaptive);
  
  // Demo 9: Complex Layout
  console.log('\n🏗️ DEMO 9: Complex Layout\n');
  
  await lip.createStyle({
    id: 'header',
    canvasColor: { background: '#333333', color: '#FFFFFF' },
    bold: true,
    alignH: 'center',
    width: 60,
    padding: [1, 0]
  });
  
  await lip.createStyle({
    id: 'content',
    border: { type: 'rounded', foreground: '#666666', sides: [true, true, true, true] },
    padding: [2, 4],
    width: 60,
    height: 10
  });
  
  await lip.createStyle({
    id: 'footer',
    canvasColor: { color: '#888888' },
    alignH: 'right',
    width: 60
  });
  
  const header = await lip.apply({ value: 'Application Header', id: 'header' });
  const content = await lip.apply({ 
    value: 'Main content area\n\nThis is where your application content goes.\nIt can span multiple lines and is nicely bordered.', 
    id: 'content' 
  });
  const footer = await lip.apply({ value: 'Footer © 2024', id: 'footer' });
  
  const layout = await lip.join({
    direction: 'vertical',
    position: 'left',
    elements: [header, content, footer]
  });
  console.log(layout);
  
  // Final message
  console.log('\n' + '='.repeat(60));
  console.log('\n✨ Demo completed successfully!');
  console.log('📦 Install: npm install @akaoio/tui');
  console.log('📚 Docs: https://github.com/akaoio/tui');
  console.log('\nThank you for trying @akaoio/tui! 🎉\n');
}

// Run demo
main().catch(error => {
  console.error('❌ Demo failed:', error);
  process.exit(1);
});