# TUI Examples

This directory contains comprehensive example applications demonstrating the full capabilities of the @akaoio/tui library, with special focus on **mobile-responsive design** and **real-world integration** with the @akaoio ecosystem.

## 🚀 Quick Start Guide

```bash
# Try the flagship examples first
npm run example:unified    # Complete @akaoio ecosystem dashboard
npm run example:mobile     # Mobile-responsive design patterns
npm run example:composer   # Documentation management interface
npm run example:battle     # Test execution dashboard
```

## 🎯 Featured Examples (@akaoio Integration)

### 1. Unified Dashboard (`unified-dashboard/`)
**🏆 The Ultimate Example** - Complete ecosystem management interface

```bash
npm run example:unified
```

**Features:**
- **Full @akaoio Integration**: Composer, Battle, Builder, Air in one interface
- **Enterprise-Grade Mobile Support**: 40×15 to 120×40+ responsive design  
- **Real-Time Monitoring**: Service health, metrics, and performance tracking
- **Quick Actions**: One-key shortcuts for development workflows
- **Production-Ready**: Demonstrates enterprise TUI application patterns

### 2. Composer TUI (`composer-ui/`)
**📝 Documentation Engine Interface**

```bash
npm run example:composer
```

**Features:**
- **Template Management**: Interactive documentation template selection
- **Live Preview**: Real-time documentation generation and preview
- **Mobile-Optimized**: Template selection and build monitoring on small screens

### 3. Battle Dashboard (`battle-dashboard/`)
**⚔️ Test Execution & Monitoring**

```bash
npm run example:battle
```

**Features:**
- **Real-Time Test Monitoring**: Live test execution tracking with progress bars
- **Visual Test Results**: Interactive test result exploration with replay controls
- **Mobile Test Management**: Essential test information on mobile terminals

### 4. Builder Monitor (`builder-monitor/`)
**🔧 Build Process Management**

```bash
npm run example:builder
```

**Features:**
- **Live Compilation Tracking**: Multi-format build progress (CJS, ESM, DTS)
- **Performance Metrics**: Build timing, bundle size analysis, and trends
- **Mobile Build Control**: Essential build information and controls for mobile

### 5. Air Client (`air-client/`)
**💫 P2P Database Management**

```bash
npm run example:air
```

**Features:**
- **Network Topology**: P2P node visualization and connection management
- **Distributed Data Browser**: Real-time data exploration across network nodes
- **Mobile P2P Management**: Essential network controls for mobile administration

### 6. Mobile-Responsive Demo (`mobile-responsive/`)
**📱 Responsive Design Masterclass**

```bash
npm run example:mobile
```

**Features:**
- **Comprehensive Breakpoint System**: 40×15 (mobile) to 120×40+ (desktop)
- **Real-Time Adaptation**: Live breakpoint switching and layout adaptation
- **Component Demonstrations**: Navigation, forms, data tables, dashboards

## 📚 Foundation Examples

### 7. Todo Application (`todos/`)
```bash
npm run example:todo
```
**Demonstrates:** Schema-driven UI, state management, CRUD operations

### 8. Dashboard Application (`dashboard/`)
```bash
npm run example:dashboard
```
**Demonstrates:** Complex layouts, real-time data, system monitoring

### 9. JSON Configuration Editor (`json-editor/`)
```bash
npm run example:json-editor
```
**Demonstrates:** Nested data navigation, type-safe editing, file persistence

## 📱 Mobile-First Responsive Design

All new examples follow our **mobile-first responsive design principles**:

### Breakpoint System
- **📱 Mobile Phone** (40-50 cols): Essential info, vertical navigation
- **📟 Tablet** (60-80 cols): Multi-column layouts, enhanced navigation
- **💻 Desktop** (80+ cols): Full feature set, maximum information density

### Key Design Principles
1. **Mobile-First**: Start with smallest constraints, enhance progressively
2. **Essential Information First**: Critical data visible on all screen sizes
3. **Touch-Friendly Navigation**: Large targets, simple interactions
4. **Smart Truncation**: Context-aware text shortening with ellipsis
5. **Progressive Disclosure**: Advanced features appear as space allows

## 🎯 Learning Path Recommendations

### 1. **New to TUI Development**
Start with: `todo` → `dashboard` → `mobile-responsive` → `unified-dashboard`

### 2. **Responsive Design Focus** 
Start with: `mobile-responsive` → `composer-ui` → `battle-dashboard` → `unified-dashboard`

### 3. **Real-World Integration**
Start with: `composer-ui` → `battle-dashboard` → `builder-monitor` → `air-client` → `unified-dashboard`

## 🚀 Running Examples

```bash
npm run example:unified     # Unified ecosystem dashboard
npm run example:mobile      # Mobile responsive patterns
npm run example:composer    # Composer documentation UI
npm run example:battle      # Battle testing dashboard  
npm run example:builder     # Builder monitor interface
npm run example:air         # Air P2P database client
npm run example:todo        # Todo schema-driven app
npm run example:dashboard   # System monitoring dashboard
npm run example:json-editor # JSON configuration editor
```

## 🔧 Creating Custom Examples

### Quick Template
```typescript
import { Screen, Keyboard, UnifiedKeyboardHandler, colors } from '../src';

class MyTUIApp {
  private screen = new Screen();
  private keyboard = new Keyboard();
  private keyboardHandler = new UnifiedKeyboardHandler(this.keyboard);

  constructor() {
    this.setupKeyboardHandlers();
  }

  private setupKeyboardHandlers(): void {
    this.keyboardHandler.onKey(['ctrl+c', 'q'], () => this.quit());
  }

  public async start(): Promise<void> {
    const renderLoop = () => {
      this.render();
      setTimeout(renderLoop, 100);
    };
    renderLoop();
  }

  private render(): void {
    this.screen.clear();
    this.screen.write(0, 0, `${colors.cyan}My TUI App${colors.reset}`);
  }

  private quit(): void {
    this.screen.cleanup();
    this.keyboard.stop();
    process.exit(0);
  }
}

const app = new MyTUIApp();
app.start();
```

These examples collectively demonstrate how to build sophisticated, production-ready TUI applications that work seamlessly across all terminal sizes and devices, with particular excellence in mobile responsive design and real-world integration patterns.