
const { TUI } = require('../../dist/index.js');

const tui = new TUI({ title: 'Form Visual Test' });

console.log('TUI_COMPONENT_ACTIVE');
console.log(tui.createHeader());
tui.showInfo('Testing Form component');

// Display component info
const items = [
    { label: 'Component', value: 'Form', status: 'info' },
    { label: 'Test Type', value: 'Visual', status: 'success' },
    { label: 'Terminal', value: process.stdout.columns + 'x' + process.stdout.rows, status: 'info' }
];

console.log(tui.createStatusSection('Visual Test', items));

// Show different component states
if ('Form' === 'ProgressBar') {
    const progress = tui.showProgress('Loading', 50, 100);
    progress.update(75);
    progress.complete();
} else if ('Form' === 'Spinner') {
    const spinner = tui.createSpinner('Processing...');
    spinner.start();
    setTimeout(() => spinner.stop(), 500);
}

tui.showSuccess('Form rendered successfully');

// Exit cleanly
setTimeout(() => {
    tui.close();
    process.exit(0);
}, 200);
