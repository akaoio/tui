# Unified @akaoio Dashboard

The ultimate Terminal User Interface for managing the entire @akaoio ecosystem in one comprehensive dashboard. This unified interface demonstrates how all @akaoio core technologies can be seamlessly integrated into a single, mobile-responsive development environment.

## Features

### 🎯 Complete Ecosystem Integration
- **@akaoio/composer**: Documentation generation and template management
- **@akaoio/battle**: Test execution, monitoring, and reporting
- **@akaoio/builder**: Build process control and performance tracking
- **@akaoio/air**: P2P database network management and data browsing

### 📊 Unified System Monitoring
- Real-time service health monitoring across all tools
- Centralized system metrics and performance tracking
- Cross-service dependency visualization
- Automated health checks and status reporting

### ⚡ Quick Action System
- One-key shortcuts for common development tasks
- Context-aware action suggestions
- Cross-tool workflow automation
- Background process management

### 📱 Enterprise-Grade Mobile Support
- Professional interface optimized for mobile SSH clients
- Essential information prioritization on small screens
- Touch-friendly navigation for tablet terminals
- Progressive enhancement from 40×15 to 120×40+ terminals

## Quick Start

```bash
# Launch the unified dashboard
npm run example:unified

# Or directly with tsx
tsx examples/unified-dashboard/index.ts

# Run in specific project directory
tsx examples/unified-dashboard/index.ts /path/to/project
```

## Dashboard Views

### 1. Overview [1]
**Purpose**: System-wide status and quick access to all tools

**Key Features**:
- **Service Grid**: Real-time status of all @akaoio services
- **System Health**: Overall ecosystem health indicators
- **Quick Actions**: One-click access to common operations
- **Recent Activity**: Cross-service activity log preview

**Mobile Layout**:
```
📝 ✓ Composer
  1h 2m • 145 req

⚔️ ✓ Battle  
  30m • 89 req

[d] Build Docs  [t] Run Tests
[b] Clean Build [n] Start Network
```

**Desktop Layout**:
```
📝 ✓ Composer | Uptime: 1h 2m | Requests: 145 | Errors: 0
⚔️ ✓ Battle   | Uptime: 30m   | Requests: 89  | Errors: 2  
🔧 ⚠ Builder  | Uptime: 15m   | Requests: 23  | Errors: 1
💫 ○ Air      | Uptime: N/A   | Requests: 0   | Errors: 0

[d] Build Documentation  [w] Watch Mode     [t] Run All Tests    [b] Clean Build
[n] Start Network        [r] Refresh All    [s] Service Toggle   [a] Auto-refresh
```

### 2. Composer [2]
**Purpose**: Documentation engine management

**Features**:
- Live documentation build status
- Template management interface
- Atomic source file monitoring
- Real-time preview capabilities

**Metrics Displayed**:
- Generated documentation files count
- Active templates and atomic sources
- Build performance and timing
- Watch mode status and file changes

### 3. Battle [3]
**Purpose**: Testing framework control center

**Features**:
- Test execution monitoring and control
- Real-time test result streaming
- Coverage reporting and analysis
- Performance benchmarking results

**Metrics Displayed**:
- Total test count and pass/fail rates
- Test execution timing and performance
- Coverage percentages by module
- Visual and integration test status

### 4. Builder [4]
**Purpose**: Build system monitoring and control

**Features**:
- Multi-format build monitoring (CJS, ESM, DTS)
- Build performance tracking and optimization
- Bundle size analysis and trending
- Error reporting and resolution guidance

**Metrics Displayed**:
- Active build processes and queues
- Bundle sizes and optimization metrics
- Build timing and performance trends
- Error rates and success percentages

### 5. Air [5]
**Purpose**: P2P database network management

**Features**:
- Network topology visualization
- Node health monitoring and management
- Data synchronization status tracking
- Distributed query performance metrics

**Metrics Displayed**:
- Connected node count and health status
- Data synchronization progress
- Network latency and throughput
- Distributed record counts and versions

### 6. Quick Actions [6]
**Purpose**: Centralized operation control

