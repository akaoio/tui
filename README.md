# @akaoio/tui

Modern zero-dependency Terminal UI framework for Node.js with TypeScript

## Features


- Zero Dependencies - Pure Node.js/TypeScript implementation

- Component-Based - Modular architecture with reusable components

- Type Safety - Full TypeScript support with strict typing

- Event-Driven - Uses Node.js EventEmitter for reactive updates

- Schema-Driven - Create UIs from JSON schemas

- Keyboard Navigation - Full keyboard navigation support


## Installation

```bash
npm install @akaoio/tui
```

## Usage

import { TUI, Input, Button } from '@akaoio/tui'

const app = new TUI()

const input = new Input({ placeholder: 'Enter your name' })
const button = new Button({ text: 'Submit' })

app.add(input)
app.add(button)
app.start()


Generated with ❤️ by @akaoio/composer
