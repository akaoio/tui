const { TUI } = require('../../../dist/index.js');

async function runDemo() {
    const tui = new TUI();
    
    console.log('TUI_COMPONENT_ACTIVE');
    
    try {
        const result = await tui.radio('Choose one', ['Option A', 'Option B', 'Option C'], 0);
        console.log(`Radio result: ${result}`);
    } catch (error) {
        console.error('Demo error:', error.message);
    }
    
    process.exit(0);
}

runDemo();