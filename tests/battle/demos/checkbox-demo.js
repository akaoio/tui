const { TUI } = require('../../../dist/index.js');

async function runDemo() {
    const tui = new TUI();
    
    console.log('TUI_COMPONENT_ACTIVE');
    
    try {
        const result = await tui.confirm('Check this box', false);
        console.log(`Checkbox result: ${result}`);
    } catch (error) {
        console.error('Demo error:', error.message);
    }
    
    process.exit(0);
}

runDemo();