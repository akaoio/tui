# @akaoio/tui

A modern, lightweight Terminal UI framework for Node.js applications. Build beautiful command-line interfaces with keyboard navigation, forms, and interactive components.

[![npm version](https://badge.fury.io/js/@akaoio%2Ftui.svg)](https://www.npmjs.com/package/@akaoio/tui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🎯 **Simple & Intuitive API** - Get started in minutes with clean, readable code
- ⌨️ **Full Keyboard Navigation** - Arrow keys, Tab, Enter, Escape, and more
- 🧩 **Rich Component Library** - Input, Select, Checkbox, Radio, Spinner, ProgressBar, Forms
- 🎨 **Flexible Styling** - Colors, borders, text styles with ANSI escape codes
- 📦 **Zero Dependencies** - Pure Node.js/TypeScript, no heavy external packages
- 🔧 **TypeScript First** - Full type definitions for excellent IDE support
- 🚀 **Cross-Platform** - Works on Windows, macOS, and Linux
- 🪶 **Lightweight** - Small bundle size (~50KB)

## 📦 Installation

```bash
npm install @akaoio/tui
```

Or with yarn:
```bash
yarn add @akaoio/tui
```

Or with pnpm:
```bash
pnpm add @akaoio/tui
```

## 🚀 Quick Start

```typescript
import { Screen, Keyboard, Input } from '@akaoio/tui';

// Initialize screen and keyboard
const screen = new Screen();
const keyboard = new Keyboard();

// Create an input field
const nameInput = new Input(screen, keyboard, {
  placeholder: 'Enter your name...',
  validator: (value) => {
    if (value.length < 3) {
      return 'Name must be at least 3 characters';
    }
    return null;
  }
});

// Handle submit
nameInput.on('submit', (value) => {
  console.log(`Hello, ${value}!`);
  keyboard.stop();
  process.exit(0);
});

// Start the interface
screen.clear();
nameInput.focus();
nameInput.render();
keyboard.start();
```

## 📚 Components

### Input
Text input field with validation, password mode, and multiline support.

```typescript
const input = new Input(screen, keyboard, {
  placeholder: 'Type here...',
  password: true,      // Hide input characters
  multiline: true,     // Enable multiline text
  maxLength: 100,      // Character limit
  validator: (value) => {
    // Return error message or null
    return value.length < 3 ? 'Too short' : null;
  }
});

input.on('change', (value) => console.log('Changed:', value));
input.on('submit', (value) => console.log('Submitted:', value));
```

### Select (Dropdown)
Single or multiple selection dropdown menu.

```typescript
const select = new Select(screen, keyboard, {
  options: [
    { label: 'JavaScript', value: 'js' },
    { label: 'TypeScript', value: 'ts' },
    { label: 'Python', value: 'py' },
    { label: 'Go', value: 'go', disabled: true }
  ],
  multiple: true,      // Enable multiple selection
  maxDisplay: 5        // Max visible items
});

select.on('select', (value) => console.log('Selected:', value));
```

### Checkbox
Toggle checkbox with customizable label.

```typescript
const checkbox = new Checkbox(screen, keyboard, {
  label: 'I agree to the terms',
  checked: false
});

checkbox.on('change', (checked) => {
  console.log('Checkbox is:', checked ? 'checked' : 'unchecked');
});
```

### Radio Buttons
Single selection from multiple options.

```typescript
const radio = new Radio(screen, keyboard, {
  options: [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' }
  ],
  selected: 1,              // Default selection index
  orientation: 'vertical'   // or 'horizontal'
});

radio.on('change', (value) => console.log('Size:', value));
```

### Spinner
Animated loading indicator with multiple styles.

```typescript
const spinner = new Spinner(screen, keyboard, {
  text: 'Processing...',
  style: 'dots',  // dots, line, circle, square, arrow, pulse
  color: Color.Cyan
});

// Start spinning
spinner.start();

// Show different states
setTimeout(() => spinner.succeed('Complete!'), 3000);
// or: spinner.fail('Error!'), spinner.warn('Warning!'), spinner.info('Info')
```

### Progress Bar
Visual progress indicator with percentage display.

```typescript
const progress = new ProgressBar(screen, keyboard, {
  total: 100,
  current: 0,
  barWidth: 40,
  showPercentage: true,
  showNumbers: true,     // Show "50/100"
  barColor: Color.Green
});

// Update progress
let value = 0;
const interval = setInterval(() => {
  value += 10;
  progress.setProgress(value);
  
  if (value >= 100) {
    clearInterval(interval);
  }
}, 500);
```

### Form
Container for multiple components with navigation.

```typescript
const form = new Form(screen, keyboard, {
  title: 'User Registration',
  components: [
    nameInput,
    emailInput,
    countrySelect,
    termsCheckbox
  ],
  submitLabel: 'Register',
  cancelLabel: 'Cancel'
});

form.on('submit', (values) => {
  console.log('Form data:', values);
});

form.on('cancel', () => {
  console.log('Form cancelled');
});

form.activate();
```

## 🎨 Styling

### Colors
```typescript
import { Color, BgColor, color, hex, rgb } from '@akaoio/tui';

// ANSI colors
const text = color(Color.Red) + 'Red text' + reset();
const bgText = color(Color.White, BgColor.Blue) + 'White on blue' + reset();

// RGB colors (256 color mode)
const rgbText = rgb(255, 128, 0) + 'Orange text' + reset();
const rgbBg = bgRgb(64, 64, 64) + 'Dark gray background' + reset();

// Hex colors
const hexText = hex('#FF5733') + 'Hex color text' + reset();
const hexBg = bgHex('#2E86AB') + 'Hex background' + reset();
```

### Text Styles
```typescript
import { bold, italic, underline, strikethrough } from '@akaoio/tui';

console.log(bold('Bold text'));
console.log(italic('Italic text'));
console.log(underline('Underlined text'));
console.log(strikethrough('Strikethrough text'));

// Combine styles
console.log(bold(underline('Bold and underlined')));
```

### Box Drawing
```typescript
import { BoxStyles, drawBox } from '@akaoio/tui';

// Draw a box
const box = drawBox(40, 10, BoxStyles.Rounded);
box.forEach(line => console.log(line));

// Available styles:
// - BoxStyles.Single   (└─┘)
// - BoxStyles.Double   (╚═╝)
// - BoxStyles.Rounded  (╰─╯)
// - BoxStyles.Bold     (┗━┛)
// - BoxStyles.ASCII    (+--+)
```

## ⌨️ Keyboard Navigation

Built-in keyboard shortcuts:

- **Arrow Keys** (↑↓←→) - Navigate between options
- **Tab / Shift+Tab** - Move between form fields
- **Enter** - Select/Submit
- **Space** - Toggle checkboxes, select in lists
- **Escape** - Cancel/Close
- **Home/End** - Jump to first/last item
- **Page Up/Down** - Scroll through long lists
- **Ctrl+C** - Exit application

## 📖 Examples

Check out the `examples/` directory for complete working examples:

```bash
# Simple input example
npm run example:simple

# Complete form with validation
npm run example:form

# All components showcase
npm run example:components
```

## 🔧 API Reference

### Screen
```typescript
const screen = new Screen(stdout?: WriteStream);

screen.clear();                          // Clear screen
screen.moveCursor(x: number, y: number); // Move cursor
screen.write(text: string);              // Write text
screen.writeLine(text: string);          // Write line
screen.writeAt(x, y, text);             // Write at position
screen.hideCursor();                     // Hide cursor
screen.showCursor();                     // Show cursor
screen.getWidth();                       // Get terminal width
screen.getHeight();                      // Get terminal height
```

### Keyboard
```typescript
const keyboard = new Keyboard(stdin?: ReadStream);

keyboard.start();                        // Start listening
keyboard.stop();                         // Stop listening
keyboard.onKey((key, event) => {});     // Listen for key events
keyboard.onChar((char, event) => {});   // Listen for character input
```

### Component Base Class
All components extend from `Component` and share these methods:
```typescript
component.focus();                       // Focus component
component.blur();                        // Remove focus
component.show();                        // Show component
component.hide();                        // Hide component
component.getValue();                    // Get current value
component.setValue(value);               // Set value
component.render();                      // Re-render component
component.setPosition(x, y);            // Set position
component.setSize(width, height);       // Set size

// Events (all components)
component.on('change', (value) => {});
component.on('focus', () => {});
component.on('blur', () => {});
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/akaoio/tui.git
cd tui

# Install dependencies
npm install

# Build the library
npm run build

# Run tests
npm run test

# Run in watch mode
npm run dev
```

## 📄 License

MIT © [akaoio](https://github.com/akaoio)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🌟 Acknowledgments

This library was built from scratch with a focus on simplicity and practicality for backend Node.js applications.

## 📮 Support

- Create an [issue](https://github.com/akaoio/tui/issues) for bug reports
- Start a [discussion](https://github.com/akaoio/tui/discussions) for feature requests
- ⭐ Star the project if you find it useful!

---

Made with ❤️ by [akaoio](https://github.com/akaoio)