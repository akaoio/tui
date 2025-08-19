import { Lipgloss } from '../../src/lipgloss';

describe('Lipgloss Tables and Lists', () => {
  let lip: Lipgloss;

  beforeEach(() => {
    lip = new Lipgloss();
  });

  describe('newTable', () => {
    it('should create a basic table', async () => {
      const tableData = {
        headers: ['Name', 'Age', 'City'],
        rows: [
          ['Alice', '30', 'New York'],
          ['Bob', '25', 'Los Angeles'],
          ['Charlie', '35', 'Chicago']
        ]
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99', width: 100 }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle different border types', async () => {
      const borderTypes: Array<'rounded' | 'block' | 'thick' | 'double'> = 
        ['rounded', 'block', 'thick', 'double'];
      
      const tableData = {
        headers: ['Col1', 'Col2'],
        rows: [['Val1', 'Val2']]
      };

      for (const border of borderTypes) {
        const result = await lip.newTable({
          data: tableData,
          table: { border, color: '99' }
        });
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }
    });

    it('should handle table with header styling', async () => {
      const tableData = {
        headers: ['Product', 'Price', 'Stock'],
        rows: [
          ['Laptop', '$999', '10'],
          ['Mouse', '$25', '50']
        ]
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99', width: 80 },
        header: { color: '212', bold: true }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle table with row styling', async () => {
      const tableData = {
        headers: ['ID', 'Name', 'Status'],
        rows: [
          ['1', 'Task A', 'Complete'],
          ['2', 'Task B', 'Pending'],
          ['3', 'Task C', 'Complete'],
          ['4', 'Task D', 'Failed']
        ]
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99' },
        rows: {
          even: { color: '246' },
          odd: { color: '250' }
        }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty table', async () => {
      const tableData = {
        headers: [],
        rows: []
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99' }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle table with only headers', async () => {
      const tableData = {
        headers: ['Col1', 'Col2', 'Col3'],
        rows: []
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99' }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle table with Unicode content', async () => {
      const tableData = {
        headers: ['Language', 'Greeting', 'Emoji'],
        rows: [
          ['中文', '你好', '🇨🇳'],
          ['日本語', 'こんにちは', '🇯🇵'],
          ['العربية', 'مرحبا', '🇸🇦'],
          ['Español', 'Hola', '🇪🇸']
        ]
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99', width: 120 }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle table with special characters', async () => {
      const tableData = {
        headers: ['Symbol', 'Name', 'Value'],
        rows: [
          ['&', 'Ampersand', '&#38;'],
          ['<', 'Less than', '&lt;'],
          ['>', 'Greater than', '&gt;'],
          ['"', 'Quote', '&quot;']
        ]
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99' }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle table with very long content', async () => {
      const longText = 'A'.repeat(100);
      const tableData = {
        headers: ['Short', 'Long'],
        rows: [
          ['OK', longText],
          ['Fine', 'Normal text']
        ]
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99', width: 200 }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle table with height constraint', async () => {
      const tableData = {
        headers: ['ID', 'Value'],
        rows: Array.from({ length: 20 }, (_, i) => [String(i), `Value ${i}`])
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99', width: 50, height: 10 }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('List', () => {
    it('should create a simple list with asterisk style', async () => {
      const result = await lip.List({
        data: ['Item 1', 'Item 2', 'Item 3'],
        selected: [],
        listStyle: 'asterisk',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 2 }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create list with different styles', async () => {
      const listStyles: Array<'alphabet' | 'arabic' | 'asterisk' | 'custom'> = 
        ['alphabet', 'arabic', 'asterisk', 'custom'];

      for (const listStyle of listStyles) {
        const result = await lip.List({
          data: ['First', 'Second', 'Third'],
          selected: [],
          listStyle,
          customEnum: listStyle === 'custom' ? '→' : undefined,
          styles: { numeratorColor: '99', itemColor: '212', marginRight: 1 }
        });
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }
    });

    it('should handle selected items', async () => {
      const result = await lip.List({
        data: ['Option A', 'Option B', 'Option C', 'Option D'],
        selected: ['Option B', 'Option D'],
        listStyle: 'arabic',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 2 }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle custom enumerator', async () => {
      const customEnums = ['→', '▶', '●', '◆', '★'];
      
      for (const customEnum of customEnums) {
        const result = await lip.List({
          data: ['Item 1', 'Item 2'],
          selected: [],
          listStyle: 'custom',
          customEnum,
          styles: { numeratorColor: '99', itemColor: '212', marginRight: 1 }
        });
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }
    });

    it('should handle empty list', async () => {
      const result = await lip.List({
        data: [],
        selected: [],
        listStyle: 'asterisk',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 1 }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle list with Unicode items', async () => {
      const result = await lip.List({
        data: ['🔥 Fire', '💧 Water', '🌍 Earth', '💨 Air'],
        selected: ['🔥 Fire'],
        listStyle: 'arabic',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 2 }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle different margin configurations', async () => {
      const margins = [0, 1, 2, 4, 8];
      
      for (const marginRight of margins) {
        const result = await lip.List({
          data: ['A', 'B', 'C'],
          selected: [],
          listStyle: 'arabic',
          styles: { numeratorColor: '99', itemColor: '212', marginRight }
        });
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }
    });

    it('should handle very long list items', async () => {
      const longItem = 'This is a very long list item that contains a lot of text '.repeat(5);
      const result = await lip.List({
        data: ['Short', longItem, 'Another short'],
        selected: [],
        listStyle: 'arabic',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 2 }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle special characters in list items', async () => {
      const result = await lip.List({
        data: [
          'Item with "quotes"',
          'Item with \'apostrophes\'',
          'Item with <brackets>',
          'Item with &ampersand'
        ],
        selected: [],
        listStyle: 'arabic',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 1 }
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('RenderMD', () => {
    it('should render basic markdown', async () => {
      const markdown = '# Hello World\n\nThis is a **bold** text and this is *italic*.';
      const result = await lip.RenderMD(markdown, 'dark');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle different markdown styles', async () => {
      const styles: Array<'dark' | 'light' | 'dracula' | 'notty' | 'tokyo-night' | 'ascii'> = 
        ['dark', 'light', 'dracula', 'notty', 'tokyo-night', 'ascii'];
      
      const markdown = '## Test\n\nSample text';

      for (const style of styles) {
        const result = await lip.RenderMD(markdown, style);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }
    });

    it('should render markdown with tables', async () => {
      const markdown = `
# Table Example

| Column 1 | Column 2 | Column 3 |
| --- | --- | --- |
| A | B | C |
| D | E | F |
      `;
      
      const result = await lip.RenderMD(markdown, 'dark');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should render markdown with code blocks', async () => {
      const markdown = `
# Code Example

\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`

Inline code: \`const x = 10;\`
      `;
      
      const result = await lip.RenderMD(markdown, 'dark');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should render markdown with lists', async () => {
      const markdown = `
# Lists

## Unordered
- Item 1
- Item 2
  - Nested 2.1
  - Nested 2.2
- Item 3

## Ordered
1. First
2. Second
3. Third
      `;
      
      const result = await lip.RenderMD(markdown, 'dark');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty markdown', async () => {
      const result = await lip.RenderMD('', 'dark');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle markdown with links', async () => {
      const markdown = 'Check out [GitHub](https://github.com) and [npm](https://npmjs.com)';
      const result = await lip.RenderMD(markdown, 'dark');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle markdown with blockquotes', async () => {
      const markdown = `
> This is a blockquote
> with multiple lines
>
> And another paragraph
      `;
      
      const result = await lip.RenderMD(markdown, 'dark');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle markdown with horizontal rules', async () => {
      const markdown = `
Content above

---

Content below

***

Another section
      `;
      
      const result = await lip.RenderMD(markdown, 'dark');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});