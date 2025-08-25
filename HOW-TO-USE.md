# 🚀 Hướng Dẫn Sử Dụng TUI Framework

## Cài đặt

```bash
npm install @akaoio/tui
```

## Sử dụng cơ bản

### 1. Import các components

```javascript
const { 
  Screen, 
  Keyboard, 
  Input, 
  Select,
  Checkbox,
  Radio,
  Form,
  ProgressBar,
  Spinner 
} = require('@akaoio/tui');

// Hoặc với ES6
import { Screen, Keyboard, Input } from '@akaoio/tui';
```

### 2. Tạo ứng dụng TUI đơn giản

```javascript
const { TUI, Input, Form } = require('@akaoio/tui');

async function createApp() {
  const tui = new TUI();
  
  // Tạo form
  const form = new Form();
  
  // Thêm input fields
  const nameInput = new Input({
    label: 'Name',
    placeholder: 'Enter your name'
  });
  
  const emailInput = new Input({
    label: 'Email',
    placeholder: 'email@example.com'
  });
  
  form.addComponent('name', nameInput);
  form.addComponent('email', emailInput);
  
  // Render và chờ submit
  tui.add(form);
  tui.render();
  
  const data = await form.waitForSubmit();
  console.log('Form data:', data);
}

createApp();
```

### 3. Schema-driven UI (Nâng cao)

```javascript
const { SchemaRenderer } = require('@akaoio/tui');

const schema = {
  type: 'form',
  props: {
    title: 'User Registration'
  },
  children: [
    {
      type: 'input',
      props: {
        label: 'Username',
        required: true
      }
    },
    {
      type: 'select',
      props: {
        label: 'Country',
        options: [
          { label: 'USA', value: 'us' },
          { label: 'UK', value: 'uk' },
          { label: 'Vietnam', value: 'vn' }
        ]
      }
    },
    {
      type: 'checkbox',
      props: {
        label: 'I agree to terms'
      }
    }
  ]
};

const renderer = new SchemaRenderer(schema);
renderer.render();
```

## Components có sẵn

### Input Components
- **Input** - Text input field
- **Select** - Dropdown selection
- **Checkbox** - Toggle checkbox
- **Radio** - Radio button group
- **JsonEditor** - JSON data editor

### Display Components
- **ProgressBar** - Progress indicator
- **Spinner** - Loading spinner
- **ResponsiveTabs** - Tab navigation

### Container Components
- **Form** - Form container với validation
- **App** - Main application container

### Core Services
- **Screen** - Terminal output management
- **Keyboard** - Keyboard input handling
- **ScreenManager** - Advanced screen control
- **StoreManager** - State management
- **EventBus** - Event system
- **ThemeManager** - Theming support

## Features

✅ **Zero Dependencies** - Pure Node.js/TypeScript
✅ **Type Safe** - Full TypeScript support
✅ **Component-based** - Reusable UI components  
✅ **Schema-driven** - Define UI with JSON
✅ **Keyboard Navigation** - Full keyboard support
✅ **State Management** - Built-in reactive store
✅ **Theme Support** - Customizable themes
✅ **Responsive** - Adapts to terminal size

## Ví dụ thực tế

### Progress Bar Animation
```javascript
const { ProgressBar } = require('@akaoio/tui');

const progress = new ProgressBar({
  label: 'Downloading',
  total: 100,
  width: 40
});

// Animate progress
async function download() {
  for(let i = 0; i <= 100; i++) {
    progress.setProgress(i);
    progress.render();
    await new Promise(r => setTimeout(r, 50));
  }
  console.log('Download complete!');
}
```

### Interactive Menu
```javascript
const { Select } = require('@akaoio/tui');

const menu = new Select({
  label: 'Main Menu',
  options: [
    { label: 'Start Game', value: 'start' },
    { label: 'Settings', value: 'settings' },
    { label: 'Exit', value: 'exit' }
  ]
});

menu.render();
const choice = await menu.waitForSubmit();

switch(choice) {
  case 'start':
    console.log('Starting game...');
    break;
  case 'exit':
    process.exit(0);
}
```

## Run Examples

```bash
# Todo app example
npm run example:todo

# Dashboard example  
npm run example:dashboard

# JSON editor example
npm run example:json-editor
```

## Architecture

Framework sử dụng pattern **"Class = Directory + Method-per-file"**:
- Mỗi class là một thư mục
- Mỗi method là một file riêng
- Class container chỉ import và delegate

Điều này giúp:
- Code organization rõ ràng
- Easy to maintain và scale
- Tránh file quá lớn
- Testing từng method độc lập

## Support

- GitHub: https://github.com/akaoio/tui
- NPM: https://www.npmjs.com/package/@akaoio/tui
- Version: 1.0.7

---

Made with ❤️ by AKAO.IO