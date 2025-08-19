#!/usr/bin/env node

// Test script to verify the package works when installed via npm
// This simulates installing @akaoio/tui from npm and using it

console.log('🔍 Testing @akaoio/tui as external package...\n');

async function testExternalUsage() {
  try {
    // Import the package (simulating npm installed package)
    const { Lipgloss, initLip } = require('./dist/index.js');
    
    console.log('✅ Package imported successfully');
    
    // Test WASM initialization
    console.log('🎯 Initializing WASM...');
    const initialized = await initLip();
    
    if (!initialized) {
      throw new Error('WASM initialization failed');
    }
    
    console.log('✅ WASM initialized successfully');
    
    // Test basic functionality
    const lip = new Lipgloss();
    
    console.log('🎨 Testing basic styling...');
    
    await lip.createStyle({
      id: 'test-style',
      canvasColor: { color: '#00FF00', background: '#000000' },
      bold: true,
      padding: [1, 2],
      border: { type: 'rounded', foreground: '#FFFF00', sides: [true, true, true, true] }
    });
    
    const result = await lip.apply({ 
      value: 'Hello from @akaoio/tui!', 
      id: 'test-style' 
    });
    
    console.log('✅ Styled text result:');
    console.log(result);
    
    // Test table
    console.log('\n📊 Testing table functionality...');
    const table = await lip.newTable({
      data: {
        headers: ['Package', 'Version', 'Status'],
        rows: [
          ['@akaoio/tui', '0.2.3', '✅ Working'],
          ['WASM', 'v1.0', '✅ Loaded'],
          ['Binaries', 'ARM64+x64', '✅ Multi-arch']
        ]
      },
      table: { border: 'rounded', color: '#00FFFF' },
      header: { color: '#FFFF00', bold: true }
    });
    
    console.log(table);
    
    // Test markdown
    console.log('\n📄 Testing markdown rendering...');
    const markdown = await lip.RenderMD(`
# @akaoio/tui External Test

✅ **Package works correctly when installed via npm!**

- WASM loading: Success
- Basic styling: Success  
- Tables: Success
- Markdown: Success

## Next Steps
Try installing: \`npm install @akaoio/tui@0.2.3\`
`, 'dark');
    
    console.log(markdown);
    
    console.log('\n🎉 All external tests passed successfully!');
    console.log('📦 @akaoio/tui@0.2.3 is ready for production use');
    
  } catch (error) {
    console.error('❌ External test failed:', error);
    console.error('Stack:', error.stack);
    
    // Diagnostic info
    console.log('\n🔍 Diagnostic Information:');
    console.log('- Node.js version:', process.version);
    console.log('- Platform:', process.platform);
    console.log('- Architecture:', process.arch);
    console.log('- Working directory:', process.cwd());
    
    process.exit(1);
  }
}

testExternalUsage();