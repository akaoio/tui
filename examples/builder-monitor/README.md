# Builder TUI Monitor

A comprehensive Terminal User Interface for monitoring @akaoio/builder build processes with real-time progress tracking, error analysis, and mobile-responsive design.

## Features

### 🏗️ Live Build Monitoring
- Real-time build progress tracking with visual indicators
- Multi-format build support (CommonJS, ESM, TypeScript declarations)
- Live compilation status for each build target
- Build timing and performance metrics

### 📊 Build Analytics Dashboard
- Six specialized views: Overview, Targets, Logs, Config, Files, Performance
- Build history tracking and comparison
- Bundle size analysis and trends
- Error frequency analysis and debugging

### ⚡ Performance Insights
- Build time statistics (average, min, max)
- Bundle size tracking over time
- Memory usage monitoring
- Build optimization suggestions

### 📱 Mobile-Responsive Interface
- Optimized for terminals as small as 40x15 characters
- Adaptive layouts for phone SSH clients
- Essential information priority on small screens
- Touch-friendly navigation patterns

### 🔍 Advanced Build Management
- Watch mode with file change detection
- Selective target building
- Build error navigation and analysis
- Output file browser and inspector

## Quick Start

```bash
# Run in current directory
npm run example:builder

# Run in specific project directory
npm run example:builder /path/to/project

# Or directly with tsx
tsx examples/builder-monitor/index.ts
```

## Views & Navigation

### 1. Overview [1]
**Purpose**: High-level build status and project health

**Desktop Features**:
- Current build session status with detailed metrics
- Build target progress with success/error indicators
- Quick action shortcuts for common build operations
- Recent build history with performance trends

**Mobile Adaptations**:
- Compact build statistics
- Essential status indicators only
- Stacked action buttons
- Truncated build target names

### 2. Build Targets [2]
**Purpose**: Individual build target monitoring and management

**Desktop Features**:
- Complete list of build targets (CJS, ESM, DTS)
- Real-time status tracking with progress indicators
- File size information and build timing
- Warning and error count for each target

**Mobile Adaptations**:
- Format abbreviations (CJS, ESM, DTS)
- Essential size/timing info on selection
- Error preview for failed targets
- Compact target list with smart truncation

### 3. Build Logs [3]
**Purpose**: Real-time build output and debugging

**Features**:
- Live build output streaming with color coding
- Auto-scroll with manual navigation override
- Error/warning highlighting (red/yellow/green)
- Build command output parsing and enhancement
- Log filtering and search capabilities

### 4. Configuration [4]
**Purpose**: Build settings and project configuration

**Features**:
- Entry point management and validation
- Output format selection (CJS, ESM, DTS)
- Build option toggles (minification, source maps, clean)
- External dependency configuration
- Platform targeting (Node.js, browser, neutral)

### 5. Files [5]
**Purpose**: Project structure and output inspection

**Features**:
- Source file browser with recursive directory listing
- Output file size tracking and comparison
- File modification time monitoring
- Build artifact organization

### 6. Performance [6]
**Purpose**: Build performance analysis and optimization

**Features**:
- Build time trend analysis
- Bundle size history and optimization opportunities
- Recent error pattern analysis
- Watch mode file change event tracking

## Keyboard Shortcuts

### Global Navigation
- `1-6` - Switch between views
- `h` - Show comprehensive help
- `q` or `Ctrl+C` - Quit application

### Build Control
- `b` - Start build process
- `w` - Toggle watch mode for continuous building
- `s` - Stop current build or watch process
- `r` - Rebuild (stop current and start new build)
- `c` - Clear build logs and output

### Navigation & Selection
- `↑↓` - Navigate through targets/logs/items
- `←→` - Navigate between related items
- `Enter` - Select item or execute context action

### View-Specific Actions
- `d` - Show detailed information for selected item
- `e` - Jump to error log view with recent errors
- `o` - Open output directory or show file paths

