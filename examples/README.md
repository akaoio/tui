# TUI Examples

This directory contains example applications demonstrating the capabilities of the @akaoio/tui library.

## Available Examples

### 1. Todo Application (Schema-based)
**Location:** `todos/`
- `TodoFromSchema.ts` - Todo app generated from JSON schema
- `todo-schema.json` - Schema definition for the todo app
- `todos.json` - Data storage file

**Run:** `npm run example:todos`

Demonstrates:
- Schema-driven UI generation
- Dynamic component creation
- State management
- CRUD operations

### 2. Dashboard Application
**Location:** `dashboard/`
- `DashboardFromSchema.ts` - Dashboard generated from JSON schema
- `dashboard-schema.json` - Schema definition for the dashboard

**Run:** `npm run example:dashboard`

Demonstrates:
- Complex layout from schema
- Multiple component types
- Real-time data visualization
- System monitoring UI

### 3. JSON Configuration Editor
**Location:** `json-editor/`
- `config-editor.ts` - Interactive JSON configuration editor
- `sample-config.json` - Sample configuration file

**Run:** `npm run example:json-editor`

Demonstrates:
- JSON file editing
- Nested object navigation
- Type-safe value editing
- File persistence

## Running Examples

To run any example, use the following command from the project root:

```bash
npm run example:<name>
```

For example:
```bash
npm run example:todos       # Run todo application
npm run example:dashboard   # Run dashboard
npm run example:json-editor  # Run JSON editor
```

## Schema-Driven Development

The schema-based examples use JSON schemas to define UI structure. This approach offers:
- Declarative UI definition
- Easy customization without code changes
- Consistent component configuration
- Reusable UI patterns

Example schema structure:
```json
{
  "title": "Application Title",
  "components": [
    {
      "type": "input",
      "id": "name",
      "label": "Name",
      "validation": {
        "required": true
      }
    }
  ]
}
```

## Creating Your Own Examples

To create a new example:

1. Create a new directory or file in `examples/`
2. Import components from '../src'
3. Add a script in package.json:
   ```json
   "example:myexample": "tsx examples/myexample.ts"
   ```

## Common Patterns

All examples follow similar initialization patterns:

```typescript
import { Screen, Keyboard, SchemaRenderer } from '../src';

// Initialize core systems
const screen = new Screen();
const keyboard = new Keyboard();

// For schema-based apps
const renderer = new SchemaRenderer(schema, screen, keyboard);
renderer.render();

// Handle cleanup
process.on('exit', () => {
  keyboard.stop();
  screen.cleanup();
});
```