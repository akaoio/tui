import {
  bold,
  dim,
  italic,
  underline,
  blink,
  reverse,
  hidden,
  strikethrough,
  style,
  centerText,
  truncate,
  drawBox
} from '../../src/utils/styles';

describe('Styles Utils', () => {
  describe('Text Styles', () => {
    it('should apply bold style', () => {
      const result = bold('text');
      expect(result).toBe('\x1b[1mtext\x1b[22m');
    });

    it('should apply dim style', () => {
      const result = dim('text');
      expect(result).toBe('\x1b[2mtext\x1b[22m');
    });

    it('should apply italic style', () => {
      const result = italic('text');
      expect(result).toBe('\x1b[3mtext\x1b[23m');
    });

    it('should apply underline style', () => {
      const result = underline('text');
      expect(result).toBe('\x1b[4mtext\x1b[24m');
    });

    it('should apply blink style', () => {
      const result = blink('text');
      expect(result).toBe('\x1b[5mtext\x1b[25m');
    });

    it('should apply reverse style', () => {
      const result = reverse('text');
      expect(result).toBe('\x1b[7mtext\x1b[27m');
    });

    it('should apply hidden style', () => {
      const result = hidden('text');
      expect(result).toBe('\x1b[8mtext\x1b[28m');
    });

    it('should apply strikethrough style', () => {
      const result = strikethrough('text');
      expect(result).toBe('\x1b[9mtext\x1b[29m');
    });
  });

  describe('Combined Styles', () => {
    it('should apply multiple styles', () => {
      const result = style('text', ['bold', 'underline']);
      expect(result).toContain('\x1b[1m');
      expect(result).toContain('\x1b[4m');
    });

    it('should apply single style via array', () => {
      const result = style('text', ['italic']);
      expect(result).toBe('\x1b[3mtext\x1b[0m');
    });

    it('should handle empty styles array', () => {
      const result = style('text', []);
      expect(result).toBe('text');
    });

    it('should handle unknown styles', () => {
      const result = style('text', ['unknown' as any]);
      expect(result).toBe('text');
    });

    it('should reset after combined styles', () => {
      const result = style('text', ['bold', 'italic', 'underline']);
      expect(result).toContain('\x1b[0m');
    });
  });

  describe('Text Alignment', () => {
    it('should center text', () => {
      const result = centerText('hello', 10);
      expect(result).toBe('  hello   ');
      expect(result.length).toBe(10);
    });

    it('should center text with odd padding', () => {
      const result = centerText('hi', 7);
      expect(result).toBe('  hi   ');
      expect(result.length).toBe(7);
    });

    it('should handle text longer than width', () => {
      const result = centerText('verylongtext', 5);
      expect(result).toBe('verylongtext');
    });

    it('should handle empty text', () => {
      const result = centerText('', 10);
      expect(result).toBe('          ');
      expect(result.length).toBe(10);
    });

    it('should handle zero width', () => {
      const result = centerText('text', 0);
      expect(result).toBe('text');
    });

    it('should handle negative width', () => {
      const result = centerText('text', -5);
      expect(result).toBe('text');
    });
  });

  describe('Text Truncation', () => {
    it('should truncate long text', () => {
      const result = truncate('This is a long text', 10);
      expect(result).toBe('This is...');
      expect(result.length).toBe(10); // 7 chars + '...'
    });

    it('should not truncate short text', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });

    it('should handle exact length', () => {
      const result = truncate('Exactly10!', 10);
      expect(result).toBe('Exactly10!');
    });

    it('should handle custom ellipsis', () => {
      const result = truncate('This is a long text', 10, '…');
      expect(result).toBe('This is a…');
    });

    it('should handle very small max length', () => {
      const result = truncate('Text', 1);
      expect(result).toBe('...');
    });

    it('should handle empty text', () => {
      const result = truncate('', 10);
      expect(result).toBe('');
    });

    it('should handle zero max length', () => {
      const result = truncate('Text', 0);
      expect(result).toBe('...');
    });
  });

  describe('Box Drawing', () => {
    it('should draw a simple box', () => {
      const result = drawBox(5, 3);
      const lines = result.split('\n');
      
      expect(lines).toHaveLength(3);
      expect(lines[0]).toBe('┌───┐');
      expect(lines[1]).toBe('│   │');
      expect(lines[2]).toBe('└───┘');
    });

    it('should draw box with custom style', () => {
      const result = drawBox(4, 3, 'double');
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('╔══╗');
      expect(lines[1]).toBe('║  ║');
      expect(lines[2]).toBe('╚══╝');
    });

    it('should draw rounded box', () => {
      const result = drawBox(4, 3, 'rounded');
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('╭──╮');
      expect(lines[1]).toBe('│  │');
      expect(lines[2]).toBe('╰──╯');
    });

    it('should draw bold box', () => {
      const result = drawBox(4, 3, 'bold');
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('┏━━┓');
      expect(lines[1]).toBe('┃  ┃');
      expect(lines[2]).toBe('┗━━┛');
    });

    it('should handle minimum size box', () => {
      const result = drawBox(2, 2);
      const lines = result.split('\n');
      
      expect(lines).toHaveLength(2);
      expect(lines[0]).toBe('┌┐');
      expect(lines[1]).toBe('└┘');
    });

    it('should handle single row box', () => {
      const result = drawBox(5, 1);
      expect(result).toBe('─────');
    });

    it('should handle single column box', () => {
      const result = drawBox(1, 3);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('│');
      expect(lines[1]).toBe('│');
      expect(lines[2]).toBe('│');
    });

    it('should handle unknown box style', () => {
      const result = drawBox(4, 3, 'unknown' as any);
      const lines = result.split('\n');
      
      // Should default to single style
      expect(lines[0]).toBe('┌──┐');
      expect(lines[1]).toBe('│  │');
      expect(lines[2]).toBe('└──┘');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined text in styles', () => {
      expect(bold(null as any)).toBe('\x1b[1mnull\x1b[22m');
      expect(italic(undefined as any)).toBe('\x1b[3mundefined\x1b[23m');
    });

    it('should handle empty string in styles', () => {
      expect(bold('')).toBe('\x1b[1m\x1b[22m');
      expect(underline('')).toBe('\x1b[4m\x1b[24m');
    });

    it('should handle numbers in styles', () => {
      expect(bold(123 as any)).toBe('\x1b[1m123\x1b[22m');
    });

    it('should handle very long text in center', () => {
      const longText = 'a'.repeat(1000);
      const result = centerText(longText, 10);
      expect(result).toBe(longText);
    });

    it('should handle unicode in styles', () => {
      const result = bold('Hello 世界 🌍');
      expect(result).toBe('\x1b[1mHello 世界 🌍\x1b[22m');
    });

    it('should handle ANSI codes in input', () => {
      const coloredText = '\x1b[31mRed Text\x1b[0m';
      const result = bold(coloredText);
      expect(result).toContain('\x1b[1m');
      expect(result).toContain('\x1b[31m');
    });

    it('should handle zero dimensions in drawBox', () => {
      expect(drawBox(0, 0)).toBe('');
      expect(drawBox(5, 0)).toBe('');
      expect(drawBox(0, 5)).toBe('');
    });

    it('should handle negative dimensions in drawBox', () => {
      expect(drawBox(-5, 3)).toBe('');
      expect(drawBox(5, -3)).toBe('');
    });
  });
});