const { TUI } = require('../../../dist/index.js');

async function runDemo() {
    const tui = new TUI();
    
    console.log('TUI_COMPONENT_ACTIVE');
    
    try {
        // Simulate JSON editor workflow
        console.log('\n=== JSON Editor Demo ===');
        
        const jsonData = {
            name: 'test',
            value: 123,
            nested: {
                prop: 'value'
            }
        };
        
        console.log('Initial JSON:');
        console.log(JSON.stringify(jsonData, null, 2));
        
        // Simulate editing by asking for new values
        const newName = await tui.prompt('Edit name', jsonData.name);
        const newValue = await tui.prompt('Edit value', jsonData.value.toString());
        
        const updatedJson = {
            ...jsonData,
            name: newName,
            value: parseInt(newValue) || jsonData.value
        };
        
        console.log('\nUpdated JSON:');
        console.log(JSON.stringify(updatedJson, null, 2));
        
    } catch (error) {
        console.error('Demo error:', error.message);
    }
    
    process.exit(0);
}

runDemo();