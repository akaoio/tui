# TUI Examples

This directory contains examples demonstrating how to use the @akaoio/tui library.

## Running Examples

Make sure to build the library first:
```bash
npm run build
```

Then run any example:
```bash
npm run example:simple
npm run example:form
npm run example:components
```

Or run directly with tsx:
```bash
npx tsx examples/simple.ts
npx tsx examples/form.ts
npx tsx examples/components.ts
```

## Examples Overview

### simple.ts
Basic input field example with validation. Shows how to:
- Create a screen and keyboard handler
- Use the Input component
- Add validation
- Handle submit events

### form.ts
Complete form example with multiple components. Demonstrates:
- Creating a form with multiple fields
- Using Input, Select, Radio, and Checkbox components
- Form submission and cancellation
- Tab navigation between fields

### components.ts
Interactive demo of all components. Shows:
- Spinner with different styles
- Progress bar with live updates
- Select dropdown with scrolling
- Checkboxes with state management
- Radio button groups
- Component focus management

## Creating Your Own TUI Application

```typescript
import { Screen, Keyboard, Input } from '@akaoio/tui';

// 1. Initialize screen and keyboard
const screen = new Screen();
const keyboard = new Keyboard();

// 2. Create your components
const input = new Input(screen, keyboard, {
  x: 0,
  y: 5,
  placeholder: 'Type here...'
});

// 3. Set up event handlers
input.on('submit', (value) => {
  console.log('Submitted:', value);
});

// 4. Start keyboard listener
keyboard.start();

// 5. Render components
input.focus();
input.render();
```

## Component Templates

### Basic Input with Validation
```typescript
const emailInput = new Input(screen, keyboard, {
  placeholder: 'Enter email',
  validator: (value) => {
    if (!value.includes('@')) {
      return 'Invalid email';
    }
    return null;
  }
});
```

### Multi-select Dropdown
```typescript
const select = new Select(screen, keyboard, {
  multiple: true,
  options: [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 }
  ]
});
```

### Loading Spinner
```typescript
const spinner = new Spinner(screen, keyboard, {
  text: 'Processing...',
  style: 'dots'
});

spinner.start();
// ... async operation
spinner.succeed('Done!');
```

### Progress Tracking
```typescript
const progress = new ProgressBar(screen, keyboard, {
  total: 100,
  showPercentage: true
});

for (let i = 0; i <= 100; i++) {
  progress.setProgress(i);
  await sleep(50);
}
```