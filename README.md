# @akaoio/tui

Simple and practical Terminal UI framework for Node.js applications. Build interactive command-line interfaces with ease.

## Features

- 🎯 **Simple API** - Easy to learn and use
- ⌨️ **Full keyboard navigation** - Arrow keys, Tab, Enter, Escape, etc.
- 📦 **Rich components** - Input, Select, Checkbox, Radio, Spinner, ProgressBar, Forms
- 🎨 **Customizable styling** - Colors, borders, text styles
- 🔄 **No heavy dependencies** - Pure Node.js/TypeScript
- 📝 **TypeScript support** - Full type definitions included
- 🧪 **Well tested** - Comprehensive test suite
- 🚀 **Works everywhere** - Node.js, Bun, with or without TypeScript

## Installation

```bash
npm install @akaoio/tui
```

## Quick Start

```typescript
import { Screen, Keyboard, Input } from '@akaoio/tui';

const screen = new Screen();
const keyboard = new Keyboard();

const input = new Input(screen, keyboard, {
  placeholder: 'Enter your name...',
  validator: (value) => {
    if (value.length < 3) {
      return 'Name must be at least 3 characters';
    }
    return null;
  }
});

input.on('submit', (value) => {
  console.log(`Hello, ${value}!`);
  keyboard.stop();
  process.exit(0);
});

input.focus();
input.render();
keyboard.start();
```

## Components

### Input
Text input field with validation support.

```typescript
const input = new Input(screen, keyboard, {
  placeholder: 'Enter text...',
  password: true,  // Hide input
  multiline: true, // Multi-line text area
  maxLength: 100,  // Character limit
  validator: (value) => {
    // Return error message or null
    return value.length < 3 ? 'Too short' : null;
  }
});
```

### Select
Dropdown menu with single or multiple selection.

```typescript
const select = new Select(screen, keyboard, {
  options: [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Disabled', value: 3, disabled: true }
  ],
  multiple: true,  // Allow multiple selection
  maxDisplay: 5    // Max visible items
});
```

### Checkbox
Toggle checkbox with label.

```typescript
const checkbox = new Checkbox(screen, keyboard, {
  label: 'Accept terms',
  checked: false,
  disabled: false
});

checkbox.on('change', (checked) => {
  console.log('Checkbox is now:', checked);
});
```

### Radio
Radio button group for single selection.

```typescript
const radio = new Radio(screen, keyboard, {
  options: [
    { label: 'Small', value: 's' },
    { label: 'Medium', value: 'm' },
    { label: 'Large', value: 'l' }
  ],
  selected: 1,  // Default selection index
  orientation: 'vertical' // or 'horizontal'
});
```

### Spinner
Loading indicator with various styles.

```typescript
const spinner = new Spinner(screen, keyboard, {
  text: 'Loading...',
  style: 'dots', // dots, line, circle, square, arrow, pulse
  color: Color.Cyan
});

spinner.start();
// ... async operation
spinner.succeed('Done!');
// or spinner.fail('Error!');
```

### ProgressBar
Visual progress indicator.

```typescript
const progress = new ProgressBar(screen, keyboard, {
  total: 100,
  current: 0,
  barWidth: 40,
  showPercentage: true,
  showNumbers: true
});

// Update progress
progress.setProgress(50);
progress.increment(10);
```

### Form
Container for multiple components with navigation.

```typescript
const form = new Form(screen, keyboard, {
  title: 'User Registration',
  components: [nameInput, emailInput, countrySelect, termsCheckbox],
  submitLabel: 'Register',
  cancelLabel: 'Cancel'
});

form.on('submit', (values) => {
  console.log('Form data:', values);
});

form.activate();
```

## Keyboard Navigation

- **Arrow Keys** - Navigate between options
- **Tab/Shift+Tab** - Move between form fields
- **Enter** - Select/Submit
- **Space** - Toggle checkboxes, select in lists
- **Escape** - Cancel/Close
- **Ctrl+C** - Exit application

## Styling

### Colors
```typescript
import { Color, color, hex, rgb } from '@akaoio/tui';

// ANSI colors
color(Color.Red, BgColor.White);

// RGB colors
rgb(255, 128, 0);

// Hex colors
hex('#FF8000');
```

### Text Styles
```typescript
import { bold, italic, underline } from '@akaoio/tui';

bold('Bold text');
italic('Italic text');
underline('Underlined text');
```

### Boxes
```typescript
import { BoxStyles, drawBox } from '@akaoio/tui';

const box = drawBox(40, 10, BoxStyles.Rounded);
// Also available: Single, Double, Bold, ASCII
```

## Examples

Check the `examples/` directory for complete examples:

- `simple.ts` - Basic input example
- `form.ts` - Complete form with validation
- `components.ts` - All components showcase

Run examples:
```bash
npm run example:simple
npm run example:form
npm run example:components
```

## API Reference

### Screen
- `clear()` - Clear the screen
- `moveCursor(x, y)` - Move cursor to position
- `write(text)` - Write text at current position
- `writeAt(x, y, text)` - Write text at specific position
- `hideCursor()/showCursor()` - Toggle cursor visibility

### Keyboard
- `start()/stop()` - Start/stop keyboard listener
- `onKey(callback)` - Listen for key events
- `onChar(callback)` - Listen for character input

### Component (base class)
- `focus()/blur()` - Focus management
- `show()/hide()` - Visibility control
- `getValue()/setValue()` - Value management
- `render()` - Render component
- Event: `change`, `focus`, `blur`

## Requirements

- Node.js >= 14.0.0
- Terminal with TTY support
- UTF-8 encoding support for special characters

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Credits

This is a complete rewrite focused on simplicity and practicality, inspired by various TUI libraries but built from scratch with a focus on real-world usage in backend projects.