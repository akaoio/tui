#!/usr/bin/env tsx

/**
 * @akaoio/builder TUI Monitor
 * 
 * A comprehensive build monitoring dashboard for @akaoio/builder:
 * - Live compilation progress tracking
 * - Error display and navigation
 * - Build performance metrics
 * - Mobile-optimized build monitoring
 * - File watcher integration
 * - Multi-format build support (CJS, ESM, DTS)
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

interface BuildTarget {
  format: 'cjs' | 'esm' | 'dts';
  input: string;
  output: string;
  status: 'pending' | 'building' | 'success' | 'error' | 'skipped';
  size?: number;
  duration?: number;
  error?: string;
  warnings: string[];
}

interface BuildSession {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  targets: BuildTarget[];
  totalSize: number;
  totalWarnings: number;
  totalErrors: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  mode: 'build' | 'watch' | 'dev';
  config: BuildConfig;
}

interface BuildConfig {
  entry: string[];
  outDir: string;
  formats: ('cjs' | 'esm' | 'dts')[];
  clean: boolean;
  watch: boolean;
  minify: boolean;
  sourcemap: boolean;
  external: string[];
  platform: 'node' | 'browser' | 'neutral';
}

interface FileWatchEvent {
  type: 'add' | 'change' | 'unlink';
  file: string;
  timestamp: number;
}

class BuilderMonitor {
  private screen: Screen;
  private keyboard: Keyboard;
  private keyboardHandler: UnifiedKeyboardHandler;
  private currentView: 'overview' | 'targets' | 'logs' | 'config' | 'files' | 'performance' = 'overview';
  private buildProcess: ChildProcess | null = null;
  private watchProcess: ChildProcess | null = null;
  private isBuilding = false;
  private isWatching = false;
  private projectPath: string;
  private responsiveCommands: ResponsiveCommands;
  
  // Build data
  private currentSession: BuildSession | null = null;
  private buildHistory: BuildSession[] = [];
  private config: BuildConfig;
  private buildOutput: string[] = [];
  private watchEvents: FileWatchEvent[] = [];
  private selectedTargetIndex = 0;
  private selectedLogLine = 0;
  private autoScroll = true;
  
  // UI components
  private progressBar: ProgressBar | null = null;
  private spinner: Spinner | null = null;
  
  // Performance metrics
  private buildTimes: number[] = [];
  private bundleSizes: Map<string, number[]> = new Map();
  private errorHistory: string[] = [];

  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.screen = new Screen();
    this.keyboard = new Keyboard();
    this.keyboardHandler = new UnifiedKeyboardHandler(this.keyboard);
    this.responsiveCommands = new ResponsiveCommands();

    this.setupKeyboardHandlers();
    this.loadConfiguration();
  }

  private setupKeyboardHandlers(): void {
    // Global shortcuts
    this.keyboardHandler.onKey(['ctrl+c', 'q'], () => this.quit());
    this.keyboardHandler.onKey('h', () => this.showHelp());
    
    // View navigation
    this.keyboardHandler.onKey('1', () => this.currentView = 'overview');
    this.keyboardHandler.onKey('2', () => this.currentView = 'targets');
    this.keyboardHandler.onKey('3', () => this.currentView = 'logs');
    this.keyboardHandler.onKey('4', () => this.currentView = 'config');
    this.keyboardHandler.onKey('5', () => this.currentView = 'files');
    this.keyboardHandler.onKey('6', () => this.currentView = 'performance');
    
    // Build control
    this.keyboardHandler.onKey('b', () => this.runBuild());
    this.keyboardHandler.onKey('w', () => this.toggleWatch());
    this.keyboardHandler.onKey('s', () => this.stopBuild());
    this.keyboardHandler.onKey('c', () => this.clearLogs());
    this.keyboardHandler.onKey('r', () => this.rebuild());
    
    // Navigation
    this.keyboardHandler.onKey('up', () => this.navigateUp());
    this.keyboardHandler.onKey('down', () => this.navigateDown());
    this.keyboardHandler.onKey('left', () => this.navigateLeft());
    this.keyboardHandler.onKey('right', () => this.navigateRight());
    this.keyboardHandler.onKey('enter', () => this.handleEnter());
    
    // View-specific actions
    this.keyboardHandler.onKey('d', () => this.showDetails());
    this.keyboardHandler.onKey('e', () => this.showErrors());
    this.keyboardHandler.onKey('o', () => this.openOutput());
  }

  private loadConfiguration(): void {
    try {
      // Try to load builder config
      const configFiles = [
        'builder.config.js',
        'tsup.config.js', 
        'tsup.config.ts',
        'package.json'
      ];
      
      let config: Partial<BuildConfig> = {};
      
      for (const configFile of configFiles) {
        const configPath = path.join(this.projectPath, configFile);
        if (fs.existsSync(configPath)) {
          if (configFile === 'package.json') {
            const pkg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            if (pkg.akao || pkg.tsup) {
              config = pkg.akao || pkg.tsup;
              break;
            }
          } else {
            // For JS/TS config files, we'd need proper module loading
            // This is simplified for demo purposes
            break;
          }
        }
      }
      
      // Default configuration
      this.config = {
        entry: ['src/index.ts'],
        outDir: 'dist',
        formats: ['cjs', 'esm', 'dts'],
        clean: false,
        watch: false,
        minify: false,
        sourcemap: false,
        external: [],
        platform: 'node',
        ...config
      };
    } catch (error) {
      // Use default configuration
      this.config = {
        entry: ['src/index.ts'],
        outDir: 'dist',
        formats: ['cjs', 'esm', 'dts'],
        clean: false,
        watch: false,
        minify: false,
        sourcemap: false,
        external: [],
        platform: 'node'
      };
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
      setTimeout(renderLoop, 100);
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
    const contentStartY = isMobile ? 7 : 5;
    this.screen.setCursor(0, contentStartY);
    
    switch (this.currentView) {
      case 'overview':
        this.renderOverview(width, height - contentStartY, isMobile);
        break;
      case 'targets':
        this.renderTargets(width, height - contentStartY, isMobile);
        break;
      case 'logs':
        this.renderLogs(width, height - contentStartY, isMobile);
        break;
      case 'config':
        this.renderConfig(width, height - contentStartY, isMobile);
        break;
      case 'files':
        this.renderFiles(width, height - contentStartY, isMobile);
        break;
      case 'performance':
        this.renderPerformance(width, height - contentStartY, isMobile);
        break;
    }
    
    // Footer
    this.renderFooter(width, height, isMobile);
  }

  private renderHeader(width: number, isMobile: boolean): void {
    const title = isMobile ? "Builder Monitor" : "@akaoio/builder - Build Monitoring Dashboard";
    const projectName = path.basename(this.projectPath);
    
    this.screen.write(0, 0, `${colors.cyan}${styles.bold}${title}${styles.reset}`);
    
    if (!isMobile) {
      this.screen.write(width - projectName.length - 12, 0, 
        `${colors.yellow}Project: ${projectName}${colors.reset}`);
    }
    
    // Status indicators
    const statusY = isMobile ? 1 : 1;
    let statusX = 0;
    
    if (this.isBuilding) {
      this.screen.write(statusX, statusY, `${colors.green}● Building${colors.reset}`);
      statusX += 12;
    } else {
      this.screen.write(statusX, statusY, `${colors.gray}○ Idle${colors.reset}`);
      statusX += 8;
    }
    
    if (this.isWatching) {
      this.screen.write(statusX, statusY, `${colors.blue}● Watching${colors.reset}`);
      statusX += 13;
    }
    
    // Build session info
    if (this.currentSession) {
      const session = this.currentSession;
      const duration = session.endTime ? 
        `${((session.endTime - session.startTime) / 1000).toFixed(2)}s` :
        `${((Date.now() - session.startTime) / 1000).toFixed(1)}s`;
      
      const statusY2 = statusY + 1;
      const targets = session.targets.length;
      const completed = session.targets.filter(t => t.status === 'success' || t.status === 'error').length;
      
      if (isMobile) {
        this.screen.write(0, statusY2, `${completed}/${targets} (${duration})`);
      } else {
        this.screen.write(0, statusY2, `Targets: ${completed}/${targets} | Duration: ${duration} | Errors: ${session.totalErrors}`);
      }
      
      // Progress bar for active build
      if (this.isBuilding && this.progressBar) {
        this.screen.write(0, statusY2 + 1, this.progressBar.render());
      }
    }
    
    // Draw separator
    const separatorY = this.currentSession && this.isBuilding ? statusY + 3 : statusY + 2;
    this.screen.write(0, separatorY, '─'.repeat(width));
  }

  private renderMobileNavigation(width: number): void {
    const views = [
      { key: '1', name: 'Over', view: 'overview' },
      { key: '2', name: 'Tgts', view: 'targets' },
      { key: '3', name: 'Logs', view: 'logs' },
      { key: '4', name: 'Conf', view: 'config' },
      { key: '5', name: 'File', view: 'files' },
      { key: '6', name: 'Perf', view: 'performance' }
    ];
    
    const nav1 = views.slice(0, 3).map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}]${name}${colors.reset}`;
    }).join(' ');
    
    const nav2 = views.slice(3).map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}]${name}${colors.reset}`;
    }).join(' ');
    
    this.screen.write(0, 5, nav1);
    this.screen.write(0, 6, nav2);
  }

  private renderDesktopNavigation(width: number): void {
    const views = [
      { key: '1', name: 'Overview', view: 'overview' },
      { key: '2', name: 'Build Targets', view: 'targets' },
      { key: '3', name: 'Build Logs', view: 'logs' },
      { key: '4', name: 'Configuration', view: 'config' },
      { key: '5', name: 'Files', view: 'files' },
      { key: '6', name: 'Performance', view: 'performance' }
    ];
    
    const nav = views.map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}] ${name}${colors.reset}`;
    }).join('  ');
    
    this.screen.write(0, 4, nav);
  }

  private renderOverview(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Build Overview${colors.reset}`);
    
    let y = 2;
    
    // Current session summary
    if (this.currentSession) {
      const session = this.currentSession;
      
      if (isMobile) {
        this.screen.write(0, y++, `${colors.blue}Status:${colors.reset} ${session.status}`);
        this.screen.write(0, y++, `${colors.blue}Mode:${colors.reset} ${session.mode}`);
        this.screen.write(0, y++, `${colors.blue}Targets:${colors.reset} ${session.targets.length}`);
        
        const completed = session.targets.filter(t => t.status !== 'pending').length;
        this.screen.write(0, y++, `${colors.blue}Progress:${colors.reset} ${completed}/${session.targets.length}`);
        
        if (session.totalErrors > 0) {
          this.screen.write(0, y++, `${colors.red}Errors:${colors.reset} ${session.totalErrors}`);
        }
        
        if (session.totalWarnings > 0) {
          this.screen.write(0, y++, `${colors.yellow}Warnings:${colors.reset} ${session.totalWarnings}`);
        }
      } else {
        this.screen.write(0, y++, `${colors.blue}Build Session:${colors.reset} ${session.id}`);
        this.screen.write(0, y++, `${colors.blue}Status:${colors.reset} ${session.status} | ${colors.blue}Mode:${colors.reset} ${session.mode}`);
        
        const targets = session.targets.length;
        const success = session.targets.filter(t => t.status === 'success').length;
        const errors = session.targets.filter(t => t.status === 'error').length;
        const building = session.targets.filter(t => t.status === 'building').length;
        
        this.screen.write(0, y++, `${colors.blue}Targets:${colors.reset} ${targets} total | ${colors.green}${success} success${colors.reset} | ${colors.red}${errors} errors${colors.reset} | ${colors.blue}${building} building${colors.reset}`);
        
        if (session.totalSize > 0) {
          const size = (session.totalSize / 1024).toFixed(1);
          this.screen.write(0, y++, `${colors.blue}Total Size:${colors.reset} ${size} KB`);
        }
        
        if (session.duration) {
          this.screen.write(0, y++, `${colors.blue}Duration:${colors.reset} ${(session.duration / 1000).toFixed(2)}s`);
        }
        
        if (session.totalWarnings > 0) {
          this.screen.write(0, y++, `${colors.yellow}Warnings:${colors.reset} ${session.totalWarnings}`);
        }
      }
      
      y += 2;
    }
    
    // Quick actions
    this.screen.write(0, y++, `${colors.bold}Quick Actions:${colors.reset}`);
    
    if (isMobile) {
      this.screen.write(0, y++, `${colors.cyan}[b]${colors.reset} Build`);
      this.screen.write(0, y++, `${colors.cyan}[w]${colors.reset} Watch`);
      this.screen.write(0, y++, `${colors.cyan}[s]${colors.reset} Stop`);
      this.screen.write(0, y++, `${colors.cyan}[r]${colors.reset} Rebuild`);
    } else {
      this.screen.write(0, y++, `${colors.cyan}[b]${colors.reset} Start Build  ${colors.cyan}[w]${colors.reset} Toggle Watch  ${colors.cyan}[s]${colors.reset} Stop Build  ${colors.cyan}[r]${colors.reset} Rebuild`);
      this.screen.write(0, y++, `${colors.cyan}[c]${colors.reset} Clear Logs  ${colors.cyan}[2]${colors.reset} View Targets  ${colors.cyan}[3]${colors.reset} View Logs`);
    }
    
    y += 2;
    
    // Recent build targets status
    if (this.currentSession && this.currentSession.targets.length > 0) {
      this.screen.write(0, y++, `${colors.bold}Build Targets:${colors.reset}`);
      
      const displayTargets = Math.min(this.currentSession.targets.length, height - y - 3, isMobile ? 4 : 8);
      
      for (let i = 0; i < displayTargets; i++) {
        const target = this.currentSession.targets[i];
        let status = '';
        let color = colors.gray;
        
        switch (target.status) {
          case 'pending':
            status = '○';
            color = colors.gray;
            break;
          case 'building':
            status = '●';
            color = colors.blue;
            break;
          case 'success':
            status = '✓';
            color = colors.green;
            break;
          case 'error':
            status = '✗';
            color = colors.red;
            break;
          case 'skipped':
            status = '~';
            color = colors.yellow;
            break;
        }
        
        if (isMobile) {
          const format = target.format.toUpperCase();
          this.screen.write(0, y++, `${color}${status}${colors.reset} ${format}`);
        } else {
          const size = target.size ? ` (${(target.size / 1024).toFixed(1)}KB)` : '';
          const duration = target.duration ? ` - ${target.duration}ms` : '';
          this.screen.write(0, y++, `${color}${status}${colors.reset} ${target.format}: ${path.basename(target.output)}${size}${duration}`);
        }
      }
      
      if (this.currentSession.targets.length > displayTargets) {
        this.screen.write(0, y++, `${colors.gray}... and ${this.currentSession.targets.length - displayTargets} more targets${colors.reset}`);
      }
    }
    
    // Build history summary
    if (this.buildHistory.length > 0 && !isMobile && y < height - 5) {
      y += 2;
      this.screen.write(0, y++, `${colors.bold}Recent Builds:${colors.reset}`);
      
      const recent = this.buildHistory.slice(-3);
      recent.forEach(build => {
        const duration = build.duration ? `${(build.duration / 1000).toFixed(1)}s` : 'N/A';
        const status = build.status === 'completed' ? 
          (build.totalErrors > 0 ? `${colors.yellow}completed with errors` : `${colors.green}success`) :
          `${colors.red}${build.status}`;
        
        this.screen.write(2, y++, `${status}${colors.reset} - ${duration} (${build.targets.length} targets)`);
      });
    }
  }

  private renderTargets(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Build Targets${colors.reset}`);
    
    if (!this.currentSession || this.currentSession.targets.length === 0) {
      this.screen.write(0, 2, `${colors.yellow}No build targets${colors.reset}`);
      this.screen.write(0, 3, `${colors.blue}Tip:${colors.reset} Run a build to see targets here`);
      return;
    }
    
    let y = 2;
    const targets = this.currentSession.targets;
    const maxDisplay = Math.min(targets.length, height - 5);
    
    for (let i = 0; i < maxDisplay; i++) {
      const target = targets[i];
      const isSelected = i === this.selectedTargetIndex;
      
      let status = '';
      let color = colors.gray;
      
      switch (target.status) {
        case 'pending':
          status = '○';
          break;
        case 'building':
          status = '●';
          color = colors.blue;
          break;
        case 'success':
          status = '✓';
          color = colors.green;
          break;
        case 'error':
          status = '✗';
          color = colors.red;
          break;
        case 'skipped':
          status = '~';
          color = colors.yellow;
          break;
      }
      
      const prefix = isSelected ? `${colors.bgWhite}${colors.black}>` : ' ';
      const resetColor = isSelected ? colors.reset + colors.bgWhite + colors.black : colors.reset;
      
      if (isMobile) {
        const format = target.format.toUpperCase();
        this.screen.write(0, y++, `${prefix}${color}${status}${resetColor} ${format}${colors.reset}`);
        
        if (isSelected) {
          if (target.size) {
            this.screen.write(2, y++, `${colors.gray}${(target.size / 1024).toFixed(1)}KB${colors.reset}`);
          }
          if (target.error && y < height - 3) {
            let error = target.error;
            if (error.length > width - 4) {
              error = error.substring(0, width - 7) + '...';
            }
            this.screen.write(2, y++, `${colors.red}${error}${colors.reset}`);
          }
        }
      } else {
        const size = target.size ? ` (${(target.size / 1024).toFixed(1)}KB)` : '';
        const duration = target.duration ? ` - ${target.duration}ms` : '';
        const warnings = target.warnings.length > 0 ? ` - ${target.warnings.length} warnings` : '';
        
        this.screen.write(0, y++, 
          `${prefix}${color}${status}${resetColor} ${target.format}: ${path.basename(target.output)}${size}${duration}${warnings}${colors.reset}`);
      }
    }
    
    if (targets.length > maxDisplay) {
      this.screen.write(0, y++, `${colors.gray}... and ${targets.length - maxDisplay} more targets${colors.reset}`);
    }
    
    // Selected target details
    if (this.selectedTargetIndex < targets.length && !isMobile && y < height - 3) {
      const target = targets[this.selectedTargetIndex];
      y += 2;
      this.screen.write(0, y++, `${colors.bold}Selected Target: ${target.format}${colors.reset}`);
      this.screen.write(0, y++, `${colors.blue}Input:${colors.reset} ${target.input}`);
      this.screen.write(0, y++, `${colors.blue}Output:${colors.reset} ${target.output}`);
      this.screen.write(0, y++, `${colors.blue}Status:${colors.reset} ${target.status}`);
      
      if (target.size) {
        this.screen.write(0, y++, `${colors.blue}Size:${colors.reset} ${(target.size / 1024).toFixed(1)} KB`);
      }
      
      if (target.duration) {
        this.screen.write(0, y++, `${colors.blue}Duration:${colors.reset} ${target.duration}ms`);
      }
      
      if (target.warnings.length > 0 && y < height - 2) {
        this.screen.write(0, y++, `${colors.yellow}Warnings:${colors.reset} ${target.warnings.length}`);
        target.warnings.slice(0, 2).forEach(warning => {
          if (y < height - 1) {
            this.screen.write(2, y++, `${colors.yellow}• ${warning}${colors.reset}`);
          }
        });
      }
      
      if (target.error && y < height - 1) {
        this.screen.write(0, y++, `${colors.red}Error:${colors.reset}`);
        let error = target.error;
        if (error.length > width - 2) {
          error = error.substring(0, width - 5) + '...';
        }
        this.screen.write(2, y++, `${colors.red}${error}${colors.reset}`);
      }
    }
  }

  private renderLogs(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Build Logs${colors.reset}`);
    
    if (this.buildOutput.length === 0) {
      this.screen.write(0, 2, `${colors.gray}No build output${colors.reset}`);
      this.screen.write(0, 3, `${colors.blue}Tip:${colors.reset} Start a build to see logs here`);
      return;
    }
    
    let y = 2;
    const maxLines = height - 4;
    const startIndex = this.autoScroll ? 
      Math.max(0, this.buildOutput.length - maxLines) : 
      Math.max(0, this.selectedLogLine - Math.floor(maxLines / 2));
    const endIndex = Math.min(this.buildOutput.length, startIndex + maxLines);
    
    for (let i = startIndex; i < endIndex; i++) {
      if (y >= height - 2) break;
      
      let line = this.buildOutput[i];
      if (line.length > width - 1) {
        line = line.substring(0, width - 4) + '...';
      }
      
      // Color code log lines
      let color = colors.gray;
      if (line.includes('ERROR') || line.includes('✗') || line.includes('error:')) {
        color = colors.red;
      } else if (line.includes('WARN') || line.includes('warning:')) {
        color = colors.yellow;
      } else if (line.includes('✓') || line.includes('success') || line.includes('Built')) {
        color = colors.green;
      } else if (line.includes('Building') || line.includes('Bundling')) {
        color = colors.blue;
      }
      
      // Highlight selected line (non-mobile)
      if (!isMobile && !this.autoScroll && i === this.selectedLogLine) {
        this.screen.write(0, y++, `${colors.bgWhite}${colors.black}${line}${colors.reset}`);
      } else {
        this.screen.write(0, y++, `${color}${line}${colors.reset}`);
      }
    }
    
    // Scroll indicator
    if (this.buildOutput.length > maxLines) {
      const scrollInfo = this.autoScroll ? 
        `[Auto] ${endIndex}/${this.buildOutput.length}` :
        `${startIndex + 1}-${endIndex}/${this.buildOutput.length}`;
      
      const infoY = height - 2;
      this.screen.write(width - scrollInfo.length - 1, infoY, 
        `${colors.blue}${scrollInfo}${colors.reset}`);
    }
    
    if (!isMobile && !this.autoScroll) {
      const help = "↑↓ Navigate, [a] Auto-scroll";
      this.screen.write(0, height - 2, `${colors.gray}${help}${colors.reset}`);
    }
  }

  private renderConfig(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Build Configuration${colors.reset}`);
    
    let y = 2;
    
    // Entry points
    this.screen.write(0, y++, `${colors.blue}Entry Points:${colors.reset}`);
    this.config.entry.forEach(entry => {
      this.screen.write(2, y++, `• ${entry}`);
    });
    
    y++;
    
    // Output configuration
    this.screen.write(0, y++, `${colors.blue}Output:${colors.reset}`);
    this.screen.write(2, y++, `Directory: ${this.config.outDir}`);
    this.screen.write(2, y++, `Formats: ${this.config.formats.join(', ')}`);
    this.screen.write(2, y++, `Platform: ${this.config.platform}`);
    
    y++;
    
    // Build options
    this.screen.write(0, y++, `${colors.blue}Options:${colors.reset}`);
    this.screen.write(2, y++, `${this.config.clean ? colors.green + '●' : colors.gray + '○'} Clean build${colors.reset}`);
    this.screen.write(2, y++, `${this.config.watch ? colors.green + '●' : colors.gray + '○'} Watch mode${colors.reset}`);
    this.screen.write(2, y++, `${this.config.minify ? colors.green + '●' : colors.gray + '○'} Minification${colors.reset}`);
    this.screen.write(2, y++, `${this.config.sourcemap ? colors.green + '●' : colors.gray + '○'} Source maps${colors.reset}`);
    
    if (this.config.external.length > 0) {
      y++;
      this.screen.write(0, y++, `${colors.blue}External Dependencies:${colors.reset}`);
      this.config.external.forEach(ext => {
        if (y < height - 3) {
          this.screen.write(2, y++, `• ${ext}`);
        }
      });
    }
    
    if (!isMobile && y < height - 5) {
      y += 2;
      this.screen.write(0, y++, `${colors.blue}Project Information:${colors.reset}`);
      this.screen.write(2, y++, `Path: ${this.projectPath}`);
      
      // Check if package.json exists
      const pkgPath = path.join(this.projectPath, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          this.screen.write(2, y++, `Package: ${pkg.name || 'unnamed'} v${pkg.version || '0.0.0'}`);
        } catch (error) {
          // Ignore JSON parse errors
        }
      }
    }
  }

  private renderFiles(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Project Files${colors.reset}`);
    
    let y = 2;
    
    try {
      // Show source files
      this.screen.write(0, y++, `${colors.blue}Source Files:${colors.reset}`);
      
      const srcDir = path.join(this.projectPath, 'src');
      if (fs.existsSync(srcDir)) {
        this.showDirectory(srcDir, 1, 2, width, height, y, isMobile);
        y += 5; // Approximate
      } else {
        this.screen.write(2, y++, `${colors.yellow}No src directory found${colors.reset}`);
        y++;
      }
      
      // Show output files
      if (y < height - 8) {
        this.screen.write(0, y++, `${colors.blue}Output Files:${colors.reset}`);
        
        const outDir = path.join(this.projectPath, this.config.outDir);
        if (fs.existsSync(outDir)) {
          this.showDirectory(outDir, 1, 2, width, height, y, isMobile);
        } else {
          this.screen.write(2, y++, `${colors.gray}No output files yet${colors.reset}`);
        }
      }
      
    } catch (error) {
      this.screen.write(0, y++, `${colors.red}Error reading files: ${error.message}${colors.reset}`);
    }
  }

  private showDirectory(dirPath: string, indent: number, maxDepth: number, width: number, height: number, startY: number, isMobile: boolean): number {
    let y = startY;
    
    if (indent > maxDepth || y >= height - 3) return y;
    
    try {
      const items = fs.readdirSync(dirPath)
        .filter(item => !item.startsWith('.'))
        .sort();
      
      for (const item of items) {
        if (y >= height - 3) break;
        
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        const isDir = stats.isDirectory();
        
        const prefix = '  '.repeat(indent);
        const icon = isDir ? '📁' : '📄';
        let name = item;
        
        if (isMobile && name.length > width - 8 - (indent * 2)) {
          name = name.substring(0, width - 11 - (indent * 2)) + '...';
        }
        
        let line = `${prefix}${icon} ${name}`;
        
        if (!isMobile && !isDir) {
          const size = (stats.size / 1024).toFixed(1);
          line += ` ${colors.gray}(${size}KB)${colors.reset}`;
        }
        
        this.screen.write(0, y++, line);
        
        if (isDir && indent < maxDepth) {
          y = this.showDirectory(itemPath, indent + 1, maxDepth, width, height, y, isMobile);
        }
      }
    } catch (error) {
      // Ignore directory read errors
    }
    
    return y;
  }

  private renderPerformance(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Build Performance${colors.reset}`);
    
    let y = 2;
    
    // Build time statistics
    if (this.buildTimes.length > 0) {
      const avgTime = this.buildTimes.reduce((sum, time) => sum + time, 0) / this.buildTimes.length;
      const minTime = Math.min(...this.buildTimes);
      const maxTime = Math.max(...this.buildTimes);
      
      this.screen.write(0, y++, `${colors.blue}Build Times:${colors.reset}`);
      
      if (isMobile) {
        this.screen.write(2, y++, `Avg: ${(avgTime / 1000).toFixed(2)}s`);
        this.screen.write(2, y++, `Min: ${(minTime / 1000).toFixed(2)}s`);
        this.screen.write(2, y++, `Max: ${(maxTime / 1000).toFixed(2)}s`);
      } else {
        this.screen.write(2, y++, `Average: ${(avgTime / 1000).toFixed(2)}s | Min: ${(minTime / 1000).toFixed(2)}s | Max: ${(maxTime / 1000).toFixed(2)}s`);
        this.screen.write(2, y++, `Total Builds: ${this.buildTimes.length}`);
      }
      
      y++;
    }
    
    // Bundle size trends
    if (this.bundleSizes.size > 0) {
      this.screen.write(0, y++, `${colors.blue}Bundle Sizes:${colors.reset}`);
      
      for (const [format, sizes] of this.bundleSizes.entries()) {
        if (y >= height - 4) break;
        
        const latestSize = sizes[sizes.length - 1];
        const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
        
        if (isMobile) {
          this.screen.write(2, y++, `${format.toUpperCase()}: ${(latestSize / 1024).toFixed(1)}KB`);
        } else {
          this.screen.write(2, y++, `${format.toUpperCase()}: ${(latestSize / 1024).toFixed(1)}KB (avg: ${(avgSize / 1024).toFixed(1)}KB)`);
        }
      }
      
      y++;
    }
    
    // Recent errors
    if (this.errorHistory.length > 0) {
      this.screen.write(0, y++, `${colors.red}Recent Errors:${colors.reset}`);
      
      const recentErrors = this.errorHistory.slice(-5);
      recentErrors.forEach(error => {
        if (y >= height - 2) return;
        
        let errorText = error;
        if (isMobile && errorText.length > width - 4) {
          errorText = errorText.substring(0, width - 7) + '...';
        }
        
        this.screen.write(2, y++, `${colors.red}• ${errorText}${colors.reset}`);
      });
    }
    
    // Watch events (if watching)
    if (this.isWatching && this.watchEvents.length > 0 && y < height - 5) {
      this.screen.write(0, y++, `${colors.blue}Recent File Changes:${colors.reset}`);
      
      const recentEvents = this.watchEvents.slice(-5);
      recentEvents.forEach(event => {
        if (y >= height - 2) return;
        
        const time = new Date(event.timestamp).toLocaleTimeString();
        const icon = event.type === 'change' ? '✎' : event.type === 'add' ? '+' : '✗';
        let fileName = path.basename(event.file);
        
        if (isMobile && fileName.length > width - 15) {
          fileName = fileName.substring(0, width - 18) + '...';
        }
        
        this.screen.write(2, y++, `${colors.gray}${time}${colors.reset} ${icon} ${fileName}`);
      });
    }
  }

  private renderFooter(width: number, height: number, isMobile: boolean): void {
    const footerY = height - 1;
    
    let commands;
    if (isMobile) {
      commands = this.responsiveCommands.getCommands(width, [
        { key: 'h', desc: 'Help' },
        { key: 'q', desc: 'Quit' },
        { key: 'b', desc: 'Build' },
        { key: 'w', desc: 'Watch' }
      ]);
    } else {
      commands = this.responsiveCommands.getCommands(width, [
        { key: 'h', desc: 'Help' },
        { key: 'b', desc: 'Build' },
        { key: 'w', desc: 'Watch' },
        { key: 's', desc: 'Stop' },
        { key: 'r', desc: 'Rebuild' },
        { key: '↑↓', desc: 'Navigate' },
        { key: 'q', desc: 'Quit' }
      ]);
    }
    
    this.screen.write(0, footerY, `${colors.blue}${commands}${colors.reset}`);
  }

  // Navigation methods
  private navigateUp(): void {
    if (this.currentView === 'targets') {
      this.selectedTargetIndex = Math.max(0, this.selectedTargetIndex - 1);
    } else if (this.currentView === 'logs' && !this.autoScroll) {
      this.selectedLogLine = Math.max(0, this.selectedLogLine - 1);
    }
  }

  private navigateDown(): void {
    if (this.currentView === 'targets' && this.currentSession) {
      this.selectedTargetIndex = Math.min(this.currentSession.targets.length - 1, this.selectedTargetIndex + 1);
    } else if (this.currentView === 'logs' && !this.autoScroll) {
      this.selectedLogLine = Math.min(this.buildOutput.length - 1, this.selectedLogLine + 1);
    }
  }

  private navigateLeft(): void {
    // Could be used for horizontal navigation
  }

  private navigateRight(): void {
    // Could be used for horizontal navigation
  }

  private handleEnter(): void {
    if (this.currentView === 'targets' && this.currentSession) {
      const target = this.currentSession.targets[this.selectedTargetIndex];
      if (target) {
        this.showTargetDetails(target);
      }
    }
  }

  // Build control methods
  private async runBuild(): Promise<void> {
    if (this.isBuilding) return;
    
    this.isBuilding = true;
    this.createNewBuildSession('build');
    
    try {
      this.buildProcess = spawn('akao-build', [], {
        cwd: this.projectPath,
        stdio: 'pipe',
        shell: true
      });
      
      this.spinner = new Spinner('Building...');
      this.spinner.start();
      
      // Create progress bar
      if (this.currentSession) {
        this.progressBar = new ProgressBar(0, this.currentSession.targets.length);
      }
      
      this.buildProcess.stdout?.on('data', (data) => {
        this.handleBuildOutput(data.toString());
      });
      
      this.buildProcess.stderr?.on('data', (data) => {
        this.handleBuildOutput(data.toString(), true);
      });
      
      this.buildProcess.on('close', (code) => {
        this.handleBuildComplete(code || 0);
      });
      
    } catch (error) {
      this.buildOutput.push(`Build failed to start: ${error.message}`);
      this.isBuilding = false;
      this.spinner?.stop();
      this.spinner = null;
    }
  }

  private createNewBuildSession(mode: 'build' | 'watch' | 'dev'): void {
    const sessionId = `${mode}_${Date.now()}`;
    
    // Create targets based on configuration
    const targets: BuildTarget[] = [];
    this.config.entry.forEach(entry => {
      this.config.formats.forEach(format => {
        const ext = format === 'dts' ? '.d.ts' : format === 'cjs' ? '.js' : '.mjs';
        const output = path.join(this.config.outDir, `${path.basename(entry, path.extname(entry))}${ext}`);
        
        targets.push({
          format,
          input: entry,
          output,
          status: 'pending',
          warnings: []
        });
      });
    });
    
    this.currentSession = {
      id: sessionId,
      startTime: Date.now(),
      targets,
      totalSize: 0,
      totalWarnings: 0,
      totalErrors: 0,
      status: 'running',
      mode,
      config: { ...this.config }
    };
  }

  private handleBuildOutput(output: string, isError = false): void {
    const lines = output.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      this.buildOutput.push(isError ? `ERROR: ${line}` : line);
      
      // Parse build progress and update targets
      this.parseBuildProgress(line, isError);
    });
  }

  private parseBuildProgress(line: string, isError: boolean): void {
    if (!this.currentSession) return;
    
    // Simple parsing - in real implementation would be more sophisticated
    if (line.includes('Built') || line.includes('Generated')) {
      // Target completed successfully
      const target = this.currentSession.targets.find(t => t.status === 'building');
      if (target) {
        target.status = 'success';
        this.updateProgressBar();
      }
    } else if (line.includes('Building') || line.includes('Bundling')) {
      // Target started building
      const target = this.currentSession.targets.find(t => t.status === 'pending');
      if (target) {
        target.status = 'building';
      }
    } else if (isError || line.includes('Error') || line.includes('error:')) {
      // Build error
      const target = this.currentSession.targets.find(t => t.status === 'building');
      if (target) {
        target.status = 'error';
        target.error = line;
        this.currentSession.totalErrors++;
        this.errorHistory.push(line);
        this.updateProgressBar();
      }
    } else if (line.includes('warning:') || line.includes('Warning')) {
      // Build warning
      const target = this.currentSession.targets.find(t => t.status === 'building');
      if (target) {
        target.warnings.push(line);
        this.currentSession.totalWarnings++;
      }
    }
  }

  private updateProgressBar(): void {
    if (!this.progressBar || !this.currentSession) return;
    
    const completed = this.currentSession.targets.filter(t => 
      t.status === 'success' || t.status === 'error' || t.status === 'skipped'
    ).length;
    
    this.progressBar.setProgress(completed);
  }

  private handleBuildComplete(exitCode: number): void {
    this.isBuilding = false;
    this.spinner?.stop();
    this.spinner = null;
    this.progressBar = null;
    this.buildProcess = null;
    
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
      this.currentSession.status = exitCode === 0 ? 'completed' : 'failed';
      
      // Calculate total sizes and update metrics
      this.updateBuildMetrics();
      
      // Add to build history
      this.buildHistory.push({ ...this.currentSession });
      if (this.buildHistory.length > 10) {
        this.buildHistory.shift();
      }
    }
    
    if (exitCode === 0) {
      this.buildOutput.push('✓ Build completed successfully');
    } else {
      this.buildOutput.push(`✗ Build failed with exit code ${exitCode}`);
    }
  }

  private updateBuildMetrics(): void {
    if (!this.currentSession) return;
    
    // Record build time
    if (this.currentSession.duration) {
      this.buildTimes.push(this.currentSession.duration);
      if (this.buildTimes.length > 20) {
        this.buildTimes.shift();
      }
    }
    
    // Record bundle sizes
    this.currentSession.targets.forEach(target => {
      if (target.status === 'success' && target.size) {
        if (!this.bundleSizes.has(target.format)) {
          this.bundleSizes.set(target.format, []);
        }
        const sizes = this.bundleSizes.get(target.format)!;
        sizes.push(target.size);
        if (sizes.length > 20) {
          sizes.shift();
        }
      }
    });
  }

  private async toggleWatch(): Promise<void> {
    if (this.isWatching) {
      this.stopWatch();
    } else {
      this.startWatch();
    }
  }

  private async startWatch(): Promise<void> {
    if (this.isWatching || this.isBuilding) return;
    
    this.isWatching = true;
    this.createNewBuildSession('watch');
    
    try {
      this.watchProcess = spawn('akao-build', ['--watch'], {
        cwd: this.projectPath,
        stdio: 'pipe',
        shell: true
      });
      
      this.buildOutput.push('Started watching for changes...');
      
      this.watchProcess.stdout?.on('data', (data) => {
        this.handleBuildOutput(data.toString());
      });
      
      this.watchProcess.stderr?.on('data', (data) => {
        this.handleBuildOutput(data.toString(), true);
      });
      
      this.watchProcess.on('close', (code) => {
        this.isWatching = false;
        this.watchProcess = null;
        this.buildOutput.push(`Watch stopped (exit code ${code})`);
      });
      
    } catch (error) {
      this.buildOutput.push(`Watch failed to start: ${error.message}`);
      this.isWatching = false;
    }
  }

  private stopWatch(): void {
    if (this.watchProcess) {
      this.watchProcess.kill();
      this.watchProcess = null;
    }
    this.isWatching = false;
    this.buildOutput.push('Watch mode stopped');
  }

  private stopBuild(): void {
    if (this.buildProcess) {
      this.buildProcess.kill();
      this.buildOutput.push('Build stopped by user');
    }
    if (this.watchProcess) {
      this.stopWatch();
    }
  }

  private clearLogs(): void {
    this.buildOutput = [];
  }

  private async rebuild(): Promise<void> {
    if (this.isBuilding || this.isWatching) {
      this.stopBuild();
      // Wait a moment before rebuilding
      setTimeout(() => this.runBuild(), 500);
    } else {
      await this.runBuild();
    }
  }

  private showTargetDetails(target: BuildTarget): void {
    this.buildOutput.push(`=== Target Details: ${target.format} ===`);
    this.buildOutput.push(`Input: ${target.input}`);
    this.buildOutput.push(`Output: ${target.output}`);
    this.buildOutput.push(`Status: ${target.status}`);
    
    if (target.size) {
      this.buildOutput.push(`Size: ${(target.size / 1024).toFixed(1)} KB`);
    }
    
    if (target.duration) {
      this.buildOutput.push(`Duration: ${target.duration}ms`);
    }
    
    if (target.warnings.length > 0) {
      this.buildOutput.push(`Warnings:`);
      target.warnings.forEach(warning => {
        this.buildOutput.push(`  - ${warning}`);
      });
    }
    
    if (target.error) {
      this.buildOutput.push(`Error: ${target.error}`);
    }
  }

  private showDetails(): void {
    if (this.currentView === 'targets' && this.currentSession) {
      const target = this.currentSession.targets[this.selectedTargetIndex];
      if (target) {
        this.showTargetDetails(target);
        this.currentView = 'logs';
      }
    }
  }

  private showErrors(): void {
    this.buildOutput.push('=== Recent Errors ===');
    if (this.errorHistory.length === 0) {
      this.buildOutput.push('No errors recorded');
    } else {
      this.errorHistory.slice(-10).forEach((error, index) => {
        this.buildOutput.push(`${index + 1}. ${error}`);
      });
    }
    this.currentView = 'logs';
  }

  private openOutput(): void {
    if (this.currentSession) {
      const outDir = path.join(this.projectPath, this.config.outDir);
      this.buildOutput.push(`Output directory: ${outDir}`);
      // In real implementation, could open file explorer or editor
    }
  }

  private showHelp(): void {
    this.buildOutput.push('=== Builder Monitor Help ===');
    this.buildOutput.push('Views: 1-6 to switch views');
    this.buildOutput.push('Build: [b] Build, [w] Watch, [s] Stop, [r] Rebuild');
    this.buildOutput.push('Navigation: ↑↓ to navigate, Enter to select');
    this.buildOutput.push('Actions: [d] Details, [e] Errors, [o] Open output');
    this.buildOutput.push('General: [c] Clear logs, [h] Help, [q] Quit');
  }

  private quit(): void {
    this.stopBuild();
    this.spinner?.stop();
    this.screen.cleanup();
    this.keyboard.stop();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  const projectPath = process.argv[2] || process.cwd();
  const monitor = new BuilderMonitor(projectPath);
  
  console.log('Starting Builder Monitor...');
  monitor.start().catch(error => {
    console.error('Failed to start Builder Monitor:', error);
    process.exit(1);
  });
}

export { BuilderMonitor };