# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

@akaoio/tui is a TypeScript library forked from Charsm (by Sifundo Mhlungu), which ports the Lipgloss TUI styling library from Go to JavaScript/TypeScript using WebAssembly. It provides terminal UI components and styling for CLI applications.

This is a fork of the original [Charsm](https://github.com/SfundoMhlungu/charsm) project. All credit for the initial WebAssembly port goes to the original author.

## Key Commands

### Development
- **Build**: `pnpm build` - Compiles TypeScript to JavaScript (CJS/ESM), generates type definitions, and copies WASM/binary files to dist
- **Type Check**: `pnpm lint` (runs `tsc`) - Validates TypeScript types without emitting files

### Installation
- Uses pnpm as the package manager
- Install dependencies: `pnpm install`

## Architecture Overview

### Core Components

1. **WASM Integration** (`src/lipgloss.ts`, `src/wasm_exec.js`)
   - Loads `lip.wasm` containing the ported Go Lipgloss functionality
   - `initLip()` must be called before using any Lipgloss features
   - Uses Go's WebAssembly bridge to expose functions to JavaScript

2. **Native Bindings** (`src/linker.ts`, `src/binary/`)
   - Uses FFI (Foreign Function Interface) to call native C/C++ functions from huh forms library
   - Platform-specific: `huh.dll` (Windows) and `huh.so` (Linux)
   - Provides form components like Input, Select, Confirm, etc.

3. **Main API** (`src/index.ts`)
   - Exports Lipgloss class and huh forms
   - Entry point for the library

### Key Patterns

- **WASM Initialization**: Always check `initLip()` returns true before using Lipgloss features
- **Platform Detection**: Dynamic library loading based on OS (Windows vs Linux)
- **FFI Type Mapping**: Uses @makeomatic/ffi-napi and ref-napi for C interop
- **Style System**: CSS-like styling with borders, padding, margins, colors
- **Adaptive Colors**: Support for light/dark themes with ANSI color fallbacks

### Build Output

The build process:
1. Compiles TypeScript to both CommonJS and ESM formats
2. Generates TypeScript declarations
3. Copies WASM file and binary directory to dist/
4. All artifacts go to dist/ directory for npm publishing

## Important Notes

- Node.js v18.20.4+ or v20.15.0+ required (tested versions)
- Only Windows and Linux platforms are currently supported
- WASM file must be accessible at runtime (handled by build script)
- When bundling for executables, ensure lip.wasm and binary files are included as assets