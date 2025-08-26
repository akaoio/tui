const { TUI } = require('../../../dist/index.js');

async function runDemo() {
    const tui = new TUI();
    
    console.log('TUI_COMPONENT_ACTIVE');
    
    try {
        const result = await tui.select('Choose option', ['Option 1', 'Option 2', 'Option 3'], 0);
        console.log(`Select result: ${result}`);
    } catch (error) {
        console.error('Demo error:', error.message);
    }
    
    process.exit(0);
}

runDemo();