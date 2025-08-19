import { initLip, Lipgloss } from '../../src/lipgloss';
import * as huh from '../../src/fields';

describe('Integration Tests', () => {
  let lip: Lipgloss;

  beforeAll(async () => {
    const isInit = await initLip();
    if (!isInit) {
      throw new Error('Failed to initialize WASM for integration tests');
    }
    lip = new Lipgloss();
  });

  describe('Combined Lipgloss Features', () => {
    it('should combine multiple styles in a layout', async () => {
      // Create different styles
      await lip.createStyle({
        id: 'header',
        canvasColor: { color: '#FFFFFF', background: '#0066CC' },
        bold: true,
        padding: [1, 4],
        margin: [0],
        alignV: 'center',
        width: 40
      });

      await lip.createStyle({
        id: 'content',
        canvasColor: { color: '#333333' },
        padding: [2, 2],
        margin: [1, 0],
        border: { type: 'rounded', foreground: '#CCCCCC', sides: [true] }
      });

      await lip.createStyle({
        id: 'footer',
        canvasColor: { color: '#666666' },
        padding: [1, 2],
        margin: [0],
        alignV: 'bottom'
      });

      // Apply styles
      const header = await lip.apply({ value: '=== Application Header ===', id: 'header' });
      const content = await lip.apply({ value: 'Main content goes here\nWith multiple lines', id: 'content' });
      const footer = await lip.apply({ value: 'Footer © 2024', id: 'footer' });

      // Combine vertically
      const result = await lip.join({
        direction: 'vertical',
        position: 'center',
        elements: [header, content, footer]
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create a complex dashboard layout', async () => {
      // Create sidebar style
      await lip.createStyle({
        id: 'sidebar',
        canvasColor: { background: '#2C3E50' },
        padding: [2, 3],
        margin: [0],
        width: 20,
        height: 10
      });

      // Create main content style
      await lip.createStyle({
        id: 'main',
        canvasColor: { background: '#ECF0F1' },
        padding: [2, 4],
        margin: [0],
        width: 60,
        height: 10
      });

      // Create list for sidebar
      const sidebarList = await lip.List({
        data: ['Dashboard', 'Users', 'Settings', 'Logout'],
        selected: ['Dashboard'],
        listStyle: 'custom',
        customEnum: '▶',
        styles: { numeratorColor: '99', itemColor: '255', marginRight: 2 }
      });

      // Create table for main content
      const mainTable = await lip.newTable({
        data: {
          headers: ['ID', 'Name', 'Status', 'Action'],
          rows: [
            ['001', 'John Doe', 'Active', 'Edit'],
            ['002', 'Jane Smith', 'Pending', 'Edit'],
            ['003', 'Bob Johnson', 'Inactive', 'Edit']
          ]
        },
        table: { border: 'rounded', color: '240', width: 50 },
        header: { color: '33', bold: true }
      });

      // Apply styles
      const sidebar = await lip.apply({ value: sidebarList, id: 'sidebar' });
      const main = await lip.apply({ value: mainTable, id: 'main' });

      // Combine horizontally
      const dashboard = await lip.join({
        direction: 'horizontal',
        position: 'top',
        elements: [sidebar, main]
      });

      expect(dashboard).toBeDefined();
      expect(typeof dashboard).toBe('string');
    });

    it('should render markdown within styled container', async () => {
      const markdown = `
# Project Report

## Summary
Project is **on track** with all milestones met.

## Tasks
- [x] Design phase
- [x] Implementation
- [ ] Testing
- [ ] Deployment

## Metrics
| Metric | Value | Target |
| --- | --- | --- |
| Coverage | 85% | 80% |
| Performance | 92ms | 100ms |
      `;

      const rendered = await lip.RenderMD(markdown, 'dark');

      await lip.createStyle({
        id: 'report-container',
        border: { type: 'double', foreground: '#00FF00', sides: [true] },
        padding: [2, 4],
        margin: [1]
      });

      const result = await lip.apply({ value: rendered, id: 'report-container' });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should create nested layouts', async () => {
      // Create grid-like layout
      await lip.createStyle({
        id: 'cell',
        border: { type: 'rounded', foreground: '#888', sides: [true] },
        padding: [1, 2],
        margin: [0],
        width: 15,
        height: 5,
        alignV: 'center'
      });

      // Create cells
      const cells = await Promise.all(Array.from({ length: 6 }, async (_, i) => 
        await lip.apply({ value: `Cell ${i + 1}`, id: 'cell' })
      ));

      // Create rows
      const row1 = await lip.join({
        direction: 'horizontal',
        position: 'center',
        elements: cells.slice(0, 3)
      });

      const row2 = await lip.join({
        direction: 'horizontal',
        position: 'center',
        elements: cells.slice(3, 6)
      });

      // Combine rows
      const grid = await lip.join({
        direction: 'vertical',
        position: 'center',
        elements: [row1, row2]
      });

      expect(grid).toBeDefined();
      expect(typeof grid).toBe('string');
    });
  });

  describe('Mixed Content Types', () => {
    it('should handle mixed Unicode and ASCII content', async () => {
      const mixedData = {
        headers: ['English', '中文', '日本語', 'العربية'],
        rows: [
          ['Hello', '你好', 'こんにちは', 'مرحبا'],
          ['World', '世界', '世界', 'عالم'],
          ['Test', '测试', 'テスト', 'اختبار']
        ]
      };

      const table = await lip.newTable({
        data: mixedData,
        table: { border: 'rounded', color: '99', width: 100 }
      });

      await lip.createStyle({
        id: 'unicode-container',
        padding: [2, 3],
        margin: [1]
      });

      const result = await lip.apply({ value: table, id: 'unicode-container' });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle content with ANSI codes', async () => {
      // Create content that might contain ANSI codes
      const list = await lip.List({
        data: [
          '\x1b[31mRed Item\x1b[0m',
          '\x1b[32mGreen Item\x1b[0m',
          '\x1b[34mBlue Item\x1b[0m'
        ],
        selected: [],
        listStyle: 'arabic',
        styles: { numeratorColor: '99', itemColor: '255', marginRight: 2 }
      });

      expect(list).toBeDefined();
      expect(typeof list).toBe('string');
    });

    it('should handle very large combined content', async () => {
      // Create large table
      const largeData = {
        headers: Array.from({ length: 10 }, (_, i) => `Col${i + 1}`),
        rows: Array.from({ length: 100 }, (_, i) => 
          Array.from({ length: 10 }, (_, j) => `R${i}C${j}`)
        )
      };

      const table = await lip.newTable({
        data: largeData,
        table: { border: 'rounded', color: '99', width: 200, height: 50 }
      });

      // Create large list
      const list = await lip.List({
        data: Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`),
        selected: [],
        listStyle: 'arabic',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 1 }
      });

      // Combine
      const combined = await lip.join({
        direction: 'horizontal',
        position: 'top',
        elements: [list, table]
      });

      expect(combined).toBeDefined();
      expect(typeof combined).toBe('string');
    });
  });

  describe('Forms with Styling', () => {
    it('should style form input prompts', async () => {
      const input = new huh.NewInput({
        Title: '📝 Enter your name',
        Description: 'Please provide your full name',
        Placeholder: 'John Doe',
        validators: 'required'
      }, 0);

      const loaded = input.load();
      expect(loaded).toBeDefined();

      // Create styled prompt
      await lip.createStyle({
        id: 'prompt',
        canvasColor: { color: '#00FF00' },
        bold: true,
        padding: [1, 2],
        margin: [0]
      });

      const prompt = await lip.apply({ 
        value: `${input.props.Title}\n${input.props.Description}`, 
        id: 'prompt' 
      });

      expect(prompt).toBeDefined();
      expect(typeof prompt).toBe('string');
    });

    it('should create a styled form workflow', async () => {
      // Create form elements
      const confirm = huh.Confirm('Save changes?', 'Yes', 'No');
      const select = huh.Select('Choose priority', ['Low', 'Medium', 'High']);
      
      // Create styles for form elements
      await lip.createStyle({
        id: 'form-container',
        border: { type: 'rounded', foreground: '#0066CC', sides: [true] },
        padding: [2, 4],
        margin: [1, 0]
      });

      // Mock form display
      const formDisplay = `
Confirmation: Save changes? [Yes/No]
Priority: Choose from [Low, Medium, High]
      `.trim();

      const styledForm = await lip.apply({ value: formDisplay, id: 'form-container' });

      expect(styledForm).toBeDefined();
      expect(typeof styledForm).toBe('string');
    });
  });

  describe('Theme Variations', () => {
    it('should apply different themes to content', async () => {
      const themes: Array<'dracula' | 'Charm' | 'Catppuccin' | 'Base16' | 'default'> = 
        ['dracula', 'Charm', 'Catppuccin', 'Base16', 'default'];

      for (const theme of themes) {
        huh.SetTheme(theme);

        const list = await lip.List({
          data: ['Item 1', 'Item 2', 'Item 3'],
          selected: ['Item 2'],
          listStyle: 'arabic',
          styles: { numeratorColor: '99', itemColor: '212', marginRight: 2 }
        });

        expect(list).toBeDefined();
        expect(typeof list).toBe('string');
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid style creation', async () => {
      const start = Date.now();
      
      for (let i = 0; i < 100; i++) {
        await lip.createStyle({
          id: `perf-style-${i}`,
          canvasColor: { color: `#${i.toString(16).padStart(6, '0')}` },
          margin: [0]
        });
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle rapid apply operations', async () => {
      await lip.createStyle({
        id: 'perf-apply',
        canvasColor: { color: '#FF0000' },
        margin: [0]
      });

      const start = Date.now();
      
      for (let i = 0; i < 100; i++) {
        const result = await lip.apply({ 
          value: `Performance test ${i}`, 
          id: 'perf-apply' 
        });
        expect(result).toBeDefined();
      }
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000); // Should complete in less than 2 seconds
    });

    it('should handle large join operations efficiently', async () => {
      await lip.createStyle({
        id: 'perf-join',
        padding: [1],
        margin: [0]
      });

      const elements = await Promise.all(Array.from({ length: 50 }, async (_, i) => 
        await lip.apply({ value: `Element ${i}`, id: 'perf-join' })
      ));

      const start = Date.now();
      
      const result = await lip.join({
        direction: 'vertical',
        position: 'left',
        elements
      });
      
      const duration = Date.now() - start;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});