# TUI Positioning Analysis

## Current Issues

### Mixed Paradigms
1. **Absolute Positioning**: Components use `screen.writeAt(x, y)` with ANSI escape sequences `\x1b[y;xH`
2. **Stream Output**: Methods like `createHeader()` return strings for `console.log()`

### Components Affected

| Component | Current Behavior | Issue |
|-----------|-----------------|-------|
| Input | Renders at (x,y) default (0,0) | Overlaps with previous content |
| Select | Renders at (x,y) default (0,0) | Overlaps with previous content |
| Checkbox | Renders at (x,y) default (0,0) | Overlaps with previous content |
| Radio | Renders at (x,y) default (0,0) | Overlaps with previous content |
| ProgressBar | Renders at (x,y) default (0,0) | Overlaps with previous content |
| Spinner | Renders at (x,y) default (0,0) | Overlaps with previous content |
| Form | Manages child positions | May conflict with content |

## Solution Approaches

### Option 1: Full Stream Mode (Recommended)
- All components work with readline/stream
- No absolute positioning
- Components render inline at current cursor
- Pros: Works with console.log, no overlaps
- Cons: Less control over layout

### Option 2: Full Screen Mode
- Take over entire terminal
- All content uses absolute positioning
- No mixing with console.log
- Pros: Full control
- Cons: Can't mix with regular output

### Option 3: Smart Positioning
- Track current cursor position
- Components render relative to cursor
- Auto-detect available space
- Pros: Flexible
- Cons: Complex to implement

## Decision: Smart Stream Mode

We'll implement a hybrid approach:
1. Components default to stream mode (render at current position)
2. Optional absolute mode for full-screen apps
3. Clear separation between modes