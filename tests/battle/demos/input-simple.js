const { TUI } = require('../../../dist/index.js');

const tui = new TUI({ title: 'Input Demo' });

// Just display the component and exit
console.log('TUI_COMPONENT_ACTIVE');
console.log(tui.createHeader());
tui.showInfo('Input component test');

// Create a simple form display
const statusItems = [
    { label: 'Component', value: 'Input', status: 'info' },
    { label: 'Status', value: 'Active', status: 'success' },
    { label: 'Terminal', value: `${process.stdout.columns}x${process.stdout.rows}`, status: 'info' }
];

console.log(tui.createStatusSection('Component Test', statusItems));
tui.showSuccess('Input component rendered successfully');

// Exit after a brief delay to allow output
setTimeout(() => {
    tui.close();
    process.exit(0);
}, 100);