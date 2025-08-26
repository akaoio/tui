const { TUI } = require('../../../dist/index.js');

async function runDemo() {
    const tui = new TUI();
    
    console.log('TUI_COMPONENT_ACTIVE');
    
    try {
        // Show progress bar simulation
        let current = 0;
        const total = 100;
        
        const progress = tui.showProgress('Loading', current, total);
        
        // Simulate progress updates
        const interval = setInterval(() => {
            current += 10;
            progress.update(current);
            
            if (current >= total) {
                clearInterval(interval);
                console.log('\nProgress complete!');
                process.exit(0);
            }
        }, 200);
    } catch (error) {
        console.error('Demo error:', error.message);
        process.exit(1);
    }
}

runDemo();