## Mobile Optimizations

### Screen Size Detection
```typescript
private getScreenDimensions(): { width: number; height: number; isMobile: boolean } {
  const { columns, rows } = process.stdout;
  const isMobile = columns < 60 || rows < 20;
  return { width: columns || 80, height: rows || 24, isMobile };
}
```

### Responsive Patterns

**Information Hierarchy**: Essential build information takes priority
```typescript
// Desktop: Full target details with paths and timing
`✓ esm: index.mjs (45.2KB) - 234ms - 2 warnings`

// Mobile: Essential status only  
`✓ ESM`
`  45KB` (on selection)
```

**Adaptive Navigation**: Two-row navigation for mobile
```typescript
if (isMobile) {
  this.renderMobileNavigation(width); // [1]Over [2]Tgts [3]Logs
} else {
  this.renderDesktopNavigation(width); // [1] Overview [2] Build Targets [3] Build Logs
}
```

**Smart Truncation**: Context-aware text shortening
```typescript
if (isMobile && fileName.length > width - 15) {
  fileName = fileName.substring(0, width - 18) + '...';
}
```

## Integration with @akaoio/builder

### Build Process Integration
```bash
akao-build                    # Standard build
akao-build --watch           # Watch mode
akao-build --clean           # Clean build
akao-build --preset prod     # Production build
```

### Configuration Detection
Automatically loads configuration from:
- `builder.config.js` - Builder-specific configuration
- `tsup.config.js/ts` - tsup configuration files
- `package.json` - Builder config in package.json

### Real-Time Output Parsing
```typescript
private parseBuildProgress(line: string, isError: boolean): void {
  // Parse builder output for:
  // - Build target start/completion
  // - File size information
  // - Warning and error extraction
  // - Performance timing data
}
```

### Build Target Management
```typescript
interface BuildTarget {
  format: 'cjs' | 'esm' | 'dts';
  input: string;
  output: string;
  status: 'pending' | 'building' | 'success' | 'error' | 'skipped';
  size?: number;
  duration?: number;
  warnings: string[];
}
```

## Advanced Features

### Watch Mode Integration
- Real-time file change detection
- Incremental build triggering
- Change event visualization
- Build performance impact analysis

### Build Session Management
```typescript
interface BuildSession {
  id: string;
  startTime: number;
  targets: BuildTarget[];
  status: 'running' | 'completed' | 'failed';
  mode: 'build' | 'watch' | 'dev';
  totalSize: number;
  totalErrors: number;
}
```

### Performance Metrics
```typescript
// Build time tracking
this.buildTimes.push(buildDuration);

// Bundle size trends
this.bundleSizes.set(format, [...sizes, newSize]);

// Error pattern analysis
this.errorHistory.push(errorMessage);
```

### Error Analysis Engine
- Error message parsing and categorization
- Build failure pattern detection
- Suggestion system for common issues
- Stack trace navigation assistance

## Development Patterns

The Builder Monitor demonstrates several production-ready patterns:

### Process Management
```typescript
this.buildProcess = spawn('akao-build', [], {
  cwd: this.projectPath,
  stdio: 'pipe',
  shell: true
});
```

### Real-Time Data Processing
```typescript
this.buildProcess.stdout?.on('data', (data) => {
  this.handleBuildOutput(data.toString());
});
```

### State Management
```typescript
// Comprehensive build state tracking
private currentSession: BuildSession | null = null;
private buildHistory: BuildSession[] = [];
private buildTimes: number[] = [];
private bundleSizes: Map<string, number[]> = new Map();
```

### Responsive UI Architecture
```typescript
// Adaptive rendering based on terminal size
switch (this.currentView) {
  case 'overview':
    this.renderOverview(width, height - contentStartY, isMobile);
    break;
  // ...
}
```

This example serves as a comprehensive demonstration of building sophisticated development tools with TUI, showcasing real-time process monitoring, responsive design, and practical build system integration.