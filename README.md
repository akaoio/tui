# @akaoio/tui

Simple and practical Terminal UI framework for Node.js

## Features


- Form Components (Input, Checkbox, Radio, Select, ProgressBar, Spinner)

- Schema-driven UI Generation

- Keyboard Navigation and Event Handling

- Responsive Layout System

- State Management with Store

- Virtual Cursor Management

- Component Registry and Focus Management

- Theme System with Color Utilities

- JSON Editor Component

- Stream-based Components for Real-time Updates


## Architecture


### Core Components
- **Application, Component, Screen, Keyboard, Layout engines**

### UI Components  
- **Reusable UI components (Form, Input, Select, etc.)**

### Utilities
- **Color, styling, and platform utilities**

### Examples
- **Todo app, Dashboard, JSON Editor demonstrations**


## Installation

```bash
npm install @akaoio/tui
```

## Usage

```typescript
import { TUI, Form, Input, Checkbox } from '@akaoio/tui'

const app = new TUI()
const form = new Form()
form.addComponent(new Input({ label: 'Name', placeholder: 'Enter your name' }))
form.addComponent(new Checkbox({ label: 'Subscribe to newsletter' }))
app.setRootComponent(form)
app.start()

```

## Development

### Build
```bash
npm run build
```

### Test
```bash
npm test
```

### Documentation
```bash
npm run docs
```

## Version

Current version: **1.0.7**

---

Generated with ❤️ by @akaoio/composer
