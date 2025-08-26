#!/usr/bin/env tsx

/**
 * @akaoio/composer TUI Interface
 * 
 * A powerful TUI for managing @akaoio/composer documentation projects:
 * - Template selection and configuration
 * - Live preview and build monitoring
 * - Responsive design for mobile terminals
 * - Real-time file watching and updates
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

interface ComposerConfig {
  sources: Record<string, any>;
  build?: {
    tasks: any[];
  };
  outputs: Array<{
    target: string;
    template: string;
    format: string;
  }>;
}

interface ProjectTemplate {
  name: string;
  description: string;
  config: Partial<ComposerConfig>;
  files: Array<{
    path: string;
    content: string;
  }>;
}

class ComposerTUI {
  private screen: Screen;
  private keyboard: Keyboard;
  private keyboardHandler: UnifiedKeyboardHandler;
  private currentView: 'main' | 'templates' | 'config' | 'build' | 'preview' | 'files' = 'main';
  private form: Form | null = null;
  private spinner: Spinner | null = null;
  private progressBar: ProgressBar | null = null;
  private buildProcess: ChildProcess | null = null;
  private watchProcess: ChildProcess | null = null;
  private projectPath: string;
  private config: ComposerConfig | null = null;
  private buildOutput: string[] = [];
  private isWatching = false;
  private responsiveCommands: ResponsiveCommands;

  // Predefined templates for quick project setup
  private templates: ProjectTemplate[] = [
    {
      name: 'README Project',
      description: 'Generate comprehensive README.md from atomic components',
      config: {
        sources: {
          project: { pattern: 'src/doc/config/project.yaml', parser: 'yaml' },
          features: { pattern: 'src/doc/features/atom/*.yaml', parser: 'yaml' },
          installation: { pattern: 'src/doc/readme/atom/installation-*.yaml', parser: 'yaml' }
        },
        outputs: [{
          target: 'README.md',
          template: 'src/doc/template/README.md',
          format: 'markdown'
        }]
      },
      files: [
        {
          path: 'src/doc/config/project.yaml',
          content: `name: My Project
description: Project description here
version: 1.0.0
author: Your Name`
        },
        {
          path: 'src/doc/template/README.md',
          content: `# {{project.name}}

{{project.description}}

## Features
{{#each features}}
- **{{title}}**: {{description}}
{{/each}}

## Installation
{{#each installation}}
### {{title}}
\`\`\`bash
{{command}}
\`\`\`
{{/each}}`
        }
      ]
    },
    {
      name: 'API Documentation',
      description: 'Comprehensive API documentation generator',
      config: {
        sources: {
          api: { pattern: 'src/doc/api/**/*.yaml', parser: 'yaml' },
          examples: { pattern: 'src/doc/examples/**/*.yaml', parser: 'yaml' }
        },
        outputs: [
          {
            target: 'API.md',
            template: 'src/doc/template/API.md',
            format: 'markdown'
          }
        ]
      },
      files: [
        {
          path: 'src/doc/template/API.md',
          content: `# API Documentation

{{#each api}}
## {{name}}
{{description}}

### Methods
{{#each methods}}
#### {{name}}
{{description}}

**Parameters:**
{{#each parameters}}
- \`{{name}}\` ({{type}}): {{description}}
{{/each}}
{{/each}}
{{/each}}`
        }
      ]
    },
    {
      name: 'Full Documentation Suite',
      description: 'Complete documentation with README, API, and guides',
      config: {
        sources: {
          project: { pattern: 'src/doc/config/project.yaml', parser: 'yaml' },
          features: { pattern: 'src/doc/features/**/*.yaml', parser: 'yaml' },
          api: { pattern: 'src/doc/api/**/*.yaml', parser: 'yaml' },
          guides: { pattern: 'src/doc/guides/**/*.yaml', parser: 'yaml' }
        },
        outputs: [
          { target: 'README.md', template: 'src/doc/template/README.md', format: 'markdown' },
          { target: 'API.md', template: 'src/doc/template/API.md', format: 'markdown' },
          { target: 'GUIDE.md', template: 'src/doc/template/GUIDE.md', format: 'markdown' }
        ]
      },
      files: []
    }
  ];

  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.screen = new Screen();
    this.keyboard = new Keyboard();
    this.keyboardHandler = new UnifiedKeyboardHandler(this.keyboard);
    this.responsiveCommands = new ResponsiveCommands();

    this.setupKeyboardHandlers();
    this.loadConfig();
  }

  private setupKeyboardHandlers(): void {
    // Global shortcuts
    this.keyboardHandler.onKey(['ctrl+c', 'q'], () => this.quit());
    this.keyboardHandler.onKey('h', () => this.showHelp());
    this.keyboardHandler.onKey('m', () => this.currentView = 'main');
    this.keyboardHandler.onKey('t', () => this.currentView = 'templates');
    this.keyboardHandler.onKey('c', () => this.currentView = 'config');
    this.keyboardHandler.onKey('b', () => this.currentView = 'build');
    this.keyboardHandler.onKey('p', () => this.currentView = 'preview');
    this.keyboardHandler.onKey('f', () => this.currentView = 'files');
    this.keyboardHandler.onKey('w', () => this.toggleWatch());
    
    // View-specific handlers
    this.keyboardHandler.onKey('enter', () => {
      if (this.currentView === 'templates') this.showTemplateSelection();
      if (this.currentView === 'build') this.runBuild();
    });
  }

  private loadConfig(): void {
    try {
      const configPath = path.join(this.projectPath, 'composer.config.cjs');
      if (fs.existsSync(configPath)) {
        // Note: In a real implementation, we'd need proper config loading
        // This is a simplified version for demo purposes
        this.config = require(configPath);
      }
    } catch (error) {
      // Config not found or invalid - will create new one
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
    
    // Navigation (adaptive)
    if (isMobile) {
      this.renderMobileNavigation(width);
    } else {
      this.renderDesktopNavigation(width);
    }
    
    // Main content area
    const contentStartY = isMobile ? 6 : 4;
    this.screen.setCursor(0, contentStartY);
    
    switch (this.currentView) {
      case 'main':
        this.renderMainView(width, height - contentStartY, isMobile);
        break;
      case 'templates':
        this.renderTemplatesView(width, height - contentStartY, isMobile);
        break;
      case 'config':
        this.renderConfigView(width, height - contentStartY, isMobile);
        break;
      case 'build':
        this.renderBuildView(width, height - contentStartY, isMobile);
        break;
      case 'preview':
        this.renderPreviewView(width, height - contentStartY, isMobile);
        break;
      case 'files':
        this.renderFilesView(width, height - contentStartY, isMobile);
        break;
    }
    
    // Footer with responsive commands
    this.renderFooter(width, height, isMobile);
  }

  private renderHeader(width: number, isMobile: boolean): void {
    const title = isMobile ? "Composer TUI" : "@akaoio/composer - Documentation Engine TUI";
    const projectName = path.basename(this.projectPath);
    
    this.screen.write(0, 0, `${colors.cyan}${styles.bold}${title}${styles.reset}`);
    
    if (!isMobile) {
      this.screen.write(width - projectName.length - 12, 0, 
        `${colors.yellow}Project: ${projectName}${colors.reset}`);
    } else {
      this.screen.write(0, 1, `${colors.yellow}${projectName}${colors.reset}`);
    }
    
    // Status indicators
    const statusY = isMobile ? 2 : 1;
    let statusX = 0;
    
    if (this.config) {
      this.screen.write(statusX, statusY, `${colors.green}● Config${colors.reset}`);
      statusX += 10;
    } else {
      this.screen.write(statusX, statusY, `${colors.red}○ Config${colors.reset}`);
      statusX += 10;
    }
    
    if (this.isWatching) {
      this.screen.write(statusX, statusY, `${colors.blue}● Watch${colors.reset}`);
      statusX += 10;
    }
    
    // Draw separator
    this.screen.write(0, statusY + 1, '─'.repeat(width));
  }

  private renderMobileNavigation(width: number): void {
    const views = [
      { key: 'm', name: 'Main', view: 'main' },
      { key: 't', name: 'Tmpl', view: 'templates' },
      { key: 'c', name: 'Conf', view: 'config' },
      { key: 'b', name: 'Build', view: 'build' },
      { key: 'p', name: 'Prev', view: 'preview' },
      { key: 'f', name: 'Files', view: 'files' }
    ];
    
    let nav = views.map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}]${name}${colors.reset}`;
    }).join(' ');
    
    // Truncate if too long for mobile
    if (nav.length > width - 4) {
      nav = nav.substring(0, width - 7) + '...';
    }
    
    this.screen.write(0, 4, nav);
  }

  private renderDesktopNavigation(width: number): void {
    const views = [
      { key: 'm', name: 'Main Menu', view: 'main' },
      { key: 't', name: 'Templates', view: 'templates' },
      { key: 'c', name: 'Configuration', view: 'config' },
      { key: 'b', name: 'Build', view: 'build' },
      { key: 'p', name: 'Preview', view: 'preview' },
      { key: 'f', name: 'Files', view: 'files' }
    ];
    
    const nav = views.map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}] ${name}${colors.reset}`;
    }).join('  ');
    
    this.screen.write(0, 3, nav);
  }

  private renderMainView(width: number, height: number, isMobile: boolean): void {
    const welcomeText = isMobile ? 
      "Welcome to Composer TUI" : 
      "Welcome to @akaoio/composer Terminal User Interface";
    
    this.screen.write(0, 0, `${colors.green}${styles.bold}${welcomeText}${styles.reset}`);
    
    let y = 2;
    
    // Quick stats
    if (this.config) {
      const sourceCount = Object.keys(this.config.sources || {}).length;
      const outputCount = (this.config.outputs || []).length;
      
      this.screen.write(0, y++, `${colors.blue}Configuration:${colors.reset} Loaded`);
      this.screen.write(0, y++, `${colors.blue}Sources:${colors.reset} ${sourceCount} defined`);
      this.screen.write(0, y++, `${colors.blue}Outputs:${colors.reset} ${outputCount} targets`);
      y++;
    } else {
      this.screen.write(0, y++, `${colors.yellow}No configuration found${colors.reset}`);
      this.screen.write(0, y++, `${colors.blue}Tip:${colors.reset} Press 't' to create from template`);
      y++;
    }
    
    // Quick actions
    this.screen.write(0, y++, `${colors.bold}Quick Actions:${colors.reset}`);
    
    if (isMobile) {
      this.screen.write(0, y++, `${colors.cyan}[t]${colors.reset} Templates`);
      this.screen.write(0, y++, `${colors.cyan}[b]${colors.reset} Build`);
      this.screen.write(0, y++, `${colors.cyan}[w]${colors.reset} Watch`);
      this.screen.write(0, y++, `${colors.cyan}[q]${colors.reset} Quit`);
    } else {
      this.screen.write(0, y++, `${colors.cyan}[t]${colors.reset} Select Template  ${colors.cyan}[c]${colors.reset} Configure  ${colors.cyan}[b]${colors.reset} Build`);
      this.screen.write(0, y++, `${colors.cyan}[p]${colors.reset} Preview Output  ${colors.cyan}[w]${colors.reset} Toggle Watch  ${colors.cyan}[f]${colors.reset} File Explorer`);
    }
    
    y += 2;
    
    // Recent build output preview
    if (this.buildOutput.length > 0) {
      this.screen.write(0, y++, `${colors.bold}Recent Build Output:${colors.reset}`);
      const maxLines = Math.min(height - y - 2, this.buildOutput.length, isMobile ? 5 : 10);
      
      for (let i = this.buildOutput.length - maxLines; i < this.buildOutput.length; i++) {
        if (i >= 0) {
          let line = this.buildOutput[i];
          if (isMobile && line.length > width - 2) {
            line = line.substring(0, width - 5) + '...';
          }
          this.screen.write(0, y++, `${colors.gray}${line}${colors.reset}`);
        }
      }
    }
  }

  private renderTemplatesView(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Documentation Templates${colors.reset}`);
    this.screen.write(0, 1, `Select a template to quick-start your project:`);
    
    let y = 3;
    
    this.templates.forEach((template, index) => {
      if (y >= height - 2) return; // Don't overflow
      
      const marker = `${colors.cyan}[${index + 1}]${colors.reset}`;
      const name = `${colors.bold}${template.name}${colors.reset}`;
      
      if (isMobile) {
        this.screen.write(0, y++, `${marker} ${name}`);
        let desc = template.description;
        if (desc.length > width - 4) {
          desc = desc.substring(0, width - 7) + '...';
        }
        this.screen.write(2, y++, `${colors.gray}${desc}${colors.reset}`);
        y++; // Extra spacing on mobile
      } else {
        this.screen.write(0, y, `${marker} ${name} - ${colors.gray}${template.description}${colors.reset}`);
        y++;
      }
    });
    
    if (!isMobile) {
      y++;
      this.screen.write(0, y++, `${colors.blue}Usage:${colors.reset}`);
      this.screen.write(0, y++, `• Press number (1-${this.templates.length}) to select template`);
      this.screen.write(0, y++, `• Press Enter to apply selected template`);
      this.screen.write(0, y++, `• Press 'm' to return to main menu`);
    }
  }

  private renderConfigView(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Configuration Editor${colors.reset}`);
    
    if (!this.config) {
      this.screen.write(0, 2, `${colors.yellow}No configuration loaded${colors.reset}`);
      this.screen.write(0, 3, `Press 't' to create from template or load existing config.`);
      return;
    }
    
    let y = 2;
    
    // Sources section
    this.screen.write(0, y++, `${colors.bold}Sources:${colors.reset}`);
    const sources = Object.entries(this.config.sources || {});
    
    if (isMobile) {
      // Compact display for mobile
      sources.slice(0, 5).forEach(([name, config]: [string, any]) => {
        this.screen.write(2, y++, `${colors.cyan}${name}${colors.reset}: ${config.pattern || 'N/A'}`);
      });
      if (sources.length > 5) {
        this.screen.write(2, y++, `${colors.gray}... and ${sources.length - 5} more${colors.reset}`);
      }
    } else {
      sources.forEach(([name, config]: [string, any]) => {
        if (y >= height - 8) {
          this.screen.write(2, y++, `${colors.gray}... and ${sources.length - (y - 3)} more${colors.reset}`);
          return;
        }
        this.screen.write(2, y++, `${colors.cyan}${name}${colors.reset}: ${config.pattern} (${config.parser})`);
      });
    }
    
    y++;
    
    // Outputs section
    this.screen.write(0, y++, `${colors.bold}Outputs:${colors.reset}`);
    (this.config.outputs || []).forEach((output, index) => {
      if (y >= height - 3) return;
      
      if (isMobile) {
        this.screen.write(2, y++, `${colors.green}${output.target}${colors.reset}`);
      } else {
        this.screen.write(2, y++, `${colors.green}${output.target}${colors.reset} ← ${output.template} (${output.format})`);
      }
    });
  }

  private renderBuildView(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Build & Watch${colors.reset}`);
    
    let y = 2;
    
    // Build status
    if (this.buildProcess) {
      this.screen.write(0, y++, `${colors.blue}Status:${colors.reset} Building...`);
      if (this.spinner) {
        this.screen.write(0, y++, this.spinner.render());
      }
    } else if (this.isWatching) {
      this.screen.write(0, y++, `${colors.green}Status:${colors.reset} Watching for changes`);
    } else {
      this.screen.write(0, y++, `${colors.gray}Status:${colors.reset} Idle`);
    }
    
    y++;
    
    // Controls
    this.screen.write(0, y++, `${colors.bold}Controls:${colors.reset}`);
    
    if (isMobile) {
      this.screen.write(0, y++, `${colors.cyan}[Enter]${colors.reset} Build`);
      this.screen.write(0, y++, `${colors.cyan}[w]${colors.reset} Toggle Watch`);
      if (this.buildProcess) {
        this.screen.write(0, y++, `${colors.red}[Ctrl+C]${colors.reset} Stop`);
      }
    } else {
      this.screen.write(0, y++, `${colors.cyan}[Enter]${colors.reset} Run Build  ${colors.cyan}[w]${colors.reset} Toggle Watch Mode`);
      if (this.buildProcess) {
        this.screen.write(0, y++, `${colors.red}[Ctrl+C]${colors.reset} Stop Current Build`);
      }
    }
    
    y += 2;
    
    // Build output
    if (this.buildOutput.length > 0) {
      this.screen.write(0, y++, `${colors.bold}Build Output:${colors.reset}`);
      
      const outputHeight = height - y - 1;
      const startIndex = Math.max(0, this.buildOutput.length - outputHeight);
      
      for (let i = startIndex; i < this.buildOutput.length && y < height - 1; i++) {
        let line = this.buildOutput[i];
        if (line.length > width - 1) {
          line = line.substring(0, width - 4) + '...';
        }
        
        // Color code output
        let color = colors.gray;
        if (line.includes('Error') || line.includes('error')) color = colors.red;
        else if (line.includes('Warning') || line.includes('warning')) color = colors.yellow;
        else if (line.includes('Success') || line.includes('✓')) color = colors.green;
        
        this.screen.write(0, y++, `${color}${line}${colors.reset}`);
      }
    }
  }

  private renderPreviewView(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Output Preview${colors.reset}`);
    
    if (!this.config || !this.config.outputs || this.config.outputs.length === 0) {
      this.screen.write(0, 2, `${colors.yellow}No outputs configured${colors.reset}`);
      return;
    }
    
    let y = 2;
    
    // Show available outputs
    this.screen.write(0, y++, `${colors.bold}Available Outputs:${colors.reset}`);
    
    this.config.outputs.forEach((output, index) => {
      if (y >= height - 5) return;
      
      const filePath = path.join(this.projectPath, output.target);
      const exists = fs.existsSync(filePath);
      const status = exists ? `${colors.green}✓${colors.reset}` : `${colors.gray}○${colors.reset}`;
      
      this.screen.write(0, y++, `${status} ${colors.cyan}[${index + 1}]${colors.reset} ${output.target}`);
      
      if (exists && !isMobile) {
        try {
          const stats = fs.statSync(filePath);
          const size = Math.round(stats.size / 1024 * 100) / 100;
          const modified = stats.mtime.toLocaleTimeString();
          this.screen.write(4, y++, `${colors.gray}${size}KB - Modified: ${modified}${colors.reset}`);
        } catch (error) {
          // Ignore stat errors
        }
      }
    });
    
    y++;
    
    // Preview first few lines of first output
    const firstOutput = this.config.outputs[0];
    if (firstOutput) {
      const filePath = path.join(this.projectPath, firstOutput.target);
      
      if (fs.existsSync(filePath)) {
        this.screen.write(0, y++, `${colors.bold}Preview (${firstOutput.target}):${colors.reset}`);
        
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');
          const previewLines = Math.min(lines.length, height - y - 1, isMobile ? 8 : 15);
          
          for (let i = 0; i < previewLines && y < height - 1; i++) {
            let line = lines[i] || '';
            if (line.length > width - 1) {
              line = line.substring(0, width - 4) + '...';
            }
            this.screen.write(0, y++, `${colors.gray}${line}${colors.reset}`);
          }
          
          if (lines.length > previewLines) {
            this.screen.write(0, y++, `${colors.gray}... ${lines.length - previewLines} more lines${colors.reset}`);
          }
        } catch (error) {
          this.screen.write(0, y++, `${colors.red}Error reading file: ${error.message}${colors.reset}`);
        }
      }
    }
  }

  private renderFilesView(width: number, height: number, isMobile: boolean): void {
    this.screen.write(0, 0, `${colors.bold}Project Files${colors.reset}`);
    
    let y = 2;
    
    try {
      // Show project structure
      const showDirectory = (dirPath: string, indent = 0, maxDepth = 3) => {
        if (indent > maxDepth || y >= height - 3) return;
        
        const items = fs.readdirSync(dirPath).filter(item => 
          !item.startsWith('.') && 
          !['node_modules', 'dist', 'build'].includes(item)
        ).sort();
        
        for (const item of items) {
          if (y >= height - 3) break;
          
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);
          const isDir = stats.isDirectory();
          
          const prefix = '  '.repeat(indent);
          const icon = isDir ? '📁' : '📄';
          const name = isMobile && item.length > 20 ? item.substring(0, 17) + '...' : item;
          
          let line = `${prefix}${icon} ${name}`;
          if (!isMobile && !isDir) {
            const size = Math.round(stats.size / 1024 * 100) / 100;
            line += ` ${colors.gray}(${size}KB)${colors.reset}`;
          }
          
          this.screen.write(0, y++, line);
          
          if (isDir && indent < 2) {
            showDirectory(itemPath, indent + 1, maxDepth);
          }
        }
      };
      
      showDirectory(this.projectPath);
      
    } catch (error) {
      this.screen.write(0, y++, `${colors.red}Error reading directory: ${error.message}${colors.reset}`);
    }
    
    if (!isMobile && y < height - 5) {
      y += 2;
      this.screen.write(0, y++, `${colors.blue}Project Path:${colors.reset} ${this.projectPath}`);
    }
  }

  private renderFooter(width: number, height: number, isMobile: boolean): void {
    const footerY = height - 1;
    
    // Responsive command help
    const commands = this.responsiveCommands.getCommands(width, [
      { key: 'h', desc: 'Help' },
      { key: 'q', desc: 'Quit' },
      { key: 'm', desc: 'Main' },
      { key: 'w', desc: 'Watch' },
      { key: 'Ctrl+C', desc: 'Exit' }
    ]);
    
    this.screen.write(0, footerY, `${colors.blue}${commands}${colors.reset}`);
  }

  private showHelp(): void {
    // For simplicity, just show help in the current view
    // In a full implementation, this would be a modal or separate view
  }

  private async showTemplateSelection(): Promise<void> {
    // This would show an interactive template selection
    // For now, just apply the first template
    if (this.templates.length > 0) {
      await this.applyTemplate(this.templates[0]);
    }
  }

  private async applyTemplate(template: ProjectTemplate): Promise<void> {
    try {
      // Create directories
      const srcDir = path.join(this.projectPath, 'src', 'doc');
      fs.mkdirSync(srcDir, { recursive: true });
      
      // Write template files
      for (const file of template.files) {
        const filePath = path.join(this.projectPath, file.path);
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, file.content);
      }
      
      // Write config
      const configPath = path.join(this.projectPath, 'composer.config.cjs');
      fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(template.config, null, 2)};`);
      
      this.config = template.config as ComposerConfig;
      this.buildOutput.push(`Template '${template.name}' applied successfully`);
    } catch (error) {
      this.buildOutput.push(`Error applying template: ${error.message}`);
    }
  }

  private async runBuild(): Promise<void> {
    if (this.buildProcess) return; // Already building
    
    this.buildOutput.push('Starting build...');
    
    try {
      this.buildProcess = spawn('composer', ['build'], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      
      this.spinner = new Spinner('Building documentation...');
      this.spinner.start();
      
      this.buildProcess.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) this.buildOutput.push(output);
      });
      
      this.buildProcess.stderr?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) this.buildOutput.push(`ERROR: ${output}`);
      });
      
      this.buildProcess.on('close', (code) => {
        this.spinner?.stop();
        this.spinner = null;
        this.buildProcess = null;
        
        if (code === 0) {
          this.buildOutput.push('Build completed successfully ✓');
        } else {
          this.buildOutput.push(`Build failed with code ${code} ✗`);
        }
      });
    } catch (error) {
      this.buildOutput.push(`Error starting build: ${error.message}`);
      this.spinner?.stop();
      this.spinner = null;
      this.buildProcess = null;
    }
  }

  private toggleWatch(): void {
    if (this.isWatching) {
      this.stopWatch();
    } else {
      this.startWatch();
    }
  }

  private startWatch(): void {
    if (this.watchProcess) return;
    
    try {
      this.watchProcess = spawn('composer', ['watch'], {
        cwd: this.projectPath,
        stdio: 'pipe'
      });
      
      this.isWatching = true;
      this.buildOutput.push('Started watching for changes...');
      
      this.watchProcess.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) this.buildOutput.push(`WATCH: ${output}`);
      });
      
      this.watchProcess.stderr?.on('data', (data) => {
        const output = data.toString().trim();
        if (output) this.buildOutput.push(`WATCH ERROR: ${output}`);
      });
      
      this.watchProcess.on('close', (code) => {
        this.isWatching = false;
        this.watchProcess = null;
        this.buildOutput.push(`Watch stopped (code ${code})`);
      });
    } catch (error) {
      this.buildOutput.push(`Error starting watch: ${error.message}`);
    }
  }

  private stopWatch(): void {
    if (this.watchProcess) {
      this.watchProcess.kill();
      this.watchProcess = null;
    }
    this.isWatching = false;
    this.buildOutput.push('Watch stopped');
  }

  private quit(): void {
    this.stopWatch();
    if (this.buildProcess) {
      this.buildProcess.kill();
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
  const app = new ComposerTUI(projectPath);
  
  console.log('Starting Composer TUI...');
  app.start().catch(error => {
    console.error('Failed to start Composer TUI:', error);
    process.exit(1);
  });
}

export { ComposerTUI };