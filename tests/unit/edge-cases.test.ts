import { Lipgloss } from '../../src/lipgloss';
import * as huh from '../../src/fields';

describe('Edge Cases and Error Handling', () => {
  let lip: Lipgloss;

  beforeEach(() => {
    lip = new Lipgloss();
  });

  describe('Boundary Values', () => {
    it('should handle zero dimensions', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'zero-dimensions',
          width: 0,
          height: 0,
          margin: [0]
        });
      }).not.toThrow();

      const result = await lip.apply({ value: 'Test', id: 'zero-dimensions' });
      expect(result).toBeDefined();
    });

    it('should handle negative margins gracefully', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'negative-margin',
          margin: [-1, -2, -3, -4]
        });
      }).not.toThrow();
    });

    it('should handle negative padding gracefully', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'negative-padding',
          padding: [-1, -2, -3, -4],
          margin: [0]
        });
      }).not.toThrow();
    });

    it('should handle extremely large dimensions', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'huge-dimensions',
          width: 999999,
          height: 999999,
          maxWidth: 9999999,
          maxHeight: 9999999,
          margin: [0]
        });
      }).not.toThrow();

      const result = await lip.apply({ value: 'Test', id: 'huge-dimensions' });
      expect(result).toBeDefined();
    });

    it('should handle maximum integer values', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'max-int',
          width: Number.MAX_SAFE_INTEGER,
          height: Number.MAX_SAFE_INTEGER,
          margin: [0]
        });
      }).not.toThrow();
    });

    it('should handle floating point dimensions', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'float-dimensions',
          width: 10.5,
          height: 20.7,
          padding: [1.5, 2.3],
          margin: [0.5]
        });
      }).not.toThrow();
    });
  });

  describe('Invalid Input Handling', () => {
    it('should handle null values gracefully', async () => {
      const result = await lip.apply({ value: null as any });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle undefined values gracefully', async () => {
      const result = await lip.apply({ value: undefined as any });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle non-string values', async () => {
      const values = [123, true, false, {}, [], Symbol('test')];
      
      for (const value of values) {
        const result = await lip.apply({ value: value as any });
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }
    });

    it('should handle non-existent style ID', async () => {
      const result = await lip.apply({ 
        value: 'Test', 
        id: 'non-existent-style-id-that-does-not-exist' 
      });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle invalid color values', async () => {
      const invalidColors = [
        'not-a-color',
        '#GGGGGG',
        '#12',
        'rgb(999, 999, 999)',
        '###FFF',
        '12345678'
      ];

      for (const [index, color] of invalidColors.entries()) {
        await expect(async () => {
          await lip.createStyle({
            id: `invalid-color-${index}`,
            canvasColor: { color },
            margin: [0]
          });
        }).not.toThrow();
      }
    });

    it('should handle invalid border configurations', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'invalid-border',
          border: {
            type: 'invalid-type' as any,
            sides: [true, false, 'maybe' as any, null as any]
          },
          margin: [0]
        });
      }).not.toThrow();
    });

    it('should handle incomplete style objects', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'incomplete',
          // Missing required margin field
        } as any);
      }).not.toThrow();
    });
  });

  describe('Special Characters and Encoding', () => {
    it('should handle null bytes in strings', async () => {
      const nullByteString = 'Test\0String\0With\0Nulls';
      const result = await lip.apply({ value: nullByteString });
      expect(result).toBeDefined();
    });

    it('should handle control characters', async () => {
      const controlChars = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F';
      const result = await lip.apply({ value: controlChars });
      expect(result).toBeDefined();
    });

    it('should handle RTL (Right-to-Left) text', async () => {
      const rtlText = 'مرحبا بالعالم'; // Arabic
      const hebrewText = 'שלום עולם'; // Hebrew
      
      const result1 = await lip.apply({ value: rtlText });
      const result2 = await lip.apply({ value: hebrewText });
      
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('should handle emoji combinations', async () => {
      const emojis = [
        '👨‍👩‍👧‍👦', // Family
        '🏳️‍🌈', // Rainbow flag
        '👨🏻‍💻', // Man technologist with skin tone
        '🧑‍🤝‍🧑', // People holding hands
      ];

      for (const emoji of emojis) {
        const result = await lip.apply({ value: emoji });
        expect(result).toBeDefined();
      }
    });

    it('should handle zero-width characters', async () => {
      const zeroWidth = 'Test\u200B\u200C\u200DString';
      const result = await lip.apply({ value: zeroWidth });
      expect(result).toBeDefined();
    });

    it('should handle surrogate pairs', async () => {
      const surrogates = '𝐇𝐞𝐥𝐥𝐨 𝕎𝕠𝕣𝕝𝕕'; // Mathematical bold/double-struck
      const result = await lip.apply({ value: surrogates });
      expect(result).toBeDefined();
    });
  });

  describe('Memory and Resource Management', () => {
    it('should handle creating many styles without memory issues', async () => {
      for (let i = 0; i < 1000; i++) {
        await lip.createStyle({
          id: `memory-test-${i}`,
          canvasColor: { color: '#FF0000' },
          margin: [0]
        });
      }
      
      // Should not throw or crash
      const result = await lip.apply({ value: 'Test', id: 'memory-test-999' });
      expect(result).toBeDefined();
    });

    it('should handle very deep nesting', async () => {
      await lip.createStyle({
        id: 'nested',
        padding: [1],
        margin: [0]
      });

      let current = await lip.apply({ value: 'Core', id: 'nested' });
      
      // Create deeply nested structure
      for (let i = 0; i < 100; i++) {
        const wrapper = await lip.apply({ value: current, id: 'nested' });
        current = await lip.join({
          direction: 'vertical',
          position: 'center',
          elements: [wrapper]
        });
      }
      
      expect(current).toBeDefined();
      expect(typeof current).toBe('string');
    });

    it('should handle circular-like references in joins', async () => {
      const element = await lip.apply({ value: 'Element' });
      
      // Create structure that references same element multiple times
      const row1 = await lip.join({
        direction: 'horizontal',
        position: 'left',
        elements: [element, element, element]
      });
      
      const row2 = await lip.join({
        direction: 'horizontal',
        position: 'left',
        elements: [element, element, element]
      });
      
      const combined = await lip.join({
        direction: 'vertical',
        position: 'top',
        elements: [row1, row2, row1, row2] // Reusing same rows
      });
      
      expect(combined).toBeDefined();
    });
  });

  describe('Table Edge Cases', () => {
    it('should handle mismatched column counts', async () => {
      const tableData = {
        headers: ['Col1', 'Col2', 'Col3'],
        rows: [
          ['A'],                    // 1 column
          ['B', 'C'],              // 2 columns
          ['D', 'E', 'F'],         // 3 columns
          ['G', 'H', 'I', 'J']     // 4 columns
        ]
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99' }
      });

      expect(result).toBeDefined();
    });

    it('should handle headers without rows', async () => {
      const tableData = {
        headers: ['Header1', 'Header2', 'Header3'],
        rows: []
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99' }
      });

      expect(result).toBeDefined();
    });

    it('should handle rows without headers', async () => {
      const tableData = {
        headers: [],
        rows: [['A', 'B'], ['C', 'D']]
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99' }
      });

      expect(result).toBeDefined();
    });

    it('should handle table with only empty strings', async () => {
      const tableData = {
        headers: ['', '', ''],
        rows: [
          ['', '', ''],
          ['', '', '']
        ]
      };

      const result = await lip.newTable({
        data: tableData,
        table: { border: 'rounded', color: '99' }
      });

      expect(result).toBeDefined();
    });
  });

  describe('List Edge Cases', () => {
    it('should handle list with duplicate items', async () => {
      const result = await lip.List({
        data: ['Item', 'Item', 'Item', 'Item'],
        selected: ['Item'],
        listStyle: 'arabic',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 1 }
      });

      expect(result).toBeDefined();
    });

    it('should handle selected items that do not exist', async () => {
      const result = await lip.List({
        data: ['A', 'B', 'C'],
        selected: ['D', 'E', 'F'],
        listStyle: 'arabic',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 1 }
      });

      expect(result).toBeDefined();
    });

    it('should handle list with only empty strings', async () => {
      const result = await lip.List({
        data: ['', '', '', ''],
        selected: [''],
        listStyle: 'arabic',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 1 }
      });

      expect(result).toBeDefined();
    });

    it('should handle list with mixed empty and non-empty items', async () => {
      const result = await lip.List({
        data: ['Item 1', '', 'Item 3', '', 'Item 5'],
        selected: ['', 'Item 3'],
        listStyle: 'arabic',
        styles: { numeratorColor: '99', itemColor: '212', marginRight: 1 }
      });

      expect(result).toBeDefined();
    });
  });

  describe('Join Edge Cases', () => {
    it('should handle join with empty string elements', async () => {
      const result = await lip.join({
        direction: 'horizontal',
        position: 'left',
        elements: ['', '', '']
      });

      expect(result).toBeDefined();
    });

    it('should handle join with single empty element', async () => {
      const result = await lip.join({
        direction: 'vertical',
        position: 'center',
        elements: ['']
      });

      expect(result).toBeDefined();
    });

    it('should handle join with mixed empty and non-empty elements', async () => {
      const result = await lip.join({
        direction: 'horizontal',
        position: 'left',
        elements: ['A', '', 'B', '', 'C']
      });

      expect(result).toBeDefined();
    });

    it('should handle join with very many elements', async () => {
      const elements = Array.from({ length: 1000 }, (_, i) => `E${i}`);
      
      const result = await lip.join({
        direction: 'vertical',
        position: 'left',
        elements
      });

      expect(result).toBeDefined();
    });
  });

  describe('Markdown Edge Cases', () => {
    it('should handle malformed markdown', async () => {
      const malformed = '### Heading without proper spacing\n**Unclosed bold\n*Unclosed italic';
      const result = await lip.RenderMD(malformed, 'dark');
      expect(result).toBeDefined();
    });

    it('should handle markdown with only special characters', async () => {
      const special = '### ### *** --- ``` ~~~';
      const result = await lip.RenderMD(special, 'dark');
      expect(result).toBeDefined();
    });

    it('should handle deeply nested markdown lists', async () => {
      const nested = `
- Level 1
  - Level 2
    - Level 3
      - Level 4
        - Level 5
          - Level 6
            - Level 7
              - Level 8
                - Level 9
                  - Level 10
      `;
      
      const result = await lip.RenderMD(nested, 'dark');
      expect(result).toBeDefined();
    });

    it('should handle markdown with invalid code fence languages', async () => {
      const markdown = `
\`\`\`not-a-real-language
code here
\`\`\`
      `;
      
      const result = await lip.RenderMD(markdown, 'dark');
      expect(result).toBeDefined();
    });

    it('should handle markdown with broken table syntax', async () => {
      const markdown = `
| Col1 | Col2
| --- 
| Data1 | Data2 | Data3 |
| Data4
      `;
      
      const result = await lip.RenderMD(markdown, 'dark');
      expect(result).toBeDefined();
    });
  });

  describe('Concurrency and Race Conditions', () => {
    it('should handle concurrent style applications', async () => {
      await lip.createStyle({
        id: 'concurrent',
        canvasColor: { color: '#FF0000' },
        margin: [0]
      });

      const promises = Array.from({ length: 100 }, (_, i) => 
        lip.apply({ value: `Concurrent ${i}`, id: 'concurrent' })
      );

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });

    it('should handle rapid style creation and deletion', async () => {
      for (let i = 0; i < 100; i++) {
        await lip.createStyle({
          id: 'rapid',
          canvasColor: { color: '#00FF00' },
          margin: [0]
        });
        
        const result = await lip.apply({ value: 'Test', id: 'rapid' });
        expect(result).toBeDefined();
        
        // Overwrite with new style
        await lip.createStyle({
          id: 'rapid',
          canvasColor: { color: '#FF0000' },
          margin: [0]
        });
      }
    });
  });
});