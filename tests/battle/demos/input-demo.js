const { TUI } = require('../../../dist/index.js');

async function runDemo() {
    const tui = new TUI();
    
    console.log('TUI_COMPONENT_ACTIVE');
    
    try {
        const result = await tui.prompt('Enter text', 'default value');
        console.log(`Input result: ${result}`);
    } catch (error) {
        console.error('Demo error:', error.message);
    }
    
    process.exit(0);
}

runDemo();