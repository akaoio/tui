#!/usr/bin/env tsx

/**
 * Unified @akaoio Dashboard
 * 
 * A comprehensive dashboard combining all @akaoio core technologies:
 * - @akaoio/composer: Documentation management and generation
 * - @akaoio/battle: Test execution and monitoring  
 * - @akaoio/builder: Build process monitoring and control
 * - @akaoio/air: P2P database network management
 * 
 * Features full responsive design for mobile terminals and serves as the
 * ultimate demonstration of TUI integration across the entire ecosystem.
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
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

interface ServiceStatus {
  name: string;
  icon: string;
  status: 'running' | 'stopped' | 'error' | 'starting';
  health: 'healthy' | 'warning' | 'critical' | 'unknown';
  lastCheck: number;
  metrics: {
    uptime?: number;
    cpu?: number;
    memory?: number;
    requests?: number;
    errors?: number;
  };
}

interface QuickAction {
  name: string;
  description: string;
  command: string;
  category: 'composer' | 'battle' | 'builder' | 'air';
  hotkey?: string;
}

interface SystemMetrics {
  totalProjects: number;
  totalTests: number;
  totalBuilds: number;
  totalNodes: number;
  overallHealth: 'healthy' | 'warning' | 'critical';
  lastUpdate: number;
}

class UnifiedDashboard {
  private screen: Screen;
  private keyboard: Keyboard;
  private keyboardHandler: UnifiedKeyboardHandler;
  private currentView: 'overview' | 'composer' | 'battle' | 'builder' | 'air' | 'actions' | 'logs' = 'overview';
  private projectPath: string;
  private responsiveCommands: ResponsiveCommands;
  
  // Service management
  private services: ServiceStatus[] = [];
  private selectedServiceIndex = 0;
  private systemMetrics: SystemMetrics;
  
  // Quick actions
  private quickActions: QuickAction[] = [];
  private selectedActionIndex = 0;
  
  // Process management
  private runningProcesses: Map<string, ChildProcess> = new Map();
  private logOutput: string[] = [];
  private autoRefresh = true;
  private refreshInterval = 3000;
  
  // UI state
  private selectedTabIndex = 0;
  private autoScroll = true;
  
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.screen = new Screen();
    this.keyboard = new Keyboard();
    this.keyboardHandler = new UnifiedKeyboardHandler(this.keyboard);
    this.responsiveCommands = new ResponsiveCommands();

    this.initializeServices();
    this.initializeQuickActions();
    this.setupKeyboardHandlers();
    this.startAutoRefresh();
  }

  private initializeServices(): void {
    this.services = [
      {
        name: 'Composer',
        icon: '📝',
        status: 'running',
        health: 'healthy',
        lastCheck: Date.now(),
        metrics: {
          uptime: 3600,
          requests: 145,
          errors: 0
        }
      },
      {
        name: 'Battle',
        icon: '⚔️',
        status: 'running',
        health: 'healthy',
        lastCheck: Date.now(),
        metrics: {
          uptime: 1800,
          requests: 89,
          errors: 2
        }
      },
      {
        name: 'Builder',
        icon: '🔧',
        status: 'running',
        health: 'warning',
        lastCheck: Date.now(),
        metrics: {
          uptime: 900,
          cpu: 45,
          memory: 78,
          requests: 23,
          errors: 1
        }
      },
      {
        name: 'Air',
        icon: '💫',
        status: 'stopped',
        health: 'unknown',
        lastCheck: Date.now() - 60000,
        metrics: {
          uptime: 0,
          requests: 0,
          errors: 0
        }
      }
    ];

    this.systemMetrics = {
      totalProjects: 4,
      totalTests: 156,
      totalBuilds: 23,
      totalNodes: 3,
      overallHealth: 'healthy',
      lastUpdate: Date.now()
    };
  }

  private initializeQuickActions(): void {
    this.quickActions = [
      // Composer actions
      {
        name: 'Build Documentation',
        description: 'Generate all documentation from atomic sources',
        command: 'composer build',
        category: 'composer',
        hotkey: 'd'
      },
      {
        name: 'Watch Mode',
        description: 'Start composer in watch mode for live updates',
        command: 'composer watch',
        category: 'composer',
        hotkey: 'w'
      },
      {
        name: 'Create Template',
        description: 'Generate new documentation template',
        command: 'composer init template',
        category: 'composer'
      },
      
      // Battle actions
      {
        name: 'Run All Tests',
        description: 'Execute complete test suite across all packages',
        command: 'npm run test:all',
        category: 'battle',
        hotkey: 't'
      },
      {
        name: 'Visual Tests',
        description: 'Run visual regression tests with screenshots',
        command: 'npm run test:visual',
        category: 'battle'
      },
      {
        name: 'Performance Tests',
        description: 'Execute performance benchmarks',
        command: 'npm run test:performance',
        category: 'battle'
      },
      
      // Builder actions
      {
        name: 'Clean Build',
        description: 'Clean and rebuild all packages',
        command: 'npm run build:clean',
        category: 'builder',
        hotkey: 'b'
      },
      {
        name: 'Dev Build',
        description: 'Start development build with watch mode',
        command: 'npm run build:dev',
        category: 'builder'
      },
      {
        name: 'Production Build',
        description: 'Optimized production build',
        command: 'npm run build:prod',
        category: 'builder'
      },
      
      // Air actions
      {
        name: 'Start Network',
        description: 'Initialize P2P database network',
        command: 'npm run air:start',
        category: 'air',
        hotkey: 'n'
      },
      {
        name: 'Sync Data',
        description: 'Force network data synchronization',
        command: 'npm run air:sync',
        category: 'air'
      },
      {
        name: 'Network Status',
        description: 'Check P2P network health and connectivity',
        command: 'npm run air:status',
        category: 'air'
      }
    ];
  }

  private setupKeyboardHandlers(): void {
    // Global shortcuts
    this.keyboardHandler.onKey(['ctrl+c', 'q'], () => this.quit());
    this.keyboardHandler.onKey('h', () => this.showHelp());
    
    // View navigation
    this.keyboardHandler.onKey('1', () => this.currentView = 'overview');
    this.keyboardHandler.onKey('2', () => this.currentView = 'composer');
    this.keyboardHandler.onKey('3', () => this.currentView = 'battle');
    this.keyboardHandler.onKey('4', () => this.currentView = 'builder');
    this.keyboardHandler.onKey('5', () => this.currentView = 'air');
    this.keyboardHandler.onKey('6', () => this.currentView = 'actions');
    this.keyboardHandler.onKey('7', () => this.currentView = 'logs');
    
    // Quick action hotkeys
    this.keyboardHandler.onKey('d', () => this.executeQuickAction('d'));
    this.keyboardHandler.onKey('w', () => this.executeQuickAction('w'));
    this.keyboardHandler.onKey('t', () => this.executeQuickAction('t'));
    this.keyboardHandler.onKey('b', () => this.executeQuickAction('b'));
    this.keyboardHandler.onKey('n', () => this.executeQuickAction('n'));
    
    // System control
    this.keyboardHandler.onKey('r', () => this.refreshAll());
    this.keyboardHandler.onKey('s', () => this.toggleService());
    this.keyboardHandler.onKey('a', () => this.toggleAutoRefresh());
    this.keyboardHandler.onKey('c', () => this.clearLogs());
    
    // Navigation
    this.keyboardHandler.onKey('up', () => this.navigateUp());
    this.keyboardHandler.onKey('down', () => this.navigateDown());
    this.keyboardHandler.onKey('left', () => this.navigateLeft());
    this.keyboardHandler.onKey('right', () => this.navigateRight());
    this.keyboardHandler.onKey('enter', () => this.handleEnter());
    this.keyboardHandler.onKey('space', () => this.handleSpace());
  }

  private startAutoRefresh(): void {
    setInterval(() => {
      if (this.autoRefresh) {
        this.updateSystemStatus();
      }
    }, this.refreshInterval);
  }

  private updateSystemStatus(): void {
    // Simulate service health checks
    this.services.forEach(service => {
      service.lastCheck = Date.now();
      
      // Simulate status changes
      if (Math.random() < 0.1) {
        if (service.status === 'running' && Math.random() < 0.05) {
          service.health = service.health === 'healthy' ? 'warning' : 'healthy';
        }
      }
      
      // Update metrics
      if (service.status === 'running') {
        service.metrics.uptime = (service.metrics.uptime || 0) + (this.refreshInterval / 1000);
        service.metrics.requests = (service.metrics.requests || 0) + Math.floor(Math.random() * 5);
        
        if (Math.random() < 0.02) {
          service.metrics.errors = (service.metrics.errors || 0) + 1;
        }
      }
    });

    // Update system metrics
    this.systemMetrics.lastUpdate = Date.now();
    
    const healthyServices = this.services.filter(s => s.health === 'healthy').length;
    const totalServices = this.services.length;
    
    if (healthyServices === totalServices) {
      this.systemMetrics.overallHealth = 'healthy';
    } else if (healthyServices >= totalServices * 0.5) {
      this.systemMetrics.overallHealth = 'warning';
    } else {
      this.systemMetrics.overallHealth = 'critical';
    }
  }

  private getScreenDimensions(): { width: number; height: number; isMobile: boolean } {
    const { columns, rows } = process.stdout;
    const width = columns || 80;
    const height = rows || 24;
    const isMobile = width < 60 || height < 20;
    
    return { width, height, isMobile };
  }

  public async start(): Promise<void> {
    this.screen.clear();
    this.render();
    
    // Main rendering loop
    const renderLoop = () => {
      this.render();
      setTimeout(renderLoop, 150);
    };
    renderLoop();

    // Handle process cleanup
    process.on('SIGINT', () => this.quit());
    process.on('SIGTERM', () => this.quit());
  }

  private render(): void {
    const { width, height, isMobile } = this.getScreenDimensions();
    
    this.screen.clear();
    
    // Header
    this.renderHeader(width, isMobile);
    
    // Navigation
    if (isMobile) {
      this.renderMobileNavigation(width);
    } else {
      this.renderDesktopNavigation(width);
    }
    
    // Main content
    const contentStartY = isMobile ? 8 : 6;
    this.screen.setCursor(0, contentStartY);
    
    switch (this.currentView) {
      case 'overview':
        this.renderOverview(width, height - contentStartY, isMobile);
        break;
      case 'composer':
        this.renderComposerView(width, height - contentStartY, isMobile);
        break;
      case 'battle':
        this.renderBattleView(width, height - contentStartY, isMobile);
        break;
      case 'builder':
        this.renderBuilderView(width, height - contentStartY, isMobile);
        break;
      case 'air':
        this.renderAirView(width, height - contentStartY, isMobile);
        break;
      case 'actions':
        this.renderActionsView(width, height - contentStartY, isMobile);
        break;
      case 'logs':
        this.renderLogsView(width, height - contentStartY, isMobile);
        break;
    }
    
    // Footer
    this.renderFooter(width, height, isMobile);
  }

  private renderHeader(width: number, isMobile: boolean): void {
    const title = isMobile ? "@akaoio Dashboard" : "@akaoio Unified Development Dashboard";
    const projectName = path.basename(this.projectPath);
    
    this.screen.write(0, 0, `${colors.cyan}${styles.bold}${title}${styles.reset}`);
    
    if (!isMobile) {
      this.screen.write(width - projectName.length - 12, 0, 
        `${colors.yellow}Project: ${projectName}${colors.reset}`);
    }
    
    // System status line
    const statusY = isMobile ? 1 : 1;
    const healthColor = this.getHealthColor(this.systemMetrics.overallHealth);
    const healthIcon = this.getHealthIcon(this.systemMetrics.overallHealth);
    
    this.screen.write(0, statusY, `${healthColor}${healthIcon} System ${this.systemMetrics.overallHealth}${colors.reset}`);
    
    // Service status summary
    const runningServices = this.services.filter(s => s.status === 'running').length;
    const servicesSummary = `${runningServices}/${this.services.length} services`;
    
    if (isMobile) {
      this.screen.write(0, statusY + 1, `${colors.blue}${servicesSummary}${colors.reset}`);
    } else {
      this.screen.write(width - servicesSummary.length - 1, statusY, `${colors.blue}${servicesSummary}${colors.reset}`);
    }
    
    // Auto-refresh indicator
    if (this.autoRefresh) {
      const refreshY = statusY + (isMobile ? 2 : 1);
      const refreshText = isMobile ? '◉ Auto' : `◉ Auto-refresh (${this.refreshInterval/1000}s)`;
      this.screen.write(0, refreshY, `${colors.blue}${refreshText}${colors.reset}`);
    }
    
    // Quick metrics (desktop only)
    if (!isMobile) {
      const metricsY = statusY + 2;
      const metrics = `Projects: ${this.systemMetrics.totalProjects} | Tests: ${this.systemMetrics.totalTests} | Builds: ${this.systemMetrics.totalBuilds} | Nodes: ${this.systemMetrics.totalNodes}`;
      this.screen.write(0, metricsY, `${colors.gray}${metrics}${colors.reset}`);
    }
    
    // Draw separator
    const separatorY = isMobile ? statusY + 3 : statusY + 3;
    this.screen.write(0, separatorY, '─'.repeat(width));
  }

  private renderMobileNavigation(width: number): void {
    const views = [
      { key: '1', name: 'Over', view: 'overview' },
      { key: '2', name: 'Comp', view: 'composer' },
      { key: '3', name: 'Test', view: 'battle' },
      { key: '4', name: 'Build', view: 'builder' },
      { key: '5', name: 'P2P', view: 'air' },
      { key: '6', name: 'Acts', view: 'actions' },
      { key: '7', name: 'Logs', view: 'logs' }
    ];
    
    const nav1 = views.slice(0, 4).map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}]${name}${colors.reset}`;
    }).join(' ');
    
    const nav2 = views.slice(4).map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}]${name}${colors.reset}`;
    }).join(' ');
    
    this.screen.write(0, 6, nav1);
    this.screen.write(0, 7, nav2);
  }

  private renderDesktopNavigation(width: number): void {
    const views = [
      { key: '1', name: 'Overview', view: 'overview' },
      { key: '2', name: 'Composer', view: 'composer' },
      { key: '3', name: 'Battle', view: 'battle' },
      { key: '4', name: 'Builder', view: 'builder' },
      { key: '5', name: 'Air', view: 'air' },
      { key: '6', name: 'Quick Actions', view: 'actions' },
      { key: '7', name: 'System Logs', view: 'logs' }
    ];
    
    const nav = views.map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}] ${name}${colors.reset}`;
    }).join('  ');
    
    this.screen.write(0, 5, nav);
  }

  private renderOverview(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}System Overview${colors.reset}`);
    y++;
    
    // Service status grid
    this.screen.write(0, y++, `${colors.bold}Service Status:${colors.reset}`);
    
    if (isMobile) {
      // Mobile: Vertical service list
      this.services.forEach(service => {
        if (y >= height - 5) return;
        
        const statusIcon = this.getStatusIcon(service.status);
        const healthColor = this.getHealthColor(service.health);
        
        this.screen.write(0, y++, `${service.icon} ${healthColor}${statusIcon}${colors.reset} ${service.name}`);
        
        if (service.status === 'running') {
          const uptime = this.formatUptime(service.metrics.uptime || 0);
          this.screen.write(2, y++, `${colors.gray}${uptime} • ${service.metrics.requests || 0} req${colors.reset}`);
        }
      });
    } else {
      // Desktop: Service grid with detailed info
      this.services.forEach(service => {
        if (y >= height - 8) return;
        
        const statusIcon = this.getStatusIcon(service.status);
        const healthColor = this.getHealthColor(service.health);
        const uptime = service.metrics.uptime ? this.formatUptime(service.metrics.uptime) : 'N/A';
        const requests = service.metrics.requests || 0;
        const errors = service.metrics.errors || 0;
        
        this.screen.write(0, y++, 
          `${service.icon} ${healthColor}${statusIcon}${colors.reset} ${styles.bold}${service.name}${styles.reset} | ` +
          `Uptime: ${uptime} | Requests: ${requests} | Errors: ${errors}`);
      });
    }
    
    y += 2;
    
    // Quick actions section
    if (y < height - 5) {
      this.screen.write(0, y++, `${colors.bold}Quick Actions:${colors.reset}`);
      
      const hotKeyActions = this.quickActions.filter(a => a.hotkey);
      const displayActions = hotKeyActions.slice(0, isMobile ? 4 : 8);
      
      if (isMobile) {
        displayActions.forEach(action => {
          if (y < height - 2) {
            this.screen.write(0, y++, `${colors.cyan}[${action.hotkey}]${colors.reset} ${action.name}`);
          }
        });
      } else {
        displayActions.forEach((action, index) => {
          if (y < height - 2) {
            if (index % 2 === 0 && index + 1 < displayActions.length) {
              const nextAction = displayActions[index + 1];
              this.screen.write(0, y++, 
                `${colors.cyan}[${action.hotkey}]${colors.reset} ${action.name}  ${colors.cyan}[${nextAction.hotkey}]${colors.reset} ${nextAction.name}`);
            } else if (index % 2 === 0) {
              this.screen.write(0, y++, `${colors.cyan}[${action.hotkey}]${colors.reset} ${action.name}`);
            }
          }
        });
      }
    }
    
    // Recent activity (if space allows)
    if (!isMobile && y < height - 3) {
      y++;
      this.screen.write(0, y++, `${colors.bold}Recent Activity:${colors.reset}`);
      
      const recentLogs = this.logOutput.slice(-3);
      recentLogs.forEach(log => {
        if (y < height - 1) {
          let logLine = log;
          if (logLine.length > width - 2) {
            logLine = logLine.substring(0, width - 5) + '...';
          }
          this.screen.write(0, y++, `${colors.gray}${logLine}${colors.reset}`);
        }
      });
    }
  }

  private renderComposerView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}📝 Composer Documentation Engine${colors.reset}`);
    y++;
    
    const service = this.services.find(s => s.name === 'Composer');
    if (!service) return;
    
    // Service status
    this.renderServiceStatus(service, y, isMobile);
    y += isMobile ? 3 : 2;
    
    // Composer-specific metrics
    this.screen.write(0, y++, `${colors.blue}Documentation Status:${colors.reset}`);
    this.screen.write(2, y++, `• Generated files: 12`);
    this.screen.write(2, y++, `• Templates: 8`);
    this.screen.write(2, y++, `• Atomic sources: 45`);
    this.screen.write(2, y++, `• Last build: 2m ago`);
    y++;
    
    // Available actions
    this.screen.write(0, y++, `${colors.bold}Available Actions:${colors.reset}`);
    
    const composerActions = this.quickActions.filter(a => a.category === 'composer');
    composerActions.forEach(action => {
      if (y < height - 2) {
        const hotkey = action.hotkey ? `[${action.hotkey}]` : '';
        this.screen.write(0, y++, `${colors.cyan}${hotkey}${colors.reset} ${action.name}`);
        
        if (!isMobile) {
          this.screen.write(4, y++, `${colors.gray}${action.description}${colors.reset}`);
        }
      }
    });
  }

  private renderBattleView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}⚔️ Battle Testing Framework${colors.reset}`);
    y++;
    
    const service = this.services.find(s => s.name === 'Battle');
    if (!service) return;
    
    // Service status
    this.renderServiceStatus(service, y, isMobile);
    y += isMobile ? 3 : 2;
    
    // Battle-specific metrics
    this.screen.write(0, y++, `${colors.blue}Test Status:${colors.reset}`);
    this.screen.write(2, y++, `• Total tests: ${this.systemMetrics.totalTests}`);
    this.screen.write(2, y++, `• Last run: ✓ 145 passed, 2 failed`);
    this.screen.write(2, y++, `• Coverage: 89.2%`);
    this.screen.write(2, y++, `• Average duration: 1.2s`);
    y++;
    
    // Available actions
    this.screen.write(0, y++, `${colors.bold}Available Actions:${colors.reset}`);
    
    const battleActions = this.quickActions.filter(a => a.category === 'battle');
    battleActions.forEach(action => {
      if (y < height - 2) {
        const hotkey = action.hotkey ? `[${action.hotkey}]` : '';
        this.screen.write(0, y++, `${colors.cyan}${hotkey}${colors.reset} ${action.name}`);
        
        if (!isMobile) {
          this.screen.write(4, y++, `${colors.gray}${action.description}${colors.reset}`);
        }
      }
    });
  }

  private renderBuilderView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}🔧 Builder Build System${colors.reset}`);
    y++;
    
    const service = this.services.find(s => s.name === 'Builder');
    if (!service) return;
    
    // Service status
    this.renderServiceStatus(service, y, isMobile);
    y += isMobile ? 3 : 2;
    
    // Builder-specific metrics
    this.screen.write(0, y++, `${colors.blue}Build Status:${colors.reset}`);
    this.screen.write(2, y++, `• Total builds: ${this.systemMetrics.totalBuilds}`);
    this.screen.write(2, y++, `• Last build: ✓ Success (2.1s)`);
    this.screen.write(2, y++, `• Formats: CJS, ESM, DTS`);
    this.screen.write(2, y++, `• Bundle size: 45.2KB`);
    y++;
    
    // Available actions
    this.screen.write(0, y++, `${colors.bold}Available Actions:${colors.reset}`);
    
    const builderActions = this.quickActions.filter(a => a.category === 'builder');
    builderActions.forEach(action => {
      if (y < height - 2) {
        const hotkey = action.hotkey ? `[${action.hotkey}]` : '';
        this.screen.write(0, y++, `${colors.cyan}${hotkey}${colors.reset} ${action.name}`);
        
        if (!isMobile) {
          this.screen.write(4, y++, `${colors.gray}${action.description}${colors.reset}`);
        }
      }
    });
  }

  private renderAirView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}💫 Air P2P Database${colors.reset}`);
    y++;
    
    const service = this.services.find(s => s.name === 'Air');
    if (!service) return;
    
    // Service status
    this.renderServiceStatus(service, y, isMobile);
    y += isMobile ? 3 : 2;
    
    // Air-specific metrics
    this.screen.write(0, y++, `${colors.blue}Network Status:${colors.reset}`);
    this.screen.write(2, y++, `• Total nodes: ${this.systemMetrics.totalNodes}`);
    this.screen.write(2, y++, `• Connected: ${service.status === 'running' ? 2 : 0}/${this.systemMetrics.totalNodes}`);
    this.screen.write(2, y++, `• Records: 1,543`);
    this.screen.write(2, y++, `• Sync status: 98.6%`);
    y++;
    
    // Available actions
    this.screen.write(0, y++, `${colors.bold}Available Actions:${colors.reset}`);
    
    const airActions = this.quickActions.filter(a => a.category === 'air');
    airActions.forEach(action => {
      if (y < height - 2) {
        const hotkey = action.hotkey ? `[${action.hotkey}]` : '';
        this.screen.write(0, y++, `${colors.cyan}${hotkey}${colors.reset} ${action.name}`);
        
        if (!isMobile) {
          this.screen.write(4, y++, `${colors.gray}${action.description}${colors.reset}`);
        }
      }
    });
  }

  private renderActionsView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Quick Actions${colors.reset}`);
    y++;
    
    // Group actions by category
    const categories = ['composer', 'battle', 'builder', 'air'] as const;
    
    categories.forEach(category => {
      if (y >= height - 5) return;
      
      const categoryActions = this.quickActions.filter(a => a.category === category);
      if (categoryActions.length === 0) return;
      
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      this.screen.write(0, y++, `${colors.blue}${categoryName}:${colors.reset}`);
      
      categoryActions.forEach((action, index) => {
        if (y >= height - 3) return;
        
        const isSelected = this.selectedActionIndex === 
          this.quickActions.findIndex(a => a === action);
        const prefix = isSelected ? `${colors.bgWhite}${colors.black}>` : ' ';
        const resetColor = isSelected ? colors.reset + colors.bgWhite + colors.black : colors.reset;
        
        const hotkey = action.hotkey ? `[${action.hotkey}]` : '   ';
        
        if (isMobile) {
          this.screen.write(0, y++, `${prefix}${colors.cyan}${hotkey}${resetColor} ${action.name}${colors.reset}`);
        } else {
          this.screen.write(0, y++, 
            `${prefix}${colors.cyan}${hotkey}${resetColor} ${styles.bold}${action.name}${styles.reset}${colors.reset}`);
          this.screen.write(4, y++, `${colors.gray}${action.description}${colors.reset}`);
        }
      });
      
      y++;
    });
  }

  private renderLogsView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}System Logs${colors.reset}`);
    
    if (this.logOutput.length === 0) {
      this.screen.write(0, y + 2, `${colors.gray}No logs available${colors.reset}`);
      this.screen.write(0, y + 3, `${colors.blue}Tip:${colors.reset} Execute actions to see activity logs`);
      return;
    }
    
    y++;
    const maxLines = height - 3;
    const startIndex = this.autoScroll ? 
      Math.max(0, this.logOutput.length - maxLines) : 0;
    
    for (let i = startIndex; i < this.logOutput.length && y < height - 2; i++) {
      let line = this.logOutput[i];
      if (line.length > width - 1) {
        line = line.substring(0, width - 4) + '...';
      }
      
      // Color code log lines
      let color = colors.gray;
      if (line.includes('ERROR') || line.includes('✗')) color = colors.red;
      else if (line.includes('WARN') || line.includes('warning')) color = colors.yellow;
      else if (line.includes('✓') || line.includes('success')) color = colors.green;
      else if (line.includes('Starting') || line.includes('Building')) color = colors.blue;
      
      this.screen.write(0, y++, `${color}${line}${colors.reset}`);
    }
    
    // Scroll indicator
    if (this.logOutput.length > maxLines) {
      const scrollInfo = this.autoScroll ? 
        `[Auto] ${Math.min(startIndex + maxLines, this.logOutput.length)}/${this.logOutput.length}` :
        `${startIndex + 1}-${Math.min(startIndex + maxLines, this.logOutput.length)}/${this.logOutput.length}`;
      
      this.screen.write(width - scrollInfo.length - 1, height - 2, 
        `${colors.blue}${scrollInfo}${colors.reset}`);
    }
  }

  private renderServiceStatus(service: ServiceStatus, startY: number, isMobile: boolean): void {
    const statusIcon = this.getStatusIcon(service.status);
    const healthColor = this.getHealthColor(service.health);
    
    this.screen.write(0, startY, 
      `${colors.blue}Status:${colors.reset} ${healthColor}${statusIcon} ${service.status}${colors.reset} | ` +
      `${colors.blue}Health:${colors.reset} ${service.health}`);
    
    if (service.status === 'running' && service.metrics.uptime) {
      const uptime = this.formatUptime(service.metrics.uptime);
      this.screen.write(0, startY + 1, 
        `${colors.blue}Uptime:${colors.reset} ${uptime} | ` +
        `${colors.blue}Requests:${colors.reset} ${service.metrics.requests || 0} | ` +
        `${colors.blue}Errors:${colors.reset} ${service.metrics.errors || 0}`);
    }
  }

  private renderFooter(width: number, height: number, isMobile: boolean): void {
    const footerY = height - 1;
    
    let commands;
    if (isMobile) {
      commands = this.responsiveCommands.getCommands(width, [
        { key: 'h', desc: 'Help' },
        { key: 'q', desc: 'Quit' },
        { key: 'r', desc: 'Refresh' },
        { key: 's', desc: 'Service' }
      ]);
    } else {
      commands = this.responsiveCommands.getCommands(width, [
        { key: 'h', desc: 'Help' },
        { key: '1-7', desc: 'Views' },
        { key: 'd,w,t,b,n', desc: 'Quick' },
        { key: 'r', desc: 'Refresh' },
        { key: 's', desc: 'Service' },
        { key: 'a', desc: 'Auto' },
        { key: 'q', desc: 'Quit' }
      ]);
    }
    
    this.screen.write(0, footerY, `${colors.blue}${commands}${colors.reset}`);
  }

  // Helper methods
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'running': return '●';
      case 'starting': return '◐';
      case 'stopped': return '○';
      case 'error': return '✗';
      default: return '?';
    }
  }

  private getHealthColor(health: string): string {
    switch (health) {
      case 'healthy': return colors.green;
      case 'warning': return colors.yellow;
      case 'critical': return colors.red;
      default: return colors.gray;
    }
  }

  private getHealthIcon(health: string): string {
    switch (health) {
      case 'healthy': return '✓';
      case 'warning': return '⚠';
      case 'critical': return '✗';
      default: return '?';
    }
  }

  private formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${Math.floor(seconds)}s`;
  }

  // Navigation handlers
  private navigateUp(): void {
    if (this.currentView === 'actions') {
      this.selectedActionIndex = Math.max(0, this.selectedActionIndex - 1);
    } else if (this.currentView === 'overview') {
      this.selectedServiceIndex = Math.max(0, this.selectedServiceIndex - 1);
    }
  }

  private navigateDown(): void {
    if (this.currentView === 'actions') {
      this.selectedActionIndex = Math.min(this.quickActions.length - 1, this.selectedActionIndex + 1);
    } else if (this.currentView === 'overview') {
      this.selectedServiceIndex = Math.min(this.services.length - 1, this.selectedServiceIndex + 1);
    }
  }

  private navigateLeft(): void {
    // Could be used for horizontal navigation
  }

  private navigateRight(): void {
    // Could be used for horizontal navigation
  }

  private handleEnter(): void {
    if (this.currentView === 'actions') {
      const action = this.quickActions[this.selectedActionIndex];
      if (action) {
        this.executeAction(action);
      }
    }
  }

  private handleSpace(): void {
    if (this.currentView === 'overview') {
      this.toggleService();
    }
  }

  // Action handlers
  private executeQuickAction(hotkey: string): void {
    const action = this.quickActions.find(a => a.hotkey === hotkey);
    if (action) {
      this.executeAction(action);
    }
  }

  private executeAction(action: QuickAction): void {
    this.logOutput.push(`Executing: ${action.name}`);
    
    try {
      const process = spawn('bash', ['-c', action.command], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      
      this.runningProcesses.set(action.name, process);
      
      process.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          this.logOutput.push(`${action.category}: ${output}`);
        }
      });
      
      process.stderr?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          this.logOutput.push(`ERROR: ${output}`);
        }
      });
      
      process.on('close', (code) => {
        this.runningProcesses.delete(action.name);
        
        if (code === 0) {
          this.logOutput.push(`✓ ${action.name} completed successfully`);
        } else {
          this.logOutput.push(`✗ ${action.name} failed with code ${code}`);
        }
      });
      
    } catch (error) {
      this.logOutput.push(`Error executing ${action.name}: ${error.message}`);
    }
  }

  private toggleService(): void {
    const service = this.services[this.selectedServiceIndex];
    if (!service) return;
    
    if (service.status === 'running') {
      service.status = 'stopped';
      this.logOutput.push(`Stopped ${service.name} service`);
    } else if (service.status === 'stopped') {
      service.status = 'starting';
      this.logOutput.push(`Starting ${service.name} service...`);
      
      setTimeout(() => {
        service.status = 'running';
        service.health = 'healthy';
        this.logOutput.push(`✓ ${service.name} service started`);
      }, 2000);
    }
  }

  private refreshAll(): void {
    this.logOutput.push('Refreshing all services...');
    this.updateSystemStatus();
    this.logOutput.push('✓ System status refreshed');
  }

  private toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    this.logOutput.push(`Auto-refresh ${this.autoRefresh ? 'enabled' : 'disabled'}`);
  }

  private clearLogs(): void {
    this.logOutput = [];
  }

  private showHelp(): void {
    this.logOutput.push('=== @akaoio Unified Dashboard Help ===');
    this.logOutput.push('Views: 1-7 to switch between dashboard views');
    this.logOutput.push('Quick Actions: d=Docs, w=Watch, t=Test, b=Build, n=Network');
    this.logOutput.push('System: r=Refresh, s=Service toggle, a=Auto-refresh');
    this.logOutput.push('Navigation: ↑↓ to navigate items, Enter to select');
    this.logOutput.push('General: h=Help, c=Clear logs, q=Quit');
  }

  private quit(): void {
    // Stop all running processes
    this.runningProcesses.forEach((process, name) => {
      this.logOutput.push(`Stopping ${name}...`);
      process.kill();
    });
    
    this.screen.cleanup();
    this.keyboard.stop();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  const projectPath = process.argv[2] || process.cwd();
  
  console.log('🚀 Starting @akaoio Unified Dashboard...');
  console.log(`📁 Project: ${projectPath}`);
  console.log('💡 This dashboard manages all @akaoio core technologies');
  console.log('   • Press 1-7 to switch views');
  console.log('   • Press d,w,t,b,n for quick actions');
  console.log('   • Press h for help, q to quit\n');
  
  const dashboard = new UnifiedDashboard(projectPath);
  dashboard.start().catch(error => {
    console.error('❌ Failed to start Unified Dashboard:', error);
    process.exit(1);
  });
}

export { UnifiedDashboard };