**Organized by Category**:
```
Composer:
  [d] Build Documentation    - Generate all docs from atomic sources
      Watch Mode            - Live documentation updates
      Create Template       - Generate new doc template

Battle:
  [t] Run All Tests         - Execute complete test suite
      Visual Tests          - Run visual regression tests  
      Performance Tests     - Execute benchmarking suite

Builder:
  [b] Clean Build          - Clean and rebuild all packages
      Dev Build            - Development build with watch
      Production Build     - Optimized production build

Air:
  [n] Start Network        - Initialize P2P database network
      Sync Data            - Force network synchronization
      Network Status       - Check connectivity and health
```

### 7. System Logs [7]
**Purpose**: Unified logging and activity monitoring

**Features**:
- Real-time log aggregation across all services
- Color-coded log levels and categories  
- Service-specific log filtering
- Search and export capabilities

**Log Categories**:
- **Service Events**: Start, stop, health changes
- **Build Activity**: Compilation progress, errors
- **Test Execution**: Results, failures, performance
- **Network Activity**: P2P connections, sync status

## Keyboard Shortcuts

### Global Navigation
- `1-7` - Switch between dashboard views
- `h` - Show comprehensive help system
- `q` or `Ctrl+C` - Quit dashboard

### Quick Actions (Global)
- `d` - Build Documentation (Composer)
- `w` - Watch Mode (Composer)
- `t` - Run All Tests (Battle)
- `b` - Clean Build (Builder)
- `n` - Start Network (Air)

### System Control
- `r` - Refresh all services and metrics
- `s` - Toggle selected service on/off
- `a` - Toggle auto-refresh mode
- `c` - Clear system logs

### Navigation & Selection
- `↑↓` - Navigate through services/actions/logs
- `←→` - Navigate between related items
- `Enter` - Execute selected action
- `Space` - Toggle selected item/service

## Mobile Optimizations

### Screen Size Adaptations

**Mobile Phone (40×15)**:
```
@akaoio Dashboard
✓ System healthy
4/4 services

[1]Over [2]Comp [3]Test [4]Build
[5]P2P [6]Acts [7]Logs

📝 ✓ Composer
⚔️ ✓ Battle
🔧 ⚠ Builder  
💫 ○ Air

[d] Docs [t] Test [b] Build
```

**Desktop (100×30+)**:
```
@akaoio Unified Development Dashboard                    Project: my-project
✓ System healthy                                        4/4 services
◉ Auto-refresh (3s)
Projects: 4 | Tests: 156 | Builds: 23 | Nodes: 3

[1] Overview  [2] Composer  [3] Battle  [4] Builder  [5] Air  [6] Quick Actions  [7] System Logs

📝 ✓ Composer | Uptime: 1h 2m | Requests: 145 | Errors: 0
⚔️ ✓ Battle   | Uptime: 30m   | Requests: 89  | Errors: 2
🔧 ⚠ Builder  | Uptime: 15m   | Requests: 23  | Errors: 1  
💫 ○ Air      | Uptime: N/A   | Requests: 0   | Errors: 0

Quick Actions:
[d] Build Documentation  [w] Watch Mode     [t] Run All Tests    [b] Clean Build
[n] Start Network        [r] Refresh All    [s] Service Toggle   [a] Auto-refresh

Recent Activity:
✓ Documentation build completed successfully (2m ago)
⚔ Test suite executed: 145 passed, 2 failed (3m ago)
🔧 Builder warning: Bundle size increased 15% (5m ago)
```

### Responsive Design Patterns

```typescript
// Service status adaptation
if (isMobile) {
  display = `${service.icon} ${statusIcon} ${service.name}`;
  details = `${uptime} • ${requests} req`;
} else {
  display = `${service.icon} ${statusIcon} ${service.name} | Uptime: ${uptime} | Requests: ${requests} | Errors: ${errors}`;
}
```

```typescript
// Navigation adaptation  
if (isMobile) {
  // Two-row navigation with abbreviations
  row1 = "[1]Over [2]Comp [3]Test [4]Build";
  row2 = "[5]P2P [6]Acts [7]Logs";
} else {
  // Single-row navigation with full names
  nav = "[1] Overview [2] Composer [3] Battle [4] Builder [5] Air [6] Quick Actions [7] System Logs";
}
```

## Advanced Features

### Service Health Monitoring
```typescript
interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting';
  health: 'healthy' | 'warning' | 'critical' | 'unknown';
  metrics: {
    uptime?: number;      // Service uptime in seconds
    cpu?: number;         // CPU usage percentage
    memory?: number;      // Memory usage percentage  
    requests?: number;    // Total request count
    errors?: number;      // Error count
  };
}
```

