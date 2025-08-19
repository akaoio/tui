# Test Suite for @akaoio/tui

## Overview

This directory contains a comprehensive test suite for the @akaoio/tui library (formerly Charsm). The test suite covers all major features, edge cases, and error handling scenarios.

## Test Structure

```
tests/
├── README.md           # This file
├── setup.ts           # Global test setup (WASM initialization)
├── unit/              # Unit tests for individual components
│   ├── wasm-init.test.ts      # WASM initialization tests
│   ├── lipgloss-styles.test.ts # Style creation and application tests
│   ├── lipgloss-tables.test.ts # Table, list, and markdown rendering tests
│   ├── huh-forms.test.ts      # Form components tests (input, select, confirm, etc.)
│   └── edge-cases.test.ts     # Edge cases and error handling
├── integration/       # Integration tests
│   └── combined-features.test.ts # Complex scenarios combining multiple features
└── fixtures/          # Test fixtures (currently empty)
```

## Test Coverage

### Unit Tests

#### WASM Initialization (`wasm-init.test.ts`)
- ✅ Successful WASM initialization
- ✅ Global functions availability check
- ✅ Multiple initialization handling
- ✅ WASM file existence verification
- ✅ WASM file size validation

#### Lipgloss Styles (`lipgloss-styles.test.ts`)
- ✅ Basic style creation
- ✅ Color configurations (hex, adaptive, complete)
- ✅ Border types (rounded, block, thick, double)
- ✅ Padding and margin variations
- ✅ Alignment options (top, bottom, left, right, center)
- ✅ Size constraints (width, height, maxWidth, maxHeight)
- ✅ Text application with various content types
- ✅ Element joining (horizontal/vertical)

#### Tables and Lists (`lipgloss-tables.test.ts`)
- ✅ Table creation with various configurations
- ✅ Header and row styling
- ✅ Unicode and special character handling
- ✅ List creation with different styles (arabic, alphabet, asterisk, custom)
- ✅ Selected items highlighting
- ✅ Markdown rendering with different themes
- ✅ Complex markdown content (tables, code blocks, lists)

#### Huh Forms (`huh-forms.test.ts`)
- ✅ Input creation (single-line and multi-line)
- ✅ Validators (required, email, no_numbers, alpha_only, no_special_chars)
- ✅ Confirm dialogs
- ✅ Select components (single and multi-select)
- ✅ Note components
- ✅ Theme settings
- ✅ Form groups and value retrieval
- ✅ Spinner components

#### Edge Cases (`edge-cases.test.ts`)
- ✅ Boundary values (zero, negative, extremely large)
- ✅ Invalid input handling (null, undefined, wrong types)
- ✅ Special characters and encoding (RTL text, emoji, control characters)
- ✅ Memory management (many styles, deep nesting)
- ✅ Table edge cases (mismatched columns, empty data)
- ✅ List edge cases (duplicates, empty items)
- ✅ Markdown edge cases (malformed syntax, deep nesting)
- ✅ Concurrency scenarios

### Integration Tests (`combined-features.test.ts`)
- ✅ Complex dashboard layouts
- ✅ Nested layouts and grids
- ✅ Mixed content types (Unicode, ASCII, ANSI)
- ✅ Form workflows with styling
- ✅ Theme variations
- ✅ Performance tests (rapid operations, large datasets)

## Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output and debug logging
npm run test:verbose
```

## Configuration

### Jest Configuration (`jest.config.js`)
- Test environment: Node.js
- Test timeout: 30 seconds (for WASM operations)
- Coverage collection enabled
- TypeScript support via ts-jest

### Test Setup (`setup.ts`)
- Initializes WASM once for all tests
- Suppresses console output during tests (unless DEBUG=1)
- Configures global timeout

## Known Issues

1. **FFI Library Path**: The native binary loading (huh.dll/huh.so) may fail if paths are not correctly resolved. The library attempts to find binaries in multiple locations:
   - Current directory
   - dist/binary/
   - src/binary/

2. **Platform Support**: Huh forms tests only run on Windows and Linux (not macOS).

3. **WASM Performance**: Initial WASM loading can take several seconds, hence the extended timeout.

## Writing New Tests

When adding new tests:

1. Place unit tests in `tests/unit/`
2. Place integration tests in `tests/integration/`
3. Follow the existing naming convention: `feature-name.test.ts`
4. Use descriptive test names that explain what is being tested
5. Group related tests using `describe` blocks
6. Include edge cases and error scenarios
7. Add comments for complex test scenarios

## Test Data

The test suite uses various types of test data:
- ASCII text
- Unicode characters (Chinese, Japanese, Arabic, emoji)
- Special characters and control codes
- Large datasets (100-1000 items)
- Edge values (empty, null, undefined)

## Coverage Goals

The test suite aims for:
- ✅ 100% of public API methods
- ✅ All documented features
- ✅ Common error scenarios
- ✅ Edge cases and boundary conditions
- ✅ Performance under load

## Contributing

When contributing to the test suite:
1. Ensure all tests pass before submitting
2. Add tests for any new features
3. Update this README if test structure changes
4. Run coverage report to ensure no regression
5. Consider both positive and negative test cases