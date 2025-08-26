const { TUI } = require('../../../dist/index.js');

async function runDemo() {
    const tui = new TUI();
    
    console.log('TUI_COMPONENT_ACTIVE');
    
    try {
        const spinner = tui.createSpinner('Loading...');
        spinner.start();
        
        // Simulate work
        setTimeout(() => {
            spinner.stop();
            console.log('\nSpinner complete!');
            process.exit(0);
        }, 2000);
    } catch (error) {
        console.error('Demo error:', error.message);
        process.exit(1);
    }
}

runDemo();