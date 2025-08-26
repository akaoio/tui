# Battle TUI Dashboard

A comprehensive Terminal User Interface for monitoring @akaoio/battle test execution with full mobile terminal support and real-time test analytics.

## Features

### ⚡ Real-Time Test Monitoring
- Live test execution tracking with progress indicators
- Real-time status updates for test suites and individual tests
- Dynamic statistics and pass/fail rates
- Visual progress bars and spinners

### 📊 Test Analytics Dashboard
- Six specialized views: Overview, Suites, Tests, Results, Config, Logs
- Interactive test suite and test case navigation
- Failed test analysis with error details
- Performance metrics and execution timing

### 🎬 Test Replay & Screenshots
- Access to battle test replays for failed tests
- Screenshot viewing for visual test verification
- Integration with battle's PTY recording system
- Interactive replay controls

### 📱 Mobile-Responsive Interface
- Optimized for terminals as small as 40x15 characters
- Adaptive layouts that work on phone SSH clients
- Compact information display with essential data priority
- Touch-friendly navigation patterns

### 🔍 Advanced Test Management
- Auto-discovery of test files (*.test.ts, *.battle.test.ts)
- Test suite selection and filtering
- Watch mode for continuous testing
- Verbose output control

## Quick Start

```bash
# Run in current directory
npm run example:battle

# Run in specific project directory
npm run example:battle /path/to/project

# Or directly with tsx  
tsx examples/battle-dashboard/index.ts
```

## Views & Navigation

### 1. Overview [1]
**Purpose**: High-level project test status and quick actions

**Desktop Features**:
- Complete test statistics with suite breakdown
- Quick action shortcuts for common tasks
- Recent test suite status with detailed results
- Project health at-a-glance

**Mobile Adaptations**:
- Compact stats display with essential numbers only
- Abbreviated suite names with truncation
- Stacked action buttons for easy selection

### 2. Test Suites [2]  
**Purpose**: Navigate and manage test suite execution

**Desktop Features**:
- Full list of discovered test suites with file paths
- Real-time status indicators (pending ○, running ●, passed ✓, failed ✗)
- Test counts, pass/fail statistics, and execution timing
- Selected suite detailed information panel

**Mobile Adaptations**:
- Truncated suite names to fit small screens
- Compact test summary (e.g., "5t, 3p, 1f" = 5 tests, 3 passed, 1 failed)
- Essential status information only

### 3. Test Cases [3]
**Purpose**: Individual test management and detailed inspection

**Desktop Features**:
- Complete test list for selected suite
- Individual test status tracking
- Error messages and execution timing
- Screenshot and replay availability indicators

**Mobile Adaptations**:
- Truncated test names with smart ellipsis
- Error preview for selected/failed tests
- Quick access to replay/screenshot actions

### 4. Results [4]
**Purpose**: Test execution summary and failure analysis

**Desktop Features**:
- Comprehensive pass/fail statistics
- Detailed failed test listing with error messages
- Suite-level breakdown of results
- Performance timing analysis

**Mobile Adaptations**:
- Essential statistics only
- Truncated error messages with expansion
- Focus on failed tests for debugging

### 5. Configuration [5]
**Purpose**: Test execution settings and project information

**Features**:
- Test pattern selection (*.test.ts, *.battle.test.ts)
- Watch mode, verbose output, and coverage toggles
- Project path and file discovery information
- Runtime configuration management

### 6. Logs [6]
**Purpose**: Raw test execution output and debugging

**Features**:
- Real-time test execution log streaming
- Color-coded output (errors in red, success in green)
- Auto-scroll with manual scroll override
- Log filtering and search capabilities

## Keyboard Shortcuts

### Global Navigation
- `1-6` - Switch between views (Overview, Suites, Tests, Results, Config, Logs)
- `h` - Show help information
- `q` or `Ctrl+C` - Quit application

### Test Execution
- `r` - Run all tests
- `s` - Stop current test execution
- `w` - Toggle watch mode for continuous testing
- `c` - Clear all test results and logs
- `t` - Toggle verbose output mode

### Navigation & Selection
- `↑↓` - Navigate through suites/tests
- `←→` - Navigate between related items
- `Enter` - Select item or execute context action
- `Space` - Toggle selection (where applicable)

### Test-Specific Actions
- `p` - Play replay for selected test (when available)
- `v` - View screenshot for selected test (when available)

## Mobile Optimizations

### Screen Size Adaptations

**Mobile Detection**: Automatically detects terminals < 60 columns or < 20 rows

**Adaptive Features**:
- **Navigation**: Two-row navigation with abbreviated labels
- **Text Truncation**: Smart truncation with ellipsis (e.g., "VeryLongTestName..." → "VeryLongTes...")
- **Information Density**: Focus on essential data, hide secondary information
- **Vertical Layout**: Stack information vertically instead of horizontally

### Mobile-Specific UI Patterns

```typescript
// Example: Responsive test name display
if (isMobile && testName.length > width - 8) {
  testName = testName.substring(0, width - 11) + '...';
}
```

```typescript
// Example: Adaptive statistics display
const stats = isMobile ? 
  `${passed}/${total} (${passRate}%)` :
  `Tests: ${passed}/${total} passed (${passRate}%) | Suites: ${completedSuites}/${totalSuites}`;
```

## Integration with @akaoio/battle

### Test Discovery
Automatically finds battle test files using these patterns:
- `**/*.test.ts` - Standard TypeScript test files
- `**/*.battle.test.ts` - Battle-specific test files

### Test Execution
```bash
npm run test              # Run all tests
npm run test:battle       # Run battle-specific tests  
npm run test:integration  # Run integration tests
```

### Replay & Screenshot Support
- Accesses battle's PTY recording system
- Displays screenshots from battle test failures
- Integrates with battle's replay functionality

### Real-Time Output Parsing
Parses battle test output for:
- Test start/completion events
- Pass/fail status changes
- Error message extraction
- Performance timing data

## Advanced Features

### Watch Mode
Continuously monitors file changes and re-runs affected tests:
```typescript
private toggleWatch(): void {
  this.watchMode = !this.watchMode;
  // File watcher implementation for continuous testing
}
```

### Progress Tracking
Real-time progress visualization:
```typescript
this.progressBar = new ProgressBar(0, this.statistics.totalTests);
// Updates as tests complete
```

### Statistics Engine
Live calculation of test metrics:
```typescript
private updateStatistics(): void {
  this.statistics.passedTests = this.suites.reduce((sum, suite) => sum + suite.passed, 0);
  this.statistics.failedTests = this.suites.reduce((sum, suite) => sum + suite.failed, 0);
  // Real-time updates during test execution
}
```

### Error Analysis
Intelligent error parsing and display:
```typescript
private handleTestOutput(output: string): void {
  // Parse battle output for test results
  // Extract error messages and stack traces
  // Update UI with real-time status
}
```

## Development Patterns

The Battle Dashboard demonstrates several advanced TUI patterns:

### Responsive Design System
```typescript
private getScreenDimensions(): { width: number; height: number; isMobile: boolean } {
  const { columns, rows } = process.stdout;
  const isMobile = columns < 60 || rows < 20;
  return { width: columns || 80, height: rows || 24, isMobile };
}
```

### State Management
```typescript
interface TestRunStatistics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  // ... comprehensive test state tracking
}
```

### Process Integration
```typescript
this.testProcess = spawn('npm', ['run', 'test'], {
  cwd: this.projectPath,
  stdio: 'pipe'
});
// Real-time process output handling
```

This serves as a comprehensive example of building production-ready TUI applications with complex state management, real-time updates, and responsive design patterns.