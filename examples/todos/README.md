# Todo App Examples

Two versions of the Todo app are available:

## 1. TodoApp.ts - Full Featured Version
- Rich UI with modals and borders
- Multiple components (TodoList, FilterBar, StatusBar, Modal)
- Unicode box drawing characters
- Complex ANSI color schemes
- Best for desktop terminals

Run with:
```bash
npx tsx TodoApp.ts
```

## 2. TodoAppSimple.ts - Termux/Mobile Optimized
- Simplified rendering for small screens
- Basic ASCII characters instead of Unicode
- Minimal ANSI codes for better compatibility
- Inline editing instead of modals
- Responsive layout that adapts to screen size

Run with:
```bash
npx tsx TodoAppSimple.ts
```

## Auto-Detection Launcher
Use the launcher script to automatically select the best version:
```bash
./todo.sh
```

## Controls
- **a** - Add new todo
- **e** - Edit selected todo
- **d** - Delete selected todo
- **Space** - Toggle completed status
- **↑/↓** or **j/k** - Navigate list
- **1/2/3** - Filter (All/Active/Completed)
- **q** or **Esc** - Quit

## Data Storage
Both versions share the same `todos.json` file for data persistence.

## Testing on Termux
1. Install Termux from F-Droid or Google Play
2. Install Node.js: `pkg install nodejs`
3. Clone the repository
4. Run: `npx tsx TodoAppSimple.ts`

The simplified version should work perfectly on Termux with:
- No broken borders
- Clean text rendering
- Proper input handling
- Responsive to small screen sizes