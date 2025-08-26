# Mobile-First Responsive TUI Demo

A comprehensive demonstration of responsive design patterns for terminal user interfaces, showcasing how TUI applications can adapt to different screen sizes from mobile phones (40x15) to large desktops (120x40+).

## Features

### 📱 Mobile-First Design Philosophy
- Start with smallest screen constraints
- Progressive enhancement for larger screens
- Touch-friendly navigation patterns
- Essential information prioritization

### 🎯 Comprehensive Breakpoint System
- **Mobile Phone** (40-50 cols): Vertical navigation, essential info only
- **Mobile Landscape** (50-70 cols): Horizontal optimization, side-by-side elements
- **Tablet Portrait** (60-80 cols): Multi-column layouts, enhanced navigation
- **Tablet Landscape** (80-100 cols): Dashboard layouts, sidebar navigation
- **Desktop Small** (100-120 cols): Full feature set, multiple panels
- **Desktop Large** (120+ cols): Maximum density, power user features

### 🔄 Real-Time Responsive Adaptation
- Automatic breakpoint detection on terminal resize
- Dynamic layout switching without restart
- Progressive disclosure of features
- Adaptive information hierarchy

### 🧩 Component-Level Responsiveness
- Navigation patterns that adapt to available space
- Form layouts that reflow based on screen size
- Data tables that transform from lists to grids
- Dashboard widgets with progressive enhancement

## Quick Start

```bash
# Run the demo
npm run example:mobile

# Or directly with tsx
tsx examples/mobile-responsive/index.ts
```

### Test Different Screen Sizes
1. Start the demo in a large terminal
2. Gradually resize your terminal to see breakpoint transitions
3. Try these common sizes:
   - **40×15** (mobile phone in SSH app)
   - **60×20** (tablet portrait)
   - **80×25** (tablet landscape)
   - **100×30** (desktop standard)
   - **120×40** (desktop large)

## Demo Views & Features

### 1. Overview [1]
**Purpose**: Introduction to responsive design principles

**Mobile View**:
```
Mobile TUI Demo
Mobile Phone
40×15

W: ███████████████
✓ Touch-Friendly ✓ Essential-First

[1]Over [2]Breaks [3]Comps
[4]Nav [5]Forms [6]Demo
```

**Desktop View**:
```
Mobile-First Responsive TUI Design Demo              Current Breakpoint: Desktop Small
                                                                    100×30

Width: ████████████████████████████████████████████████ Height: ████████████████████████████
✓ Progressive Enhancement  ✓ Information Density  ✓ Multi-Column

[1] Overview  [2] Breakpoints  [3] Components  [4] Navigation  [5] Forms  [6] Interactive
```

### 2. Breakpoints [2]
**Purpose**: Detailed breakpoint system explanation

Shows all available breakpoints with:
- Size ranges and constraints
- Active breakpoint highlighting
- Feature differences at each breakpoint
- Current screen analysis

### 3. Components [3]
**Purpose**: Adaptive component demonstrations

Interactive showcase of:
- **Navigation Patterns**: How navigation adapts across breakpoints
- **Data Display**: Table to list transformations
- **Form Layouts**: Single to multi-column form progression
- **Dashboard Widgets**: Widget complexity based on available space

### 4. Navigation [4] 
**Purpose**: Navigation pattern comparison

Side-by-side comparison showing:

**Mobile**: `[1]Main [2]List [3]Opts` + `[4]Help [5]Exit`
**Tablet**: `[1] Main [2] List [3] Options [4] Help [5] Exit`
**Desktop**: `[1] Main Menu [2] Item List [3] Configuration [4] Help Center [5] Exit Application`

### 5. Forms [5]
**Purpose**: Responsive form layout patterns

**Mobile Layout** (Vertical Stacking):
```
Name:
[________________________]

Email:
[________________________]

Options:
○ Option A
○ Option B

[Submit] [Cancel]
```

**Desktop Layout** (Multi-Column):
```
Name:     [______________________]      Email:    [______________________]
Phone:    [______________________]      Company:  [______________________]

Options:  ○ Option A   ○ Option B   ○ Option C   ○ Option D
          ☑ Newsletter ☑ Updates   ○ Marketing

          [Submit]  [Cancel]  [Reset]  [Help]  [Save Draft]
```

### 6. Demo [6]
**Purpose**: Interactive responsive behavior testing

Live demonstration with:
- Responsive list selection (4 items on mobile, 8+ on desktop)
- Smart text truncation with ellipsis
- Adaptive selection indicators
- Real-time behavior explanation

## Responsive Design Patterns

### 1. Breakpoint Detection System
```typescript
private detectBreakpoint(): ScreenBreakpoint {
  const { width, height } = this.dimensions;
  
  for (let i = this.breakpoints.length - 1; i >= 0; i--) {
    const bp = this.breakpoints[i];
    if (width >= bp.minWidth && height >= bp.minHeight) {
      if (bp.maxCols && width > bp.maxCols) continue;
      if (bp.maxRows && height > bp.maxRows) continue;
      return bp;
    }
  }
  
  return this.breakpoints[0]; // Fallback to mobile
}
```

