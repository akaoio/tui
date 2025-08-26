const { TUI } = require('../../../dist/index.js');

async function runDemo() {
    const tui = new TUI();
    
    console.log('TUI_COMPONENT_ACTIVE');
    
    try {
        // Simulate form workflow with individual components
        console.log('\n=== User Registration Form ===');
        
        const name = await tui.prompt('Name', 'John Doe');
        console.log(`Name entered: ${name}`);
        
        const email = await tui.prompt('Email', 'john@example.com');
        console.log(`Email entered: ${email}`);
        
        const role = await tui.select('Role', ['User', 'Admin', 'Guest'], 0);
        console.log(`Role selected: ${role}`);
        
        console.log('\n=== Form Complete ===');
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Role: ${role}`);
    } catch (error) {
        console.error('Demo error:', error.message);
    }
    
    process.exit(0);
}

runDemo();