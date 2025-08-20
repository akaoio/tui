# CLAUDE.md

This file provides guidance to Claude (claude.ai) and other AI assistants when working with the @akaoio/tui codebase.

## Project Overview

**@akaoio/tui** is a modern Terminal UI framework for Node.js, built with TypeScript. It provides a simple and practical API for creating interactive command-line interfaces with keyboard navigation, forms, and various UI components.

### Key Design Principles
1. **Simplicity First** - Clean, intuitive API that's easy to understand
2. **Zero Dependencies** - Pure Node.js/TypeScript implementation
3. **Type Safety** - Full TypeScript support with strict typing
4. **Component-Based** - Modular architecture with reusable components
5. **Event-Driven** - Uses Node.js EventEmitter for reactive updates

## Architecture

### Directory Structure
```
src/
├── core/           # Core functionality
│   ├── keyboard.ts # Keyboard input handling
│   └── screen.ts   # Terminal output management
├── components/     # UI components
│   ├── Component.ts    # Base component class
│   ├── Input.ts        # Text input field
│   ├── Select.ts       # Dropdown selection
│   ├── Checkbox.ts     # Toggle checkbox
│   ├── Radio.ts        # Radio button group
│   ├── Spinner.ts      # Loading indicator
│   ├── ProgressBar.ts  # Progress visualization
│   └── Form.ts         # Form container
├── utils/          # Utility functions
│   ├── colors.ts   # ANSI color helpers
│   └── styles.ts   # Text styling and box drawing
└── index.ts        # Main exports
```

### Core Modules

#### Screen (`core/screen.ts`)
- Manages terminal output using Node.js WriteStream
- Handles cursor positioning, clearing, and buffer management
- Provides alternate screen mode for full-screen apps
- Auto-detects terminal dimensions and handles resize events

#### Keyboard (`core/keyboard.ts`)
- Handles keyboard input using Node.js readline
- Emits typed events for different key combinations
- Supports raw mode for immediate key capture
- Maps special keys (arrows, function keys, etc.)

### Component System

All components extend the base `Component` class which provides:
- Position and size management
- Focus/blur states
- Show/hide visibility
- Event emission (change, focus, blur)
- Abstract methods: `render()` and `handleKey()`

### Key Patterns

1. **Event-Driven Updates**
   ```typescript
   component.on('change', (value) => {
     // React to changes
   });
   ```

2. **Render on State Change**
   - Components re-render when their state changes
   - Use buffering for smooth updates

3. **Keyboard Event Delegation**
   - Parent components can delegate key events to children
   - Forms manage focus between child components

4. **ANSI Escape Sequences**
   - Used for colors, cursor movement, and styling
   - Wrapped in utility functions for ease of use

## Development Guidelines

### Adding New Components

1. **Extend Component Base Class**
   ```typescript
   export class NewComponent extends Component {
     render(): void {
       // Implement rendering logic
     }
     
     handleKey(key: Key, event: KeyEvent): void {
       // Handle keyboard input
     }
   }
   ```

2. **Follow Naming Conventions**
   - Components: PascalCase (e.g., `RadioGroup`)
   - Methods: camelCase (e.g., `getValue`)
   - Events: lowercase (e.g., `'change'`, `'submit'`)
   - Constants: UPPER_SNAKE_CASE

3. **Implement Required Methods**
   - `render()`: Draw the component to screen
   - `handleKey()`: Process keyboard input
   - `clear()`: Clean up rendered output (if override needed)

4. **Emit Appropriate Events**
   - `change`: When value changes
   - `submit`: When Enter is pressed (if applicable)
   - `focus`/`blur`: When focus changes

### Code Style

1. **TypeScript Strict Mode**
   - All code must pass strict TypeScript checks
   - Avoid `any` types, use proper typing
   - Handle null/undefined cases explicitly

2. **Error Handling**
   - Validate inputs in constructors
   - Provide meaningful error messages
   - Handle edge cases gracefully

3. **Documentation**
   - Add JSDoc comments for public methods
   - Include usage examples in comments
   - Document event emissions

### Testing Approach

1. **Unit Tests**
   - Test each component in isolation
   - Mock Screen and Keyboard dependencies
   - Verify event emissions

2. **Integration Tests**
   - Test component interactions
   - Verify keyboard navigation
   - Test form submissions

3. **Manual Testing**
   - Run examples to verify visual output
   - Test on different terminal emulators
   - Verify cross-platform compatibility

## Common Tasks

### Building the Project
```bash
npm run build
```
- Uses tsup to bundle TypeScript
- Outputs CJS, ESM, and type definitions
- Cleans dist folder before building

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Running Examples
```bash
npm run example:simple      # Basic input demo
npm run example:form        # Form with validation
npm run example:components  # All components showcase
```

## Performance Considerations

1. **Minimize Redraws**
   - Only render changed portions
   - Use buffering for batch updates
   - Clear only what's necessary

2. **Event Handling**
   - Remove listeners when components are destroyed
   - Avoid memory leaks with proper cleanup
   - Use event delegation where possible

3. **Terminal Compatibility**
   - Test on various terminals (Windows Terminal, iTerm2, etc.)
   - Fallback for limited color support
   - Handle missing Unicode characters

## Troubleshooting

### Common Issues

1. **Characters not displaying correctly**
   - Check terminal Unicode support
   - Provide ASCII fallbacks for box drawing

2. **Colors not working**
   - Verify terminal supports ANSI colors
   - Check TERM environment variable
   - Test with different color modes (16, 256, RGB)

3. **Keyboard input issues**
   - Ensure raw mode is properly set
   - Check for conflicting key bindings
   - Verify stdin is TTY

### Debug Mode
Set environment variable for verbose logging:
```bash
DEBUG=tui:* npm run example:simple
```

## Future Enhancements

Potential areas for expansion:
1. Mouse support for clickable components
2. Layout managers (flexbox-like, grid)
3. Theming system with predefined themes
4. Animation support with requestAnimationFrame-like API
5. Virtual scrolling for large lists
6. Accessibility features (screen reader support)
7. Plugin system for custom components
8. State management integration

## Contributing

When contributing:
1. Follow existing code patterns
2. Add tests for new features
3. Update examples if adding components
4. Ensure backward compatibility
5. Update this file if architecture changes

## Resources

- [ANSI Escape Codes](https://en.wikipedia.org/wiki/ANSI_escape_code)
- [Node.js readline](https://nodejs.org/api/readline.html)
- [Node.js TTY](https://nodejs.org/api/tty.html)
- [Terminal Colors](https://misc.flogisoft.com/bash/tip_colors_and_formatting)
- [Box Drawing Characters](https://en.wikipedia.org/wiki/Box-drawing_character)

---

This document should be updated as the architecture evolves to help AI assistants understand and work with the codebase effectively.