### 2. Adaptive Navigation
```typescript
if (isMobile) {
  // Two-row navigation with abbreviated labels
  const row1 = `[1]Over [2]Breaks [3]Comps`;
  const row2 = `[4]Nav [5]Forms [6]Demo`;
} else {
  // Single-row navigation with full labels
  const nav = `[1] Overview [2] Breakpoints [3] Components...`;
}
```

### 3. Smart Text Truncation
```typescript
if (isMobile && text.length > width - 8) {
  text = text.substring(0, width - 11) + '...';
}
```

### 4. Progressive Information Disclosure
```typescript
if (isMobile) {
  // Essential info only
  showBasicStatus();
} else if (isTablet()) {
  // Enhanced info
  showBasicStatus();
  showAdditionalDetails();
} else {
  // Full feature set
  showBasicStatus();
  showAdditionalDetails();
  showAdvancedFeatures();
  showPowerUserTools();
}
```

### 5. Touch-Friendly Interaction Patterns
```typescript
// Mobile: Larger hit targets, simple interactions
const mobileMarker = this.selectedIndex === index ? '●' : '○';

// Desktop: Rich indicators, hover effects
const desktopMarker = this.selectedIndex === index ? '▶' : '  ';
```

## Design Principles Demonstrated

### 1. Mobile-First Approach
- Design for smallest screen first
- Add features as screen size increases
- Never remove functionality when scaling down

### 2. Information Architecture
- **Mobile**: Essential information only, one primary action
- **Tablet**: Grouped information, multiple related actions
- **Desktop**: Rich information density, full feature exposure

### 3. Navigation Patterns
- **Mobile**: Vertical stacking, large touch targets
- **Tablet**: Horizontal optimization, balanced density
- **Desktop**: Full horizontal navigation with shortcuts

### 4. Layout Adaptation
- **Mobile**: Single column, vertical flow
- **Tablet**: Strategic two-column layouts
- **Desktop**: Multi-column grids, sidebar layouts

### 5. Interaction Models
- **Mobile**: Touch-optimized, gesture-friendly
- **Tablet**: Hybrid touch/keyboard support
- **Desktop**: Keyboard-first, power user shortcuts

## Technical Implementation

### Responsive Architecture
```typescript
interface ScreenBreakpoint {
  name: string;
  minWidth: number;
  minHeight: number;
  maxCols?: number;
  maxRows?: number;
}

// Real-time dimension monitoring
const renderLoop = () => {
  const newDimensions = this.getScreenDimensions();
  if (dimensionsChanged(newDimensions)) {
    this.currentBreakpoint = this.detectBreakpoint();
  }
  this.render();
};
```

### Component Adaptation System
```typescript
interface AdaptiveComponent {
  id: string;
  title: string;
  mobileView: () => void;
  tabletView: () => void;
  desktopView: () => void;
}

// Dynamic component rendering
if (this.isMobile()) {
  component.mobileView();
} else if (this.isTablet()) {
  component.tabletView();
} else {
  component.desktopView();
}
```

### Performance Considerations
- Efficient breakpoint detection (O(n) where n = number of breakpoints)
- Minimal re-rendering on resize events
- Cached responsive calculations
- Optimized text truncation algorithms

## Use Cases & Applications

### 1. Mobile SSH Clients
- **Termux** (Android): 40-50 column support
- **iSH** (iOS): 50-60 column support
- **JuiceSSH** (Android): Variable sizes
- **Blink** (iOS): Full terminal emulation

### 2. Embedded Systems
- **IoT devices** with limited display
- **Industrial terminals** with fixed screen sizes
- **Embedded Linux** systems

### 3. Development Tools
- **CI/CD dashboards** that work on all devices
- **Monitoring tools** for on-call mobile access
- **Build systems** with mobile-friendly interfaces

### 4. Cross-Platform Applications
- **Cloud management** tools
- **Database administration** interfaces
- **System monitoring** applications

## Best Practices Demonstrated

### 1. Content Strategy
- Essential content first (mobile)
- Progressive enhancement (tablet/desktop)
- Never hide critical functionality

### 2. Interaction Design
- Touch-friendly targets (minimum 3 characters wide)
- Keyboard shortcuts for power users
- Context-sensitive help

### 3. Visual Hierarchy
- Color coding for status and importance
- Consistent spacing and alignment
- Clear visual grouping

### 4. Error Handling
- Graceful degradation on unsupported sizes
- Fallback to mobile layout for unknown terminals
- Clear error messages for constraint violations

This demo serves as a comprehensive reference for building responsive TUI applications that work seamlessly across all terminal sizes and devices.