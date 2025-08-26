# {{title}}

{{description}}

## Features

{{#each features}}
- {{this}}
{{/each}}

## Architecture

{{#if architecture}}
### Core Components
- **{{architecture.core}}**

### UI Components  
- **{{architecture.components}}**

### Utilities
- **{{architecture.utils}}**

### Examples
- **{{architecture.examples}}**
{{/if}}

## Installation

```bash
npm install {{name}}
```

## Usage

```typescript
{{usage}}
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

Current version: **{{version}}**

---

Generated with ❤️ by @akaoio/composer