### Real-Time Metrics Collection
- **Automatic Health Checks**: Periodic service status verification
- **Performance Monitoring**: CPU, memory, and response time tracking
- **Error Rate Analysis**: Automated error detection and categorization
- **Trend Analysis**: Historical performance data and prediction

### Cross-Service Workflow Automation
```typescript
// Example: Automated build and test workflow
async function executeFullPipeline() {
  await executeAction('Clean Build');        // Builder
  await executeAction('Build Documentation'); // Composer  
  await executeAction('Run All Tests');       // Battle
  await executeAction('Sync Network Data');   // Air
}
```

### Process Management
- **Background Execution**: Non-blocking operation execution
- **Process Lifecycle**: Start, monitor, stop, restart capabilities
- **Resource Monitoring**: Memory and CPU usage tracking
- **Automatic Recovery**: Service restart on failure

## Integration Architecture

### Service Discovery
```typescript
// Automatic service detection and registration
private async discoverServices(): Promise<ServiceStatus[]> {
  const services = [];
  
  // Check for @akaoio/composer
  if (await this.checkComposerAvailable()) {
    services.push(this.createComposerService());
  }
  
  // Check for @akaoio/battle  
  if (await this.checkBattleAvailable()) {
    services.push(this.createBattleService());
  }
  
  // Additional service discovery...
  return services;
}
```

### Inter-Service Communication
```typescript
// Cross-service coordination
interface ServiceMessage {
  from: string;      // Source service
  to: string;        // Target service  
  type: string;      // Message type
  payload: any;      // Message data
  timestamp: number; // Message timestamp
}
```

### Configuration Management
```typescript
// Unified configuration across services
interface DashboardConfig {
  refreshInterval: number;        // Auto-refresh timing
  enabledServices: string[];      // Active service list
  quickActions: QuickAction[];    // Available quick actions
  logRetention: number;           // Log history size
  mobileOptimizations: boolean;   // Mobile-specific features
}
```

## Production Deployment

### Docker Integration
```yaml
# docker-compose.yml example
version: '3.8'
services:
  akaoio-dashboard:
    image: akaoio/unified-dashboard
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DASHBOARD_PORT=8080
      - AUTO_REFRESH_INTERVAL=5000
    volumes:
      - ./projects:/workspace/projects
      - ./logs:/workspace/logs
```

### Environment Variables
```bash
# Dashboard configuration
DASHBOARD_PORT=8080
AUTO_REFRESH_INTERVAL=3000
LOG_RETENTION_DAYS=7
ENABLE_MOBILE_OPTIMIZATIONS=true

# Service configuration
COMPOSER_ENDPOINT=http://localhost:3001
BATTLE_ENDPOINT=http://localhost:3002
BUILDER_ENDPOINT=http://localhost:3003
AIR_ENDPOINT=http://localhost:3004
```

### Monitoring Integration
- **Prometheus Metrics**: Automated metrics export
- **Health Check Endpoints**: HTTP health check support
- **Log Forwarding**: Integration with centralized logging
- **Alert Management**: Automated alert generation and routing

## Use Cases & Applications

### 1. Development Team Management
- **Multi-Project Overview**: Manage multiple @akaoio projects
- **Team Collaboration**: Shared development environment monitoring
- **CI/CD Integration**: Build and test pipeline visualization

### 2. DevOps & Operations  
- **System Administration**: Service health and performance monitoring
- **Deployment Management**: Build and release process control
- **Infrastructure Monitoring**: Cross-service dependency tracking

### 3. Mobile Development Workflows
- **Remote Development**: Full-featured development via SSH
- **On-Call Management**: System monitoring from mobile devices  
- **Field Debugging**: Portable debugging and system control

### 4. Educational & Training
- **Learning Platform**: Comprehensive @akaoio ecosystem exploration
- **Best Practices**: Demonstration of integration patterns
- **Architecture Reference**: Production-ready TUI application example

This Unified Dashboard represents the pinnacle of TUI development, demonstrating how complex, multi-service development environments can be made accessible and manageable through thoughtful terminal interface design. It serves as both a practical development tool and a comprehensive reference implementation for enterprise-grade TUI applications.