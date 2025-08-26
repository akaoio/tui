#!/usr/bin/env tsx

/**
 * Mobile-First Responsive TUI Demo
 * 
 * Demonstrates comprehensive responsive design patterns for terminal interfaces:
 * - Adaptive layouts for screens from 40x15 to 120x40
 * - Touch-friendly navigation for phone SSH clients
 * - Progressive enhancement from mobile to desktop
 * - Responsive information hierarchy
 * - Breakpoint-based component adaptation
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  Screen, 
  Keyboard, 
  UnifiedKeyboardHandler, 
  Form, 
  Input, 
  Select, 
  ProgressBar, 
  Spinner, 
  Radio,
  Checkbox,
  ResponsiveCommands,
  colors,
  styles
} from '../../src';

interface ScreenBreakpoint {
  name: string;
  minWidth: number;
  minHeight: number;
  maxCols?: number;
  maxRows?: number;
}

interface ResponsiveLayout {
  name: string;
  description: string;
  component: () => void;
}

interface AdaptiveComponent {
  id: string;
  title: string;
  mobileView: () => void;
  tabletView: () => void;
  desktopView: () => void;
}

class MobileResponsiveDemo {
  private screen: Screen;
  private keyboard: Keyboard;
  private keyboardHandler: UnifiedKeyboardHandler;
  private currentView: 'overview' | 'breakpoints' | 'components' | 'navigation' | 'forms' | 'demo' = 'overview';
  private responsiveCommands: ResponsiveCommands;
  
  // Screen information
  private currentBreakpoint: ScreenBreakpoint;
  private dimensions: { width: number; height: number };
  
  // Demo state
  private selectedComponentIndex = 0;
  private demoFormData: Record<string, any> = {};
  private demoItems: string[] = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Long Item Name That Tests Truncation'];
  private selectedItemIndex = 0;
  
  // Responsive breakpoints
  private breakpoints: ScreenBreakpoint[] = [
    { name: 'Mobile Phone', minWidth: 40, minHeight: 15, maxCols: 50, maxRows: 20 },
    { name: 'Mobile Landscape', minWidth: 50, minHeight: 15, maxCols: 70, maxRows: 25 },
    { name: 'Tablet Portrait', minWidth: 60, minHeight: 20, maxCols: 80, maxRows: 30 },
    { name: 'Tablet Landscape', minWidth: 80, minHeight: 25, maxCols: 100, maxRows: 35 },
    { name: 'Desktop Small', minWidth: 100, minHeight: 30, maxCols: 120, maxRows: 40 },
    { name: 'Desktop Large', minWidth: 120, minHeight: 40 }
  ];
  
  // Demo components showcasing responsive patterns
  private components: AdaptiveComponent[] = [
    {
      id: 'navigation',
      title: 'Navigation Patterns',
      mobileView: () => this.renderMobileNavigation(),
      tabletView: () => this.renderTabletNavigation(),
      desktopView: () => this.renderDesktopNavigation()
    },
    {
      id: 'data-table',
      title: 'Data Display',
      mobileView: () => this.renderMobileDataView(),
      tabletView: () => this.renderTabletDataView(),
      desktopView: () => this.renderDesktopDataView()
    },
    {
      id: 'forms',
      title: 'Form Layouts',
      mobileView: () => this.renderMobileForm(),
      tabletView: () => this.renderTabletForm(),
      desktopView: () => this.renderDesktopForm()
    },
    {
      id: 'dashboard',
      title: 'Dashboard Widgets',
      mobileView: () => this.renderMobileDashboard(),
      tabletView: () => this.renderTabletDashboard(),
      desktopView: () => this.renderDesktopDashboard()
    }
  ];

  constructor() {
    this.screen = new Screen();
    this.keyboard = new Keyboard();
    this.keyboardHandler = new UnifiedKeyboardHandler(this.keyboard);
    this.responsiveCommands = new ResponsiveCommands();
    
    this.dimensions = this.getScreenDimensions();
    this.currentBreakpoint = this.detectBreakpoint();
    
    this.setupKeyboardHandlers();
  }

  private setupKeyboardHandlers(): void {
    // Global shortcuts
    this.keyboardHandler.registerBinding({ key: 'q', handler: () => this.quit() });
    this.keyboardHandler.registerBinding({ key: 'ctrl+c', handler: () => this.quit() });
    this.keyboardHandler.registerBinding({ key: 'h', handler: () => this.showHelp() });
    
    // View navigation
    this.keyboardHandler.registerBinding({ key: '1', handler: () => this.currentView = 'overview' });
    this.keyboardHandler.registerBinding({ key: '2', handler: () => this.currentView = 'breakpoints' });
    this.keyboardHandler.registerBinding({ key: '3', handler: () => this.currentView = 'components' });
    this.keyboardHandler.registerBinding({ key: '4', handler: () => this.currentView = 'navigation' });
    this.keyboardHandler.registerBinding({ key: '5', handler: () => this.currentView = 'forms' });
    this.keyboardHandler.registerBinding({ key: '6', handler: () => this.currentView = 'demo' });
    
    // Navigation
    this.keyboardHandler.registerBinding({ key: 'up', handler: () => this.navigateUp() });
    this.keyboardHandler.registerBinding({ key: 'down', handler: () => this.navigateDown() });
    this.keyboardHandler.registerBinding({ key: 'left', handler: () => this.navigateLeft() });
    this.keyboardHandler.registerBinding({ key: 'right', handler: () => this.navigateRight() });
    this.keyboardHandler.registerBinding({ key: 'enter', handler: () => this.handleEnter() });
    
    // Demo actions
    this.keyboardHandler.registerBinding({ key: 'r', handler: () => this.refreshScreen() });
    this.keyboardHandler.registerBinding({ key: 't', handler: () => this.testBreakpoint() });
  }

  private getScreenDimensions(): { width: number; height: number } {
    const { columns, rows } = process.stdout;
    return {
      width: columns || 80,
      height: rows || 24
    };
  }

  private detectBreakpoint(): ScreenBreakpoint {
    const { width, height } = this.dimensions;
    
    // Find the appropriate breakpoint
    for (let i = this.breakpoints.length - 1; i >= 0; i--) {
      const bp = this.breakpoints[i];
      if (width >= bp.minWidth && height >= bp.minHeight) {
        // Check max constraints if they exist
        if (bp.maxCols && width > bp.maxCols) continue;
        if (bp.maxRows && height > bp.maxRows) continue;
        return bp;
      }
    }
    
    // Fallback to mobile phone
    return this.breakpoints[0];
  }

  private isMobile(): boolean {
    return this.currentBreakpoint.name.includes('Mobile') || this.dimensions.width < 60;
  }

  private isTablet(): boolean {
    return this.currentBreakpoint.name.includes('Tablet');
  }

  private isDesktop(): boolean {
    return this.currentBreakpoint.name.includes('Desktop');
  }

  public async start(): Promise<void> {
    this.screen.clear();
    this.render();
    
    // Main rendering loop with automatic screen dimension updates
    const renderLoop = () => {
      // Check for screen size changes
      const newDimensions = this.getScreenDimensions();
      if (newDimensions.width !== this.dimensions.width || newDimensions.height !== this.dimensions.height) {
        this.dimensions = newDimensions;
        this.currentBreakpoint = this.detectBreakpoint();
      }
      
      this.render();
      setTimeout(renderLoop, 200); // Slightly slower refresh for demo
    };
    renderLoop();

    // Handle process cleanup
    process.on('SIGINT', () => this.quit());
    process.on('SIGTERM', () => this.quit());
  }

  private render(): void {
    const { width, height } = this.dimensions;
    const isMobile = this.isMobile();
    
    this.screen.clear();
    
    // Header with responsive design information
    this.renderResponsiveHeader(width, height, isMobile);
    
    // Adaptive navigation
    this.renderAdaptiveNavigation(width, isMobile);
    
    // Main content area
    const contentStartY = isMobile ? 8 : 6;
    this.screen.setCursor(0, contentStartY);
    
    switch (this.currentView) {
      case 'overview':
        this.renderOverview(width, height - contentStartY, isMobile);
        break;
      case 'breakpoints':
        this.renderBreakpointsView(width, height - contentStartY, isMobile);
        break;
      case 'components':
        this.renderComponentsView(width, height - contentStartY, isMobile);
        break;
      case 'navigation':
        this.renderNavigationDemo(width, height - contentStartY, isMobile);
        break;
      case 'forms':
        this.renderFormsDemo(width, height - contentStartY, isMobile);
        break;
      case 'demo':
        this.renderInteractiveDemo(width, height - contentStartY, isMobile);
        break;
    }
    
    // Footer with responsive commands
    this.renderResponsiveFooter(width, height, isMobile);
  }

  private renderResponsiveHeader(width: number, height: number, isMobile: boolean): void {
    // Title line
    const title = isMobile ? "Mobile TUI Demo" : "Mobile-First Responsive TUI Design Demo";
    this.screen.write(0, 0, `${colors.cyan}${styles.bold}${title}${styles.reset}`);
    
    // Breakpoint information
    const bpInfo = isMobile ? 
      `${this.currentBreakpoint.name}` :
      `Current Breakpoint: ${this.currentBreakpoint.name}`;
    
    if (isMobile) {
      this.screen.write(0, 1, `${colors.yellow}${bpInfo}${colors.reset}`);
      this.screen.write(0, 2, `${colors.blue}${this.dimensions.width}×${this.dimensions.height}${colors.reset}`);
    } else {
      this.screen.write(width - bpInfo.length - 15, 0, `${colors.yellow}${bpInfo}${colors.reset}`);
      this.screen.write(width - 15, 1, `${colors.blue}${this.dimensions.width}×${this.dimensions.height}${colors.reset}`);
    }
    
    // Screen size indicator with visual representation
    const sizeIndicator = this.createScreenSizeIndicator(width, isMobile);
    const indicatorY = isMobile ? 3 : 2;
    this.screen.write(0, indicatorY, sizeIndicator);
    
    // Responsive design principles indicator
    const principles = this.getActivePrinciples();
    const principlesY = indicatorY + 1;
    
    if (isMobile) {
      principles.forEach((principle, index) => {
        if (index < 2) { // Show only first 2 on mobile
          this.screen.write(index * 20, principlesY, `${colors.green}✓ ${principle}${colors.reset}`);
        }
      });
    } else {
      const principlesText = principles.map(p => `${colors.green}✓ ${p}${colors.reset}`).join('  ');
      this.screen.write(0, principlesY, principlesText);
    }
    
    // Draw separator
    const separatorY = principlesY + 1;
    this.screen.write(0, separatorY, '─'.repeat(width));
  }

  private createScreenSizeIndicator(terminalWidth: number, isMobile: boolean): string {
    const { width, height } = this.dimensions;
    const maxBarWidth = isMobile ? 30 : 50;
    
    // Create a visual representation of screen size
    const widthBar = Math.round((width / 120) * maxBarWidth);
    const heightBar = Math.round((height / 40) * (maxBarWidth / 2));
    
    const widthIndicator = '█'.repeat(Math.max(1, widthBar)) + '░'.repeat(Math.max(0, maxBarWidth - widthBar));
    const heightIndicator = '█'.repeat(Math.max(1, heightBar)) + '░'.repeat(Math.max(0, (maxBarWidth / 2) - heightBar));
    
    if (isMobile) {
      return `W: ${widthIndicator.substring(0, 15)}`;
    } else {
      return `Width: ${widthIndicator} Height: ${heightIndicator}`;
    }
  }

  private getActivePrinciples(): string[] {
    const principles = [];
    
    if (this.isMobile()) {
      principles.push('Touch-Friendly', 'Essential-First');
    } else if (this.isTablet()) {
      principles.push('Adaptive', 'Progressive', 'Readable');
    } else {
      principles.push('Progressive Enhancement', 'Information Density', 'Multi-Column');
    }
    
    return principles;
  }

  private renderAdaptiveNavigation(width: number, isMobile: boolean): void {
    const views = [
      { key: '1', name: 'Overview', fullName: 'Overview', view: 'overview' },
      { key: '2', name: 'Breaks', fullName: 'Breakpoints', view: 'breakpoints' },
      { key: '3', name: 'Comps', fullName: 'Components', view: 'components' },
      { key: '4', name: 'Nav', fullName: 'Navigation', view: 'navigation' },
      { key: '5', name: 'Forms', fullName: 'Forms', view: 'forms' },
      { key: '6', name: 'Demo', fullName: 'Interactive', view: 'demo' }
    ];
    
    if (isMobile) {
      // Mobile: Two rows of abbreviated navigation
      const row1 = views.slice(0, 3).map(({ key, name, view }) => {
        const active = this.currentView === view;
        const color = active ? colors.bgCyan + colors.black : colors.cyan;
        return `${color}[${key}]${name}${colors.reset}`;
      }).join(' ');
      
      const row2 = views.slice(3).map(({ key, name, view }) => {
        const active = this.currentView === view;
        const color = active ? colors.bgCyan + colors.black : colors.cyan;
        return `${color}[${key}]${name}${colors.reset}`;
      }).join(' ');
      
      this.screen.write(0, 6, row1);
      this.screen.write(0, 7, row2);
    } else {
      // Desktop: Single row with full names
      const nav = views.map(({ key, fullName, view }) => {
        const active = this.currentView === view;
        const color = active ? colors.bgCyan + colors.black : colors.cyan;
        return `${color}[${key}] ${fullName}${colors.reset}`;
      }).join('  ');
      
      this.screen.write(0, 5, nav);
    }
  }

  private renderOverview(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Mobile-First Responsive TUI Design${colors.reset}`);
    y++;
    
    if (isMobile) {
      // Mobile-optimized overview
      this.screen.write(0, y++, `${colors.blue}Current Setup:${colors.reset}`);
      this.screen.write(0, y++, `• ${this.currentBreakpoint.name}`);
      this.screen.write(0, y++, `• ${this.dimensions.width}×${this.dimensions.height} characters`);
      y++;
      
      this.screen.write(0, y++, `${colors.blue}Key Features:${colors.reset}`);
      this.screen.write(0, y++, `• Touch navigation`);
      this.screen.write(0, y++, `• Smart truncation`);
      this.screen.write(0, y++, `• Essential info first`);
      this.screen.write(0, y++, `• Adaptive layouts`);
      y++;
      
      this.screen.write(0, y++, `${colors.blue}Try This:${colors.reset}`);
      this.screen.write(0, y++, `• Resize terminal`);
      this.screen.write(0, y++, `• View [3] Components`);
      this.screen.write(0, y++, `• Test [6] Demo`);
    } else {
      // Desktop-enhanced overview
      this.screen.write(0, y++, `This demo showcases comprehensive responsive design patterns for terminal interfaces.`);
      y++;
      
      this.screen.write(0, y++, `${colors.blue}Current Environment:${colors.reset}`);
      this.screen.write(0, y++, `• Breakpoint: ${this.currentBreakpoint.name}`);
      this.screen.write(0, y++, `• Terminal Size: ${this.dimensions.width}×${this.dimensions.height} characters`);
      this.screen.write(0, y++, `• Layout Mode: ${this.isMobile() ? 'Mobile' : this.isTablet() ? 'Tablet' : 'Desktop'}`);
      y++;
      
      this.screen.write(0, y++, `${colors.blue}Responsive Design Principles:${colors.reset}`);
      this.screen.write(0, y++, `• ${colors.green}Mobile-First Approach${colors.reset}: Start with smallest screen, enhance progressively`);
      this.screen.write(0, y++, `• ${colors.green}Touch-Friendly Navigation${colors.reset}: Larger hit targets, simple interactions`);
      this.screen.write(0, y++, `• ${colors.green}Information Hierarchy${colors.reset}: Essential content first, progressive disclosure`);
      this.screen.write(0, y++, `• ${colors.green}Adaptive Components${colors.reset}: Components change behavior based on available space`);
      this.screen.write(0, y++, `• ${colors.green}Smart Truncation${colors.reset}: Context-aware text shortening with ellipsis`);
      y++;
      
      this.screen.write(0, y++, `${colors.blue}Breakpoint System:${colors.reset}`);
      this.breakpoints.forEach(bp => {
        const isCurrent = bp.name === this.currentBreakpoint.name;
        const marker = isCurrent ? colors.green + '●' : colors.gray + '○';
        const constraint = bp.maxCols ? ` (${bp.minWidth}-${bp.maxCols} cols)` : ` (${bp.minWidth}+ cols)`;
        this.screen.write(0, y++, `${marker} ${bp.name}${colors.reset}${constraint}`);
      });
    }
    
    if (y < height - 3) {
      y++;
      this.screen.write(0, y++, `${colors.bold}Quick Actions:${colors.reset}`);
      
      if (isMobile) {
        this.screen.write(0, y++, `[r] Refresh • [t] Test`);
      } else {
        this.screen.write(0, y++, `[r] Refresh Screen Size • [t] Test Different Breakpoint • [2] View Breakpoint Details`);
      }
    }
  }

  private renderBreakpointsView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Responsive Breakpoints${colors.reset}`);
    y++;
    
    this.breakpoints.forEach((bp, index) => {
      if (y >= height - 2) return;
      
      const isCurrent = bp.name === this.currentBreakpoint.name;
      const marker = isCurrent ? colors.green + '●' : colors.gray + '○';
      
      if (isMobile) {
        // Mobile: Compact breakpoint display
        this.screen.write(0, y++, `${marker} ${bp.name}${colors.reset}`);
        if (isCurrent) {
          this.screen.write(2, y++, `${colors.blue}${bp.minWidth}×${bp.minHeight}+${colors.reset}`);
        }
      } else {
        // Desktop: Detailed breakpoint information
        const sizeRange = bp.maxCols ? 
          `${bp.minWidth}-${bp.maxCols} × ${bp.minHeight}${bp.maxRows ? `-${bp.maxRows}` : '+'}` :
          `${bp.minWidth}+ × ${bp.minHeight}+`;
        
        this.screen.write(0, y++, `${marker} ${styles.bold}${bp.name}${styles.reset}: ${sizeRange} characters`);
        
        // Show what changes at this breakpoint
        if (isCurrent) {
          const features = this.getBreakpointFeatures(bp);
          features.forEach(feature => {
            if (y < height - 2) {
              this.screen.write(4, y++, `${colors.blue}• ${feature}${colors.reset}`);
            }
          });
        }
      }
    });
    
    if (y < height - 5) {
      y += 2;
      this.screen.write(0, y++, `${colors.bold}Current Breakpoint Analysis:${colors.reset}`);
      
      const analysis = this.analyzeCurrentBreakpoint();
      analysis.forEach(point => {
        if (y < height - 2) {
          this.screen.write(0, y++, `${colors.blue}• ${point}${colors.reset}`);
        }
      });
    }
  }

  private getBreakpointFeatures(bp: ScreenBreakpoint): string[] {
    const features = [];
    
    switch (bp.name) {
      case 'Mobile Phone':
        features.push('Vertical navigation stacking', 'Essential information only', 'Large touch targets');
        break;
      case 'Mobile Landscape':
        features.push('Horizontal space optimization', 'Side-by-side elements', 'Improved readability');
        break;
      case 'Tablet Portrait':
        features.push('Multi-column layouts', 'Enhanced navigation', 'More information density');
        break;
      case 'Tablet Landscape':
        features.push('Dashboard layouts', 'Sidebar navigation', 'Rich data display');
        break;
      case 'Desktop Small':
        features.push('Full feature set', 'Multiple panels', 'Keyboard shortcuts');
        break;
      case 'Desktop Large':
        features.push('Maximum information density', 'Complex layouts', 'Power user features');
        break;
    }
    
    return features;
  }

  private analyzeCurrentBreakpoint(): string[] {
    const analysis = [];
    const { width, height } = this.dimensions;
    
    analysis.push(`Terminal size: ${width} columns × ${height} rows`);
    analysis.push(`Available content area: ~${width - 4} × ${height - 8} characters`);
    
    if (this.isMobile()) {
      analysis.push('Mobile layout active: Vertical stacking, essential info priority');
      analysis.push('Touch-friendly: Large hit targets, simple navigation');
    } else if (this.isTablet()) {
      analysis.push('Tablet layout active: Progressive enhancement over mobile');
      analysis.push('Balanced density: More information while remaining readable');
    } else {
      analysis.push('Desktop layout active: Full feature set with maximum density');
      analysis.push('Power user mode: Keyboard shortcuts, complex interactions');
    }
    
    return analysis;
  }

  private renderComponentsView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Adaptive Component Demonstrations${colors.reset}`);
    y++;
    
    this.components.forEach((component, index) => {
      if (y >= height - 5) return;
      
      const isSelected = index === this.selectedComponentIndex;
      const marker = isSelected ? `${colors.bgWhite}${colors.black}>` : ' ';
      const resetColor = isSelected ? colors.reset + colors.bgWhite + colors.black : colors.reset;
      
      this.screen.write(0, y++, `${marker}${colors.cyan}${component.title}${resetColor}`);
      
      if (isSelected || !isMobile) {
        const currentRenderer = this.isMobile() ? 'Mobile View' : 
                              this.isTablet() ? 'Tablet View' : 'Desktop View';
        this.screen.write(2, y++, `${colors.blue}Active: ${currentRenderer}${colors.reset}`);
        
        if (!isMobile) {
          // Show component in current responsive mode
          const startY = y;
          this.screen.write(2, y++, `${colors.gray}Preview:${colors.reset}`);
          
          // Render component preview
          this.screen.setCursor(4, y);
          if (this.isMobile()) {
            component.mobileView();
          } else if (this.isTablet()) {
            component.tabletView();
          } else {
            component.desktopView();
          }
          
          y += 3; // Approximate space for component preview
        }
      }
    });
    
    if (!isMobile && y < height - 3) {
      y++;
      this.screen.write(0, y++, `${colors.blue}Navigation:${colors.reset} Use ↑↓ to select components, Enter to view details`);
    }
  }

  private renderNavigationDemo(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Navigation Pattern Comparison${colors.reset}`);
    y++;
    
    // Show all three navigation patterns
    this.screen.write(0, y++, `${colors.blue}Mobile Navigation (Vertical Stack):${colors.reset}`);
    this.renderMobileNavigationExample(y);
    y += 4;
    
    if (!isMobile && y < height - 8) {
      this.screen.write(0, y++, `${colors.blue}Tablet Navigation (Enhanced):${colors.reset}`);
      this.renderTabletNavigationExample(y);
      y += 3;
      
      this.screen.write(0, y++, `${colors.blue}Desktop Navigation (Full Features):${colors.reset}`);
      this.renderDesktopNavigationExample(y);
    }
  }

  private renderMobileNavigationExample(startY: number): void {
    this.screen.write(2, startY, `${colors.cyan}[1]Main [2]List [3]Opts${colors.reset}`);
    this.screen.write(2, startY + 1, `${colors.cyan}[4]Help [5]Exit${colors.reset}`);
    this.screen.write(2, startY + 2, `${colors.gray}• Large touch targets${colors.reset}`);
    this.screen.write(2, startY + 3, `${colors.gray}• Two-row layout for space${colors.reset}`);
  }

  private renderTabletNavigationExample(startY: number): void {
    this.screen.write(2, startY, `${colors.cyan}[1] Main  [2] List  [3] Options  [4] Help  [5] Exit${colors.reset}`);
    this.screen.write(2, startY + 1, `${colors.gray}• Horizontal layout with more spacing${colors.reset}`);
    this.screen.write(2, startY + 2, `${colors.gray}• Full words for better readability${colors.reset}`);
  }

  private renderDesktopNavigationExample(startY: number): void {
    this.screen.write(2, startY, `${colors.cyan}[1] Main Menu    [2] Item List    [3] Configuration    [4] Help Center    [5] Exit Application${colors.reset}`);
    this.screen.write(2, startY + 1, `${colors.gray}• Full descriptive labels with keyboard shortcuts${colors.reset}`);
    this.screen.write(2, startY + 2, `${colors.gray}• Maximum information density and feature access${colors.reset}`);
  }

  private renderFormsDemo(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Responsive Form Layouts${colors.reset}`);
    y++;
    
    // Example form with responsive behavior
    this.screen.write(0, y++, `${colors.blue}Example Form - Current Layout: ${this.currentBreakpoint.name}${colors.reset}`);
    y++;
    
    if (isMobile) {
      // Mobile: Vertical stacking, labels above inputs
      this.screen.write(0, y++, `${colors.blue}Name:${colors.reset}`);
      this.screen.write(0, y++, `[________________________]`);
      y++;
      
      this.screen.write(0, y++, `${colors.blue}Email:${colors.reset}`);
      this.screen.write(0, y++, `[________________________]`);
      y++;
      
      this.screen.write(0, y++, `${colors.blue}Options:${colors.reset}`);
      this.screen.write(0, y++, `○ Option A`);
      this.screen.write(0, y++, `○ Option B`);
      y++;
      
      this.screen.write(0, y++, `[Submit] [Cancel]`);
    } else if (this.isTablet()) {
      // Tablet: Some horizontal pairing
      this.screen.write(0, y++, `Name:     [____________________]    Email: [____________________]`);
      y++;
      
      this.screen.write(0, y++, `Options:  ○ Option A    ○ Option B    ○ Option C`);
      y++;
      
      this.screen.write(0, y++, `          [Submit]  [Cancel]  [Help]`);
    } else {
      // Desktop: Multi-column layout
      this.screen.write(0, y++, `Name:     [______________________]      Email:    [______________________]`);
      this.screen.write(0, y++, `Phone:    [______________________]      Company:  [______________________]`);
      y++;
      
      this.screen.write(0, y++, `Options:  ○ Option A   ○ Option B   ○ Option C   ○ Option D`);
      this.screen.write(0, y++, `          ☑ Newsletter ☑ Updates   ○ Marketing`);
      y++;
      
      this.screen.write(0, y++, `          [Submit]  [Cancel]  [Reset]  [Help]  [Save Draft]`);
    }
    
    if (y < height - 5) {
      y += 2;
      this.screen.write(0, y++, `${colors.bold}Form Design Principles:${colors.reset}`);
      
      const principles = this.getFormPrinciples();
      principles.forEach(principle => {
        if (y < height - 2) {
          this.screen.write(0, y++, `${colors.blue}• ${principle}${colors.reset}`);
        }
      });
    }
  }

  private getFormPrinciples(): string[] {
    if (this.isMobile()) {
      return [
        'Vertical stacking for easy thumb navigation',
        'Labels above inputs for clarity',
        'Large touch targets (24+ characters wide)',
        'Minimize typing with smart defaults'
      ];
    } else if (this.isTablet()) {
      return [
        'Strategic horizontal pairing of related fields',
        'Balanced information density',
        'Clear visual grouping of form sections',
        'Progressive disclosure of advanced options'
      ];
    } else {
      return [
        'Multi-column layouts for efficiency',
        'Inline validation and help text',
        'Keyboard shortcuts and tab order',
        'Maximum feature exposure for power users',
        'Rich interaction patterns (hover, focus states)'
      ];
    }
  }

  private renderInteractiveDemo(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Interactive Responsive Demo${colors.reset}`);
    y++;
    
    // Interactive list with responsive selection
    this.screen.write(0, y++, `${colors.blue}Responsive List Selection:${colors.reset}`);
    
    const visibleItems = Math.min(this.demoItems.length, height - y - 5, isMobile ? 4 : 8);
    
    for (let i = 0; i < visibleItems; i++) {
      const item = this.demoItems[i];
      const isSelected = i === this.selectedItemIndex;
      const marker = isSelected ? (isMobile ? '●' : '▶') : (isMobile ? '○' : '  ');
      const color = isSelected ? colors.bgCyan + colors.black : colors.reset;
      
      let displayItem = item;
      const maxWidth = isMobile ? width - 8 : width - 12;
      if (displayItem.length > maxWidth) {
        displayItem = displayItem.substring(0, maxWidth - 3) + '...';
      }
      
      this.screen.write(0, y++, `${color}${marker} ${displayItem}${colors.reset}`);
    }
    
    if (this.demoItems.length > visibleItems) {
      this.screen.write(0, y++, `${colors.gray}... and ${this.demoItems.length - visibleItems} more items${colors.reset}`);
    }
    
    y++;
    
    // Demo controls
    this.screen.write(0, y++, `${colors.bold}Demo Controls:${colors.reset}`);
    
    if (isMobile) {
      this.screen.write(0, y++, `↑↓ Navigate items`);
      this.screen.write(0, y++, `[r] Refresh`);
    } else {
      this.screen.write(0, y++, `${colors.cyan}↑↓${colors.reset} Navigate items  ${colors.cyan}Enter${colors.reset} Select  ${colors.cyan}r${colors.reset} Refresh screen size`);
    }
    
    // Responsive behavior explanation
    if (!isMobile && y < height - 3) {
      y++;
      this.screen.write(0, y++, `${colors.bold}Current Responsive Behaviors:${colors.reset}`);
      
      const behaviors = this.getCurrentBehaviors();
      behaviors.forEach(behavior => {
        if (y < height - 1) {
          this.screen.write(0, y++, `${colors.blue}• ${behavior}${colors.reset}`);
        }
      });
    }
  }

  private getCurrentBehaviors(): string[] {
    const behaviors = [];
    
    if (this.isMobile()) {
      behaviors.push('List items limited to 4 visible for thumb navigation');
      behaviors.push('Smart text truncation with ellipsis for long items');
      behaviors.push('Simple bullet point selection indicators');
      behaviors.push('Vertical control stacking');
    } else if (this.isTablet()) {
      behaviors.push('Increased list visibility up to 6-8 items');
      behaviors.push('Enhanced selection indicators with arrows');
      behaviors.push('Horizontal control layout where space permits');
      behaviors.push('More detailed item information display');
    } else {
      behaviors.push('Maximum list visibility (8+ items)');
      behaviors.push('Rich selection indicators and hover effects');
      behaviors.push('Full keyboard shortcut integration');
      behaviors.push('Detailed metadata and secondary information');
    }
    
    return behaviors;
  }

  // Component-specific mobile/tablet/desktop renderers
  private renderMobileNavigation(): void {
    this.screen.write(0, 0, `${colors.cyan}[1]Home [2]List${colors.reset}`);
    this.screen.write(0, 1, `${colors.cyan}[3]Opts [4]Exit${colors.reset}`);
  }

  private renderTabletNavigation(): void {
    this.screen.write(0, 0, `${colors.cyan}[1] Home    [2] List    [3] Options    [4] Exit${colors.reset}`);
  }

  private renderDesktopNavigation(): void {
    this.screen.write(0, 0, `${colors.cyan}[1] Home Page    [2] Item List    [3] Configuration    [4] Exit Application${colors.reset}`);
  }

  private renderMobileDataView(): void {
    this.screen.write(0, 0, `Item 1`);
    this.screen.write(0, 1, `  Status: Active`);
    this.screen.write(0, 2, `Item 2`);
  }

  private renderTabletDataView(): void {
    this.screen.write(0, 0, `Item 1          | Active    | 12:30`);
    this.screen.write(0, 1, `Item 2          | Inactive  | 11:45`);
  }

  private renderDesktopDataView(): void {
    this.screen.write(0, 0, `ID   | Name              | Status   | Last Updated | Size   | Actions`);
    this.screen.write(0, 1, `001  | Item 1            | Active   | 12:30 PM     | 1.2MB  | Edit | Delete`);
    this.screen.write(0, 2, `002  | Item 2            | Inactive | 11:45 AM     | 0.8MB  | Edit | Delete`);
  }

  private renderMobileForm(): void {
    this.screen.write(0, 0, `Name:`);
    this.screen.write(0, 1, `[____________]`);
    this.screen.write(0, 2, `[Submit]`);
  }

  private renderTabletForm(): void {
    this.screen.write(0, 0, `Name: [____________]    Email: [____________]`);
    this.screen.write(0, 1, `      [Submit] [Cancel]`);
  }

  private renderDesktopForm(): void {
    this.screen.write(0, 0, `Name: [__________] Email: [__________] Phone: [__________]`);
    this.screen.write(0, 1, `      [Submit] [Cancel] [Reset] [Help]`);
  }

  private renderMobileDashboard(): void {
    this.screen.write(0, 0, `Status: OK`);
    this.screen.write(0, 1, `Count: 42`);
    this.screen.write(0, 2, `Last: 1m ago`);
  }

  private renderTabletDashboard(): void {
    this.screen.write(0, 0, `Status: OK     | Count: 42      | CPU: 45%`);
    this.screen.write(0, 1, `Memory: 2.1GB  | Disk: 89%      | Network: 12MB/s`);
  }

  private renderDesktopDashboard(): void {
    this.screen.write(0, 0, `┌─ System Status ─┐  ┌─ Performance ─┐  ┌─ Network ──┐`);
    this.screen.write(0, 1, `│ Status: OK      │  │ CPU:    45%   │  │ In:  12MB/s │`);
    this.screen.write(0, 2, `│ Uptime: 2d 4h   │  │ Memory: 2.1GB │  │ Out: 8MB/s  │`);
    this.screen.write(0, 3, `└─────────────────┘  └───────────────┘  └─────────────┘`);
  }

  private renderResponsiveFooter(width: number, height: number, isMobile: boolean): void {
    const footerY = height - 1;
    
    let commands;
    if (isMobile) {
      commands = this.responsiveCommands.getCommands(width, [
        { key: 'h', desc: 'Help' },
        { key: 'q', desc: 'Quit' },
        { key: 'r', desc: 'Refresh' }
      ]);
    } else {
      commands = this.responsiveCommands.getCommands(width, [
        { key: 'h', desc: 'Help' },
        { key: '1-6', desc: 'Views' },
        { key: '↑↓', desc: 'Navigate' },
        { key: 'r', desc: 'Refresh' },
        { key: 't', desc: 'Test' },
        { key: 'q', desc: 'Quit' }
      ]);
    }
    
    this.screen.write(0, footerY, `${colors.blue}${commands}${colors.reset}`);
  }

  // Navigation handlers
  private navigateUp(): void {
    if (this.currentView === 'components') {
      this.selectedComponentIndex = Math.max(0, this.selectedComponentIndex - 1);
    } else if (this.currentView === 'demo') {
      this.selectedItemIndex = Math.max(0, this.selectedItemIndex - 1);
    }
  }

  private navigateDown(): void {
    if (this.currentView === 'components') {
      this.selectedComponentIndex = Math.min(this.components.length - 1, this.selectedComponentIndex + 1);
    } else if (this.currentView === 'demo') {
      this.selectedItemIndex = Math.min(this.demoItems.length - 1, this.selectedItemIndex + 1);
    }
  }

  private navigateLeft(): void {
    // Could be used for horizontal navigation in some views
  }

  private navigateRight(): void {
    // Could be used for horizontal navigation in some views
  }

  private handleEnter(): void {
    if (this.currentView === 'components') {
      // Could show detailed component information
    } else if (this.currentView === 'demo') {
      // Could select the current item
      const selectedItem = this.demoItems[this.selectedItemIndex];
      // Demo selection action
    }
  }

  private refreshScreen(): void {
    this.dimensions = this.getScreenDimensions();
    this.currentBreakpoint = this.detectBreakpoint();
  }

  private testBreakpoint(): void {
    // Cycle through breakpoints for testing
    const currentIndex = this.breakpoints.findIndex(bp => bp.name === this.currentBreakpoint.name);
    const nextIndex = (currentIndex + 1) % this.breakpoints.length;
    this.currentBreakpoint = this.breakpoints[nextIndex];
  }

  private showHelp(): void {
    // In a full implementation, this would show a help modal
    // For demo purposes, just switch to overview
    this.currentView = 'overview';
  }

  private quit(): void {
    this.screen.cleanup();
    this.keyboard.stop();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  console.log('🎨 Starting Mobile-First Responsive TUI Demo...');
  console.log('💡 Resize your terminal to see responsive behavior in action!');
  console.log('📱 Try different sizes: 40x15 (mobile) to 120x40 (desktop)\n');
  
  const demo = new MobileResponsiveDemo();
  demo.start().catch(error => {
    console.error('❌ Failed to start Mobile Responsive Demo:', error);
    process.exit(1);
  });
}

export { MobileResponsiveDemo };