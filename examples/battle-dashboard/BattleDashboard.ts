#!/usr/bin/env tsx

/**
 * @akaoio/battle TUI Dashboard
 * 
 * A comprehensive dashboard for monitoring @akaoio/battle test execution:
 * - Real-time test execution monitoring
 * - Visual test results with replay controls  
 * - Mobile-optimized test runner interface
 * - Live test statistics and performance metrics
 * - Interactive test selection and filtering
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

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  screenshot?: string;
  replay?: string;
  startTime?: number;
  endTime?: number;
}

interface TestSuite {
  name: string;
  file: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  passed: number;
  failed: number;
  skipped: number;
}

interface TestRunStatistics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalSuites: number;
  completedSuites: number;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class BattleDashboard {
  private screen: Screen;
  private keyboard: Keyboard;
  private keyboardHandler: UnifiedKeyboardHandler;
  private currentView: 'overview' | 'suites' | 'tests' | 'results' | 'config' | 'logs' = 'overview';
  private testProcess: ChildProcess | null = null;
  private isRunning = false;
  private projectPath: string;
  private responsiveCommands: ResponsiveCommands;
  
  // Test data
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;
  private selectedTest: TestResult | null = null;
  private statistics: TestRunStatistics = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    totalSuites: 0,
    completedSuites: 0,
    startTime: Date.now()
  };
  
  // UI components
  private progressBar: ProgressBar | null = null;
  private spinner: Spinner | null = null;
  private logOutput: string[] = [];
  private selectedSuiteIndex = 0;
  private selectedTestIndex = 0;
  private autoScroll = true;
  
  // Configuration
  private testPatterns: string[] = ['**/*.test.ts', '**/*.battle.test.ts'];
  private selectedPattern = 0;
  private watchMode = false;
  private verbose = false;
  private coverage = false;

  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.screen = new Screen();
    this.keyboard = new Keyboard();
    this.keyboardHandler = new UnifiedKeyboardHandler(this.keyboard);
    this.responsiveCommands = new ResponsiveCommands();

    this.setupKeyboardHandlers();
    this.discoverTestFiles();
  }

  private setupKeyboardHandlers(): void {
    // Global shortcuts
    this.keyboardHandler.onKey(['ctrl+c', 'q'], () => this.quit());
    this.keyboardHandler.onKey('h', () => this.showHelp());
    
    // View navigation
    this.keyboardHandler.onKey('1', () => this.currentView = 'overview');
    this.keyboardHandler.onKey('2', () => this.currentView = 'suites');
    this.keyboardHandler.onKey('3', () => this.currentView = 'tests');
    this.keyboardHandler.onKey('4', () => this.currentView = 'results');
    this.keyboardHandler.onKey('5', () => this.currentView = 'config');
    this.keyboardHandler.onKey('6', () => this.currentView = 'logs');
    
    // Test execution
    this.keyboardHandler.onKey('r', () => this.runTests());
    this.keyboardHandler.onKey('s', () => this.stopTests());
    this.keyboardHandler.onKey('w', () => this.toggleWatch());
    this.keyboardHandler.onKey('c', () => this.clearResults());
    
    // Navigation
    this.keyboardHandler.onKey('up', () => this.navigateUp());
    this.keyboardHandler.onKey('down', () => this.navigateDown());
    this.keyboardHandler.onKey('left', () => this.navigateLeft());
    this.keyboardHandler.onKey('right', () => this.navigateRight());
    this.keyboardHandler.onKey('enter', () => this.handleEnter());
    this.keyboardHandler.onKey('space', () => this.handleSpace());
    
    // Test-specific actions
    this.keyboardHandler.onKey('p', () => this.showReplay());
    this.keyboardHandler.onKey('t', () => this.toggleVerbose());
    this.keyboardHandler.onKey('v', () => this.showScreenshot());
  }

  private discoverTestFiles(): void {
    try {
      // Discover test files in project
      const testFiles = this.findTestFiles(this.projectPath);
      
      this.suites = testFiles.map(file => ({
        name: path.basename(file, path.extname(file)),
        file: file,
        tests: this.extractTestsFromFile(file),
        status: 'pending' as const,
        passed: 0,
        failed: 0,
        skipped: 0
      }));

      this.updateStatistics();
    } catch (error) {
      this.logOutput.push(`Error discovering tests: ${error.message}`);
    }
  }

  private findTestFiles(dir: string, files: string[] = []): string[] {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          this.findTestFiles(itemPath, files);
        } else if (item.match(/\.(test|battle\.test)\.tsx?$/)) {
          files.push(itemPath);
        }
      }
    } catch (error) {
      // Ignore directory access errors
    }
    
    return files;
  }

  private extractTestsFromFile(filePath: string): TestResult[] {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const tests: TestResult[] = [];
      
      // Simple regex to find test cases
      const testMatches = content.match(/(?:test|it)\s*\(\s*['"`]([^'"`]+)['"`]/g);
      
      if (testMatches) {
        testMatches.forEach((match, index) => {
          const nameMatch = match.match(/['"`]([^'"`]+)['"`]/);
          if (nameMatch) {
            tests.push({
              id: `${path.basename(filePath)}_${index}`,
              name: nameMatch[1],
              status: 'pending'
            });
          }
        });
      }
      
      return tests;
    } catch (error) {
      return [];
    }
  }

  private updateStatistics(): void {
    this.statistics.totalSuites = this.suites.length;
    this.statistics.totalTests = this.suites.reduce((sum, suite) => sum + suite.tests.length, 0);
    this.statistics.passedTests = this.suites.reduce((sum, suite) => sum + suite.passed, 0);
    this.statistics.failedTests = this.suites.reduce((sum, suite) => sum + suite.failed, 0);
    this.statistics.skippedTests = this.suites.reduce((sum, suite) => sum + suite.skipped, 0);
    this.statistics.completedSuites = this.suites.filter(s => s.status === 'completed').length;
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
      case 'suites':
        this.renderSuites(width, height - contentStartY, isMobile);
        break;
      case 'tests':
        this.renderTests(width, height - contentStartY, isMobile);
        break;
      case 'results':
        this.renderResults(width, height - contentStartY, isMobile);
        break;
      case 'config':
        this.renderConfig(width, height - contentStartY, isMobile);
        break;
      case 'logs':
        this.renderLogs(width, height - contentStartY, isMobile);
        break;
    }
    
    // Footer
    this.renderFooter(width, height, isMobile);
  }

  private renderHeader(width: number, isMobile: boolean): void {
    const title = isMobile ? "Battle Dashboard" : "@akaoio/battle - Test Execution Dashboard";
    const projectName = path.basename(this.projectPath);
    
    this.screen.write(0, 0, `${colors.cyan}${styles.bold}${title}${styles.reset}`);
    
    if (!isMobile) {
      this.screen.write(width - projectName.length - 12, 0, 
        `${colors.yellow}Project: ${projectName}${colors.reset}`);
    }
    
    // Status indicators
    const statusY = isMobile ? 1 : 1;
    let statusX = 0;
    
    if (this.isRunning) {
      this.screen.write(statusX, statusY, `${colors.green}● Running${colors.reset}`);
      statusX += 12;
    } else {
      this.screen.write(statusX, statusY, `${colors.gray}○ Idle${colors.reset}`);
      statusX += 8;
    }
    
    if (this.watchMode) {
      this.screen.write(statusX, statusY, `${colors.blue}● Watch${colors.reset}`);
      statusX += 10;
    }
    
    if (this.verbose) {
      this.screen.write(statusX, statusY, `${colors.magenta}● Verbose${colors.reset}`);
    }
    
    // Test statistics bar
    const statsY = statusY + 1;
    if (this.statistics.totalTests > 0) {
      const passRate = Math.round((this.statistics.passedTests / this.statistics.totalTests) * 100);
      const stats = isMobile ? 
        `${this.statistics.passedTests}/${this.statistics.totalTests} (${passRate}%)` :
        `Tests: ${this.statistics.passedTests}/${this.statistics.totalTests} passed (${passRate}%) | Suites: ${this.statistics.completedSuites}/${this.statistics.totalSuites}`;
      
      const color = passRate >= 80 ? colors.green : passRate >= 60 ? colors.yellow : colors.red;
      this.screen.write(0, statsY, `${color}${stats}${colors.reset}`);
    }
    
    // Progress bar for running tests
    if (this.isRunning && this.progressBar) {
      const progressY = statsY + 1;
      this.screen.write(0, progressY, this.progressBar.render());
    }
    
    // Draw separator
    const separatorY = this.isRunning ? statsY + 2 : statsY + 1;
    this.screen.write(0, separatorY, '─'.repeat(width));
  }

  private renderMobileNavigation(width: number): void {
    const views = [
      { key: '1', name: 'Over', view: 'overview' },
      { key: '2', name: 'Suit', view: 'suites' },
      { key: '3', name: 'Test', view: 'tests' },
      { key: '4', name: 'Rslt', view: 'results' },
      { key: '5', name: 'Conf', view: 'config' },
      { key: '6', name: 'Logs', view: 'logs' }
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
      { key: '2', name: 'Test Suites', view: 'suites' },
      { key: '3', name: 'Test Cases', view: 'tests' },
      { key: '4', name: 'Results', view: 'results' },
      { key: '5', name: 'Config', view: 'config' },
      { key: '6', name: 'Logs', view: 'logs' }
    ];
    
    const nav = views.map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}] ${name}${colors.reset}`;
    }).join('  ');
    
    this.screen.write(0, 4, nav);
  }

  private renderOverview(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Test Execution Overview${colors.reset}`);
    
    let y = 2;
    
    // Quick statistics
    if (isMobile) {
      this.screen.write(0, y++, `${colors.blue}Suites:${colors.reset} ${this.statistics.totalSuites}`);
      this.screen.write(0, y++, `${colors.blue}Tests:${colors.reset} ${this.statistics.totalTests}`);
      this.screen.write(0, y++, `${colors.green}Passed:${colors.reset} ${this.statistics.passedTests}`);
      this.screen.write(0, y++, `${colors.red}Failed:${colors.reset} ${this.statistics.failedTests}`);
      if (this.statistics.skippedTests > 0) {
        this.screen.write(0, y++, `${colors.yellow}Skipped:${colors.reset} ${this.statistics.skippedTests}`);
      }
    } else {
      this.screen.write(0, y++, `${colors.blue}Test Suites:${colors.reset} ${this.statistics.totalSuites} total, ${this.statistics.completedSuites} completed`);
      this.screen.write(0, y++, `${colors.blue}Test Cases:${colors.reset} ${this.statistics.totalTests} total`);
      this.screen.write(0, y++, `${colors.green}Passed:${colors.reset} ${this.statistics.passedTests} | ${colors.red}Failed:${colors.reset} ${this.statistics.failedTests} | ${colors.yellow}Skipped:${colors.reset} ${this.statistics.skippedTests}`);
    }
    
    if (this.statistics.duration) {
      this.screen.write(0, y++, `${colors.blue}Duration:${colors.reset} ${(this.statistics.duration / 1000).toFixed(2)}s`);
    }
    
    y += 2;
    
    // Quick actions
    this.screen.write(0, y++, `${colors.bold}Quick Actions:${colors.reset}`);
    
    if (isMobile) {
      this.screen.write(0, y++, `${colors.cyan}[r]${colors.reset} Run tests`);
      this.screen.write(0, y++, `${colors.cyan}[s]${colors.reset} Stop tests`);
      this.screen.write(0, y++, `${colors.cyan}[w]${colors.reset} Watch mode`);
      this.screen.write(0, y++, `${colors.cyan}[c]${colors.reset} Clear results`);
    } else {
      this.screen.write(0, y++, `${colors.cyan}[r]${colors.reset} Run Tests  ${colors.cyan}[s]${colors.reset} Stop Tests  ${colors.cyan}[w]${colors.reset} Toggle Watch Mode`);
      this.screen.write(0, y++, `${colors.cyan}[c]${colors.reset} Clear Results  ${colors.cyan}[t]${colors.reset} Toggle Verbose  ${colors.cyan}[5]${colors.reset} Configuration`);
    }
    
    y += 2;
    
    // Recent test suites status
    if (this.suites.length > 0) {
      this.screen.write(0, y++, `${colors.bold}Test Suites Status:${colors.reset}`);
      
      const displaySuites = Math.min(this.suites.length, height - y - 3, isMobile ? 5 : 10);
      
      for (let i = 0; i < displaySuites; i++) {
        const suite = this.suites[i];
        let status = '';
        let color = colors.gray;
        
        switch (suite.status) {
          case 'pending':
            status = '○';
            color = colors.gray;
            break;
          case 'running':
            status = '●';
            color = colors.blue;
            break;
          case 'completed':
            status = '✓';
            color = colors.green;
            break;
          case 'failed':
            status = '✗';
            color = colors.red;
            break;
        }
        
        const testCount = `${suite.tests.length} tests`;
        const passCount = suite.passed > 0 ? `, ${suite.passed} passed` : '';
        const failCount = suite.failed > 0 ? `, ${suite.failed} failed` : '';
        
        if (isMobile) {
          let name = suite.name;
          if (name.length > width - 15) {
            name = name.substring(0, width - 18) + '...';
          }
          this.screen.write(0, y++, `${color}${status}${colors.reset} ${name}`);
        } else {
          this.screen.write(0, y++, `${color}${status}${colors.reset} ${suite.name} (${testCount}${passCount}${failCount})`);
        }
      }
      
      if (this.suites.length > displaySuites) {
        this.screen.write(0, y++, `${colors.gray}... and ${this.suites.length - displaySuites} more suites${colors.reset}`);
      }
    } else {
      this.screen.write(0, y++, `${colors.yellow}No test files found${colors.reset}`);
      this.screen.write(0, y++, `${colors.blue}Tip:${colors.reset} Add *.test.ts or *.battle.test.ts files to your project`);
    }
  }

  private renderSuites(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Test Suites${colors.reset}`);
    
    if (this.suites.length === 0) {
      this.screen.write(0, 2, `${colors.yellow}No test suites found${colors.reset}`);
      return;
    }
    
    let y = 2;
    const maxDisplay = height - 3;
    
    for (let i = 0; i < Math.min(this.suites.length, maxDisplay); i++) {
      const suite = this.suites[i];
      const isSelected = i === this.selectedSuiteIndex;
      
      let status = '';
      let color = colors.gray;
      
      switch (suite.status) {
        case 'pending':
          status = '○';
          break;
        case 'running':
          status = '●';
          color = colors.blue;
          break;
        case 'completed':
          status = suite.failed > 0 ? '✗' : '✓';
          color = suite.failed > 0 ? colors.red : colors.green;
          break;
        case 'failed':
          status = '✗';
          color = colors.red;
          break;
      }
      
      const prefix = isSelected ? `${colors.bgWhite}${colors.black}>` : ' ';
      const resetColor = isSelected ? colors.reset + colors.bgWhite + colors.black : colors.reset;
      
      if (isMobile) {
        let name = suite.name;
        if (name.length > width - 8) {
          name = name.substring(0, width - 11) + '...';
        }
        this.screen.write(0, y++, `${prefix}${color}${status}${resetColor} ${name}${colors.reset}`);
        
        if (isSelected && suite.tests.length > 0) {
          const summary = `${suite.tests.length}t, ${suite.passed}p, ${suite.failed}f`;
          this.screen.write(2, y++, `${colors.gray}${summary}${colors.reset}`);
        }
      } else {
        const testInfo = `${suite.tests.length} tests`;
        const resultInfo = suite.passed || suite.failed ? 
          ` (${suite.passed} passed, ${suite.failed} failed)` : '';
        const duration = suite.duration ? ` - ${(suite.duration / 1000).toFixed(2)}s` : '';
        
        this.screen.write(0, y++, 
          `${prefix}${color}${status}${resetColor} ${suite.name} - ${testInfo}${resultInfo}${duration}${colors.reset}`);
      }
    }
    
    if (this.suites.length > maxDisplay) {
      y++;
      this.screen.write(0, y++, `${colors.gray}... and ${this.suites.length - maxDisplay} more suites${colors.reset}`);
    }
    
    // Selected suite details
    if (this.selectedSuiteIndex < this.suites.length && !isMobile && y < height - 5) {
      const suite = this.suites[this.selectedSuiteIndex];
      y += 2;
      this.screen.write(0, y++, `${colors.bold}Selected: ${suite.name}${colors.reset}`);
      this.screen.write(0, y++, `${colors.blue}File:${colors.reset} ${suite.file}`);
      this.screen.write(0, y++, `${colors.blue}Status:${colors.reset} ${suite.status}`);
      
      if (suite.tests.length > 0) {
        this.screen.write(0, y++, `${colors.blue}Tests:${colors.reset} ${suite.tests.length} total`);
        if (suite.passed > 0) this.screen.write(0, y++, `${colors.green}Passed:${colors.reset} ${suite.passed}`);
        if (suite.failed > 0) this.screen.write(0, y++, `${colors.red}Failed:${colors.reset} ${suite.failed}`);
        if (suite.skipped > 0) this.screen.write(0, y++, `${colors.yellow}Skipped:${colors.reset} ${suite.skipped}`);
      }
    }
  }

  private renderTests(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Test Cases${colors.reset}`);
    
    if (this.selectedSuiteIndex >= this.suites.length) {
      this.screen.write(0, 2, `${colors.yellow}No suite selected${colors.reset}`);
      this.screen.write(0, 3, `${colors.blue}Tip:${colors.reset} Go to Suites view and select a test suite`);
      return;
    }
    
    const suite = this.suites[this.selectedSuiteIndex];
    this.screen.write(0, 1, `${colors.blue}Suite:${colors.reset} ${suite.name}`);
    
    if (suite.tests.length === 0) {
      this.screen.write(0, 3, `${colors.yellow}No tests found in this suite${colors.reset}`);
      return;
    }
    
    let y = 3;
    const maxDisplay = height - 4;
    
    for (let i = 0; i < Math.min(suite.tests.length, maxDisplay); i++) {
      const test = suite.tests[i];
      const isSelected = i === this.selectedTestIndex;
      
      let status = '';
      let color = colors.gray;
      
      switch (test.status) {
        case 'pending':
          status = '○';
          break;
        case 'running':
          status = '●';
          color = colors.blue;
          break;
        case 'passed':
          status = '✓';
          color = colors.green;
          break;
        case 'failed':
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
      
      let testName = test.name;
      if (isMobile && testName.length > width - 8) {
        testName = testName.substring(0, width - 11) + '...';
      }
      
      const duration = test.duration ? ` (${test.duration}ms)` : '';
      
      this.screen.write(0, y++, 
        `${prefix}${color}${status}${resetColor} ${testName}${duration}${colors.reset}`);
      
      // Show error on mobile for selected test
      if (isMobile && isSelected && test.error && y < height - 1) {
        let error = test.error;
        if (error.length > width - 4) {
          error = error.substring(0, width - 7) + '...';
        }
        this.screen.write(2, y++, `${colors.red}${error}${colors.reset}`);
      }
    }
    
    if (suite.tests.length > maxDisplay) {
      this.screen.write(0, y++, `${colors.gray}... and ${suite.tests.length - maxDisplay} more tests${colors.reset}`);
    }
    
    // Selected test details (desktop only)
    if (this.selectedTestIndex < suite.tests.length && !isMobile && y < height - 3) {
      const test = suite.tests[this.selectedTestIndex];
      y += 2;
      this.screen.write(0, y++, `${colors.bold}Selected Test: ${test.name}${colors.reset}`);
      this.screen.write(0, y++, `${colors.blue}Status:${colors.reset} ${test.status}`);
      
      if (test.duration) {
        this.screen.write(0, y++, `${colors.blue}Duration:${colors.reset} ${test.duration}ms`);
      }
      
      if (test.error && y < height - 1) {
        this.screen.write(0, y++, `${colors.red}Error:${colors.reset} ${test.error}`);
      }
      
      if (test.screenshot) {
        this.screen.write(0, y++, `${colors.blue}Screenshot:${colors.reset} Available (press 'v' to view)`);
      }
      
      if (test.replay) {
        this.screen.write(0, y++, `${colors.blue}Replay:${colors.reset} Available (press 'p' to play)`);
      }
    }
  }

  private renderResults(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Test Results Summary${colors.reset}`);
    
    let y = 2;
    
    // Overall statistics
    const totalTests = this.statistics.totalTests;
    const passRate = totalTests > 0 ? Math.round((this.statistics.passedTests / totalTests) * 100) : 0;
    
    this.screen.write(0, y++, `${colors.blue}Total Tests:${colors.reset} ${totalTests}`);
    this.screen.write(0, y++, `${colors.green}Passed:${colors.reset} ${this.statistics.passedTests} (${passRate}%)`);
    this.screen.write(0, y++, `${colors.red}Failed:${colors.reset} ${this.statistics.failedTests}`);
    this.screen.write(0, y++, `${colors.yellow}Skipped:${colors.reset} ${this.statistics.skippedTests}`);
    
    if (this.statistics.duration) {
      this.screen.write(0, y++, `${colors.blue}Total Duration:${colors.reset} ${(this.statistics.duration / 1000).toFixed(2)}s`);
    }
    
    y += 2;
    
    // Failed tests details
    const failedTests = this.suites
      .flatMap(suite => suite.tests.filter(test => test.status === 'failed'))
      .slice(0, height - y - 3);
    
    if (failedTests.length > 0) {
      this.screen.write(0, y++, `${colors.red}${styles.bold}Failed Tests:${styles.reset}`);
      
      failedTests.forEach(test => {
        if (y >= height - 2) return;
        
        const suiteName = this.suites.find(s => s.tests.includes(test))?.name || 'Unknown';
        
        if (isMobile) {
          let testName = test.name;
          if (testName.length > width - 8) {
            testName = testName.substring(0, width - 11) + '...';
          }
          this.screen.write(2, y++, `${colors.red}✗${colors.reset} ${testName}`);
          
          if (test.error) {
            let error = test.error;
            if (error.length > width - 6) {
              error = error.substring(0, width - 9) + '...';
            }
            this.screen.write(4, y++, `${colors.gray}${error}${colors.reset}`);
          }
        } else {
          this.screen.write(2, y++, `${colors.red}✗${colors.reset} ${suiteName}: ${test.name}`);
          
          if (test.error && y < height - 2) {
            let error = test.error;
            if (error.length > width - 6) {
              error = error.substring(0, width - 9) + '...';
            }
            this.screen.write(4, y++, `${colors.gray}${error}${colors.reset}`);
          }
        }
      });
      
      const remainingFailed = this.suites
        .flatMap(suite => suite.tests.filter(test => test.status === 'failed')).length - failedTests.length;
      
      if (remainingFailed > 0) {
        this.screen.write(2, y++, `${colors.gray}... and ${remainingFailed} more failed tests${colors.reset}`);
      }
    } else if (this.statistics.passedTests > 0) {
      this.screen.write(0, y++, `${colors.green}${styles.bold}All tests passed! 🎉${styles.reset}`);
    }
  }

  private renderConfig(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Test Configuration${colors.reset}`);
    
    let y = 2;
    
    // Current configuration
    this.screen.write(0, y++, `${colors.blue}Test Patterns:${colors.reset}`);
    this.testPatterns.forEach((pattern, index) => {
      const marker = index === this.selectedPattern ? 
        `${colors.bgGreen}${colors.black}●${colors.reset}` : 
        `${colors.gray}○${colors.reset}`;
      this.screen.write(2, y++, `${marker} ${pattern}`);
    });
    
    y++;
    
    this.screen.write(0, y++, `${colors.blue}Options:${colors.reset}`);
    this.screen.write(2, y++, `${this.watchMode ? colors.green + '●' : colors.gray + '○'} Watch Mode${colors.reset}`);
    this.screen.write(2, y++, `${this.verbose ? colors.green + '●' : colors.gray + '○'} Verbose Output${colors.reset}`);
    this.screen.write(2, y++, `${this.coverage ? colors.green + '●' : colors.gray + '○'} Code Coverage${colors.reset}`);
    
    y += 2;
    
    // Project information
    this.screen.write(0, y++, `${colors.blue}Project Information:${colors.reset}`);
    this.screen.write(2, y++, `${colors.blue}Path:${colors.reset} ${this.projectPath}`);
    this.screen.write(2, y++, `${colors.blue}Test Files Found:${colors.reset} ${this.suites.length}`);
    this.screen.write(2, y++, `${colors.blue}Total Tests:${colors.reset} ${this.statistics.totalTests}`);
    
    if (!isMobile && y < height - 5) {
      y += 2;
      this.screen.write(0, y++, `${colors.bold}Configuration Help:${colors.reset}`);
      this.screen.write(0, y++, `${colors.cyan}[w]${colors.reset} Toggle watch mode`);
      this.screen.write(0, y++, `${colors.cyan}[t]${colors.reset} Toggle verbose output`);
      this.screen.write(0, y++, `${colors.cyan}[up/down]${colors.reset} Select test pattern`);
    }
  }

  private renderLogs(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Test Execution Logs${colors.reset}`);
    
    if (this.logOutput.length === 0) {
      this.screen.write(0, 2, `${colors.gray}No logs available${colors.reset}`);
      this.screen.write(0, 3, `${colors.blue}Tip:${colors.reset} Run tests to see execution output here`);
      return;
    }
    
    let y = 2;
    const maxLines = height - 4;
    const startIndex = this.autoScroll ? 
      Math.max(0, this.logOutput.length - maxLines) : 0;
    const endIndex = Math.min(this.logOutput.length, startIndex + maxLines);
    
    for (let i = startIndex; i < endIndex; i++) {
      if (y >= height - 2) break;
      
      let line = this.logOutput[i];
      if (line.length > width - 1) {
        line = line.substring(0, width - 4) + '...';
      }
      
      // Color code log lines
      let color = colors.gray;
      if (line.includes('ERROR') || line.includes('FAIL')) color = colors.red;
      else if (line.includes('WARN')) color = colors.yellow;
      else if (line.includes('PASS') || line.includes('✓')) color = colors.green;
      else if (line.includes('INFO')) color = colors.blue;
      
      this.screen.write(0, y++, `${color}${line}${colors.reset}`);
    }
    
    // Scroll indicator
    if (this.logOutput.length > maxLines) {
      const scrollInfo = this.autoScroll ? 
        `[Auto-scroll] ${endIndex}/${this.logOutput.length}` :
        `${startIndex + 1}-${endIndex}/${this.logOutput.length}`;
      
      this.screen.write(width - scrollInfo.length - 1, height - 2, 
        `${colors.blue}${scrollInfo}${colors.reset}`);
    }
  }

  private renderFooter(width: number, height: number, isMobile: boolean): void {
    const footerY = height - 1;
    
    let commands;
    if (isMobile) {
      commands = this.responsiveCommands.getCommands(width, [
        { key: 'h', desc: 'Help' },
        { key: 'q', desc: 'Quit' },
        { key: 'r', desc: 'Run' },
        { key: 's', desc: 'Stop' }
      ]);
    } else {
      commands = this.responsiveCommands.getCommands(width, [
        { key: 'h', desc: 'Help' },
        { key: 'r', desc: 'Run Tests' },
        { key: 's', desc: 'Stop' },
        { key: 'w', desc: 'Watch' },
        { key: 'c', desc: 'Clear' },
        { key: '↑↓', desc: 'Navigate' },
        { key: 'q', desc: 'Quit' }
      ]);
    }
    
    this.screen.write(0, footerY, `${colors.blue}${commands}${colors.reset}`);
  }

  // Navigation methods
  private navigateUp(): void {
    if (this.currentView === 'suites') {
      this.selectedSuiteIndex = Math.max(0, this.selectedSuiteIndex - 1);
    } else if (this.currentView === 'tests') {
      this.selectedTestIndex = Math.max(0, this.selectedTestIndex - 1);
    }
  }

  private navigateDown(): void {
    if (this.currentView === 'suites') {
      this.selectedSuiteIndex = Math.min(this.suites.length - 1, this.selectedSuiteIndex + 1);
    } else if (this.currentView === 'tests') {
      const suite = this.suites[this.selectedSuiteIndex];
      if (suite) {
        this.selectedTestIndex = Math.min(suite.tests.length - 1, this.selectedTestIndex + 1);
      }
    }
  }

  private navigateLeft(): void {
    // Could be used for view switching
  }

  private navigateRight(): void {
    // Could be used for view switching
  }

  private handleEnter(): void {
    if (this.currentView === 'suites' && this.selectedSuiteIndex < this.suites.length) {
      this.currentView = 'tests';
      this.selectedTestIndex = 0;
    }
  }

  private handleSpace(): void {
    // Could toggle selection in multi-select scenarios
  }

  // Test execution methods
  private async runTests(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.clearResults();
    this.statistics.startTime = Date.now();
    
    // Reset all test statuses
    this.suites.forEach(suite => {
      suite.status = 'pending';
      suite.tests.forEach(test => {
        test.status = 'pending';
      });
    });
    
    this.logOutput.push('Starting test execution...');
    
    try {
      // Create progress bar
      this.progressBar = new ProgressBar(0, this.statistics.totalTests);
      
      // Start spinner
      this.spinner = new Spinner('Running tests...');
      this.spinner.start();
      
      // Run battle tests
      this.testProcess = spawn('npm', ['run', 'test'], {
        cwd: this.projectPath,
        stdio: 'pipe',
        shell: true
      });
      
      this.testProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        this.handleTestOutput(output);
      });
      
      this.testProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        this.logOutput.push(`ERROR: ${output.trim()}`);
      });
      
      this.testProcess.on('close', (code) => {
        this.handleTestCompletion(code || 0);
      });
      
    } catch (error) {
      this.logOutput.push(`Failed to start tests: ${error.message}`);
      this.isRunning = false;
      this.spinner?.stop();
      this.spinner = null;
      this.progressBar = null;
    }
  }

  private handleTestOutput(output: string): void {
    const lines = output.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      this.logOutput.push(line);
      
      // Parse test results from output
      if (line.includes('✓') || line.includes('PASS')) {
        this.handleTestPassed(line);
      } else if (line.includes('✗') || line.includes('FAIL')) {
        this.handleTestFailed(line);
      } else if (line.includes('SKIP')) {
        this.handleTestSkipped(line);
      }
    });
    
    // Update progress
    if (this.progressBar) {
      const completed = this.statistics.passedTests + this.statistics.failedTests + this.statistics.skippedTests;
      this.progressBar.setProgress(completed);
    }
  }

  private handleTestPassed(line: string): void {
    // Simple parsing - in real implementation would be more sophisticated
    this.statistics.passedTests++;
    // Update specific test status if identifiable
  }

  private handleTestFailed(line: string): void {
    this.statistics.failedTests++;
    // Update specific test status and capture error
  }

  private handleTestSkipped(line: string): void {
    this.statistics.skippedTests++;
  }

  private handleTestCompletion(exitCode: number): void {
    this.isRunning = false;
    this.spinner?.stop();
    this.spinner = null;
    this.progressBar = null;
    this.testProcess = null;
    
    this.statistics.endTime = Date.now();
    this.statistics.duration = this.statistics.endTime - this.statistics.startTime;
    
    if (exitCode === 0) {
      this.logOutput.push('✓ All tests completed successfully');
    } else {
      this.logOutput.push(`✗ Tests completed with exit code ${exitCode}`);
    }
    
    this.updateStatistics();
  }

  private stopTests(): void {
    if (this.testProcess) {
      this.testProcess.kill('SIGINT');
      this.logOutput.push('Test execution stopped by user');
    }
  }

  private clearResults(): void {
    this.logOutput = [];
    this.statistics = {
      totalTests: this.statistics.totalTests,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalSuites: this.statistics.totalSuites,
      completedSuites: 0,
      startTime: Date.now()
    };
    
    this.suites.forEach(suite => {
      suite.status = 'pending';
      suite.passed = 0;
      suite.failed = 0;
      suite.skipped = 0;
      suite.tests.forEach(test => {
        test.status = 'pending';
        delete test.error;
        delete test.duration;
      });
    });
  }

  private toggleWatch(): void {
    this.watchMode = !this.watchMode;
    this.logOutput.push(`Watch mode ${this.watchMode ? 'enabled' : 'disabled'}`);
  }

  private toggleVerbose(): void {
    this.verbose = !this.verbose;
    this.logOutput.push(`Verbose output ${this.verbose ? 'enabled' : 'disabled'}`);
  }

  private showReplay(): void {
    if (this.currentView === 'tests') {
      const suite = this.suites[this.selectedSuiteIndex];
      const test = suite?.tests[this.selectedTestIndex];
      
      if (test?.replay) {
        this.logOutput.push(`Opening replay for: ${test.name}`);
        // In real implementation, would show replay viewer
      } else {
        this.logOutput.push('No replay available for selected test');
      }
    }
  }

  private showScreenshot(): void {
    if (this.currentView === 'tests') {
      const suite = this.suites[this.selectedSuiteIndex];
      const test = suite?.tests[this.selectedTestIndex];
      
      if (test?.screenshot) {
        this.logOutput.push(`Opening screenshot for: ${test.name}`);
        // In real implementation, would show screenshot viewer
      } else {
        this.logOutput.push('No screenshot available for selected test');
      }
    }
  }

  private showHelp(): void {
    this.logOutput.push('=== Battle Dashboard Help ===');
    this.logOutput.push('Navigation: 1-6 to switch views, ↑↓ to navigate items');
    this.logOutput.push('Test Control: [r] Run, [s] Stop, [w] Watch, [c] Clear');
    this.logOutput.push('Test Actions: [p] Replay, [v] Screenshot, [t] Verbose');
    this.logOutput.push('General: [h] Help, [q] Quit');
  }

  private quit(): void {
    if (this.testProcess) {
      this.testProcess.kill();
    }
    this.spinner?.stop();
    this.screen.cleanup();
    this.keyboard.stop();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  const projectPath = process.argv[2] || process.cwd();
  const dashboard = new BattleDashboard(projectPath);
  
  console.log('Starting Battle Test Dashboard...');
  dashboard.start().catch(error => {
    console.error('Failed to start Battle Dashboard:', error);
    process.exit(1);
  });
}

export { BattleDashboard };