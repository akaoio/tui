# Composer TUI

A powerful Terminal User Interface for managing @akaoio/composer documentation projects with full mobile terminal support.

## Features

### 🎯 Template Management
- Pre-built templates for common documentation patterns
- Quick project setup with README, API, and guide templates
- Interactive template selection and configuration

### 🔧 Configuration Editor  
- Visual configuration management
- Source and output mapping
- Real-time validation

### 🏗️ Build System Integration
- Live build monitoring with progress indicators
- Real-time build output streaming
- Error highlighting and reporting

### 👀 Live Preview
- Generated output preview
- File system explorer
- Change detection and auto-refresh

### 📱 Mobile-Responsive Design
- Optimized for terminals as small as 40x15 characters
- Adaptive layouts for different screen sizes
- Touch-friendly navigation patterns
- Compact information display

### 🔍 Watch Mode
- File system watching for automatic rebuilds
- Live reload of generated documentation
- Status indicators and notifications

## Quick Start

```bash
# Run in current directory
npm run example:composer

# Run in specific project directory  
npm run example:composer /path/to/project

# Or directly with tsx
tsx examples/composer-ui/index.ts
```

## Navigation

### Desktop (60+ columns)
- `[m]` Main Menu - Project overview and quick actions
- `[t]` Templates - Select and apply documentation templates  
- `[c]` Configuration - Edit composer config sources and outputs
- `[b]` Build - Run builds and monitor progress
- `[p]` Preview - View generated output files
- `[f]` Files - Browse project file structure

### Mobile (< 60 columns)
- `[m]` Main - Compact overview
- `[t]` Tmpl - Template selection
- `[c]` Conf - Config editor  
- `[b]` Build - Build tools
- `[p]` Prev - Output preview
- `[f]` Files - File browser

### Global Shortcuts
- `h` - Show help information
- `w` - Toggle watch mode for live rebuilds
- `q` or `Ctrl+C` - Quit application
- `Enter` - Execute context actions (build, select, etc.)

## Templates

### 1. README Project
Perfect for generating comprehensive README.md files from atomic components:
- Project metadata management
- Feature documentation
- Installation instructions
- Usage examples

### 2. API Documentation  
Complete API documentation generator:
- Endpoint documentation
- Method descriptions
- Parameter specifications
- Response examples

### 3. Full Documentation Suite
Comprehensive documentation with multiple outputs:
- README.md for project overview
- API.md for technical reference  
- GUIDE.md for tutorials and guides

## Mobile Optimization

The interface automatically adapts to small terminal sizes commonly found on mobile SSH clients:

### Small Screen Adaptations
- **Compact Navigation**: Abbreviated labels (`Tmpl`, `Conf`, `Prev`)
- **Truncated Text**: Long content gets truncated with ellipsis
- **Stacked Layout**: Information displayed vertically instead of horizontally
- **Essential Information**: Focus on most important data only
- **Touch-Friendly**: Larger hit targets for terminal navigation

### Responsive Breakpoints
- **Mobile**: < 60 columns or < 20 rows
- **Desktop**: ≥ 60 columns and ≥ 20 rows

## Real-World Integration

### With @akaoio/composer
The TUI directly integrates with composer commands:
```bash
composer build    # Background build execution
composer watch     # File system watching
```

### Project Structure Support
Works with standard composer project layouts:
```
project/
├── composer.config.cjs          # Configuration
├── src/doc/                     # Documentation sources
│   ├── config/project.yaml      # Project metadata
│   ├── features/atom/           # Feature atoms
│   ├── api/                     # API documentation
│   └── template/               # Output templates
└── [generated files]           # README.md, API.md, etc.
```

### Configuration Management
Visual editing of composer configuration:
- Source pattern definitions
- Output target mapping  
- Template associations
- Build pipeline configuration

## Advanced Features

### Build Monitoring
- Real-time progress indicators
- Colored output (errors in red, warnings in yellow, success in green)  
- Build history and logs
- Error navigation and highlighting

### File System Integration
- Project file browser with size and modification info
- Generated file preview with syntax awareness
- Directory structure visualization
- File change detection

### Performance Optimizations
- Efficient terminal rendering (100ms refresh rate)
- Background process management
- Memory-conscious build output buffering
- Responsive command debouncing

## Development

The Composer TUI demonstrates several advanced TUI patterns:

### Responsive Design
```typescript
private getScreenDimensions(): { width: number; height: number; isMobile: boolean } {
  const { columns, rows } = process.stdout;
  const width = columns || 80;
  const height = rows || 24;
  const isMobile = width < 60 || height < 20;
  
  return { width, height, isMobile };
}
```

### Adaptive Rendering
```typescript
if (isMobile) {
  this.renderMobileNavigation(width);
} else {
  this.renderDesktopNavigation(width);
}
```

### Process Management
```typescript
this.buildProcess = spawn('composer', ['build'], {
  cwd: this.projectPath,
  stdio: 'pipe'
});
```

This serves as a foundation for integrating TUI interfaces into all @akaoio core technologies, showcasing responsive design patterns and practical terminal application development.