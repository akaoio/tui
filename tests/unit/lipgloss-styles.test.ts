import { Lipgloss } from '../../src/lipgloss';

describe('Lipgloss Styles', () => {
  let lip: Lipgloss;

  beforeEach(() => {
    lip = new Lipgloss();
  });

  describe('createStyle', () => {
    it('should create a basic style', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'test-style',
          margin: [0, 0, 0, 0],
          bold: true
        });
      }).not.toThrow();
    });

    it('should create style with color configuration', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'color-style',
          canvasColor: { 
            color: '#FF0000',
            background: '#00FF00'
          },
          margin: [0]
        });
      }).not.toThrow();
    });

    it('should create style with adaptive colors', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'adaptive-style',
          canvasColor: {
            color: { 
              adaptiveColor: { Light: '#000000', Dark: '#FFFFFF' }
            }
          },
          margin: [0]
        });
      }).not.toThrow();
    });

    it('should create style with complete adaptive colors', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'complete-adaptive',
          canvasColor: {
            color: {
              completeAdaptiveColor: {
                Light: { TrueColor: '#d7ffae', ANSI256: '193', ANSI: '11' },
                Dark: { TrueColor: '#d75fee', ANSI256: '163', ANSI: '5' }
              }
            }
          },
          margin: [0]
        });
      }).not.toThrow();
    });

    it('should create style with complete color', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'complete-color',
          canvasColor: {
            color: {
              completeColor: { TrueColor: '#d7ffae', ANSI256: '193', ANSI: '11' }
            }
          },
          margin: [0]
        });
      }).not.toThrow();
    });

    it('should create style with border configuration', async () => {
      const borderTypes: Array<'rounded' | 'block' | 'thick' | 'double'> = 
        ['rounded', 'block', 'thick', 'double'];

      for (const type of borderTypes) {
        await expect(async () => {
          await lip.createStyle({
            id: `border-${type}`,
            border: {
              type,
              foreground: '#FF0000',
              background: '#00FF00',
              sides: [true, true, true, true]
            },
            margin: [0]
          });
        }).not.toThrow();
      }
    });

    it('should create style with padding variations', async () => {
      const paddingTests = [
        [1],           // All sides
        [1, 2],        // Vertical, Horizontal
        [1, 2, 3, 4]   // Top, Right, Bottom, Left
      ];

      for (const [index, padding] of paddingTests.entries()) {
        await expect(async () => {
          await lip.createStyle({
            id: `padding-${index}`,
            padding,
            margin: [0]
          });
        }).not.toThrow();
      }
    });

    it('should create style with margin variations', async () => {
      const marginTests = [
        [0],           // All sides
        [1, 2],        // Vertical, Horizontal
        [1, 2, 3, 4]   // Top, Right, Bottom, Left
      ];

      for (const [index, margin] of marginTests.entries()) {
        await expect(async () => {
          await lip.createStyle({
            id: `margin-${index}`,
            margin
          });
        }).not.toThrow();
      }
    });

    it('should create style with alignment options', async () => {
      const positions: Array<'bottom' | 'top' | 'left' | 'right' | 'center'> = 
        ['bottom', 'top', 'left', 'right', 'center'];

      for (const pos of positions) {
        await expect(async () => {
          await lip.createStyle({
            id: `align-${pos}`,
            alignV: pos,
            alignH: pos,
            margin: [0]
          });
        }).not.toThrow();
      }
    });

    it('should create style with size constraints', async () => {
      await expect(async () => {
        await lip.createStyle({
          id: 'size-style',
          width: 100,
          height: 50,
          maxWidth: 200,
          maxHeight: 100,
          margin: [0]
        });
      }).not.toThrow();
    });
  });

  describe('apply', () => {
    beforeEach(async () => {
      await lip.createStyle({
        id: 'test-apply',
        canvasColor: { color: '#FF0000' },
        bold: true,
        margin: [0]
      });
    });

    it('should apply style to text', async () => {
      const result = await lip.apply({ value: 'Hello World' });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should apply specific style by ID', async () => {
      const result = await lip.apply({ value: 'Hello World', id: 'test-apply' });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty string', async () => {
      const result = await lip.apply({ value: '' });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle special characters', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;:",.<>?/~`';
      const result = await lip.apply({ value: specialChars });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle Unicode characters', async () => {
      const unicode = '🔥🦾🍕 你好 مرحبا こんにちは';
      const result = await lip.apply({ value: unicode });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle very long text', async () => {
      const longText = 'A'.repeat(1000);
      const result = await lip.apply({ value: longText });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle multiline text', async () => {
      const multiline = 'Line 1\nLine 2\nLine 3';
      const result = await lip.apply({ value: multiline });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle ANSI escape sequences in input', async () => {
      const ansiText = '\x1b[31mRed Text\x1b[0m';
      const result = await lip.apply({ value: ansiText });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('join', () => {
    beforeEach(async () => {
      await lip.createStyle({
        id: 'join-style',
        canvasColor: { color: '#FF0000' },
        margin: [0]
      });
    });

    it('should join elements horizontally', async () => {
      const a = await lip.apply({ value: 'A', id: 'join-style' });
      const b = await lip.apply({ value: 'B', id: 'join-style' });
      const c = await lip.apply({ value: 'C', id: 'join-style' });

      const result = await lip.join({
        direction: 'horizontal',
        position: 'left',
        elements: [a, b, c]
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should join elements vertically', async () => {
      const a = await lip.apply({ value: 'A', id: 'join-style' });
      const b = await lip.apply({ value: 'B', id: 'join-style' });
      const c = await lip.apply({ value: 'C', id: 'join-style' });

      const result = await lip.join({
        direction: 'vertical',
        position: 'top',
        elements: [a, b, c]
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle different positions', async () => {
      const positions: Array<'bottom' | 'top' | 'left' | 'right' | 'center'> = 
        ['bottom', 'top', 'left', 'right', 'center'];
      
      const a = await lip.apply({ value: 'A', id: 'join-style' });
      const b = await lip.apply({ value: 'B', id: 'join-style' });

      for (const position of positions) {
        const result = await lip.join({
          direction: 'horizontal',
          position,
          elements: [a, b]
        });
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }
    });

    it('should handle single element', async () => {
      const a = await lip.apply({ value: 'A', id: 'join-style' });
      
      const result = await lip.join({
        direction: 'horizontal',
        position: 'left',
        elements: [a]
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle empty elements array', async () => {
      const result = await lip.join({
        direction: 'horizontal',
        position: 'left',
        elements: []
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle position code (pc) parameter', async () => {
      const a = await lip.apply({ value: 'A', id: 'join-style' });
      const b = await lip.apply({ value: 'B', id: 'join-style' });

      const result = await lip.join({
        direction: 'horizontal',
        position: 'left',
        elements: [a, b],
        pc: 1
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});