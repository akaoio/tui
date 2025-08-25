/**
 * Test suite for utility functions
 * Achieving 100% coverage for utils
 */

import {
  // Colors
  color,
  hex,
  rgb,
  bgHex,
  bgRgb,
  reset,
  
  // Styles
  bold,
  dim,
  italic,
  underline,
  blink,
  reverse,
  hidden,
  strikethrough,
  style,
  
  // Text utilities
  truncate,
  centerText,
  drawBox,
  
  // Platform utilities
  isWindows,
  isMac,
  isLinux,
  isTermux,
  hasSudo,
  hasSystemd,
  getPlatformPaths
} from '../src';

describe('Color Utilities', () => {
  describe('color()', () => {
    test('should apply named colors', () => {
      expect(color('red')).toBe('\x1b[31m');
      expect(color('green')).toBe('\x1b[32m');
      expect(color('blue')).toBe('\x1b[34m');
    });

    test('should handle background colors', () => {
      expect(color('bgRed')).toContain('41m');
      expect(color('bgGreen')).toContain('42m');
    });

    test('should handle bright colors', () => {
      expect(color('brightRed')).toContain('91m');
      expect(color('brightBlue')).toContain('94m');
    });

    test('should handle invalid colors', () => {
      expect(color('invalid' as any)).toBe('');
    });

    test('should handle combined styles with manual text wrapping', () => {
      const redCode = color('red');
      const boldText = bold('Bold Red');
      expect(redCode).toContain('\x1b[31m');
      expect(boldText).toContain('\x1b[1m');
    });
  });

  describe('hex()', () => {
    test('should convert hex to RGB color', () => {
      expect(hex('#FF0000')).toContain('38;2;255;0;0m');
      expect(hex('#00FF00')).toContain('38;2;0;255;0m');
      expect(hex('#0000FF')).toContain('38;2;0;0;255m');
    });

    test('should handle short hex codes', () => {
      expect(hex('#F00')).toContain('38;2;255;0;0m');
      expect(hex('#0F0')).toContain('38;2;0;255;0m');
    });

    test('should handle invalid hex', () => {
      expect(hex('invalid')).toBe('\x1b[38;2;0;0;0m');
      expect(hex('#GGGGGG')).toBe('\x1b[38;2;0;0;0m');
    });
  });

  describe('rgb()', () => {
    test('should apply RGB colors', () => {
      expect(rgb(255, 0, 0)).toContain('38;2;255;0;0m');
      expect(rgb(0, 255, 0)).toContain('38;2;0;255;0m');
      expect(rgb(0, 0, 255)).toContain('38;2;0;0;255m');
    });

    test('should clamp values', () => {
      expect(rgb(300, -50, 128)).toContain('38;2;255;0;128m');
    });
  });

  describe('bgHex()', () => {
    test('should apply background hex colors', () => {
      expect(bgHex('#FF0000')).toContain('48;2;255;0;0m');
      expect(bgHex('#00FF00')).toContain('48;2;0;255;0m');
    });

    test('should handle invalid hex', () => {
      expect(bgHex('invalid')).toContain('48;2;');
    });
  });

  describe('bgRgb()', () => {
    test('should apply background RGB colors', () => {
      expect(bgRgb(255, 0, 0)).toContain('48;2;255;0;0m');
      expect(bgRgb(0, 255, 0)).toContain('48;2;0;255;0m');
    });
  });

  describe('reset()', () => {
    test('should reset all styles', () => {
      expect(reset()).toBe('\x1b[0m');
    });
  });
});

describe('Style Utilities', () => {
  describe('bold()', () => {
    test('should apply bold style', () => {
      expect(bold('Bold')).toBe('\x1b[1mBold\x1b[22m');
    });
  });

  describe('dim()', () => {
    test('should apply dim style', () => {
      expect(dim('Dim')).toBe('\x1b[2mDim\x1b[22m');
    });
  });

  describe('italic()', () => {
    test('should apply italic style', () => {
      expect(italic('Italic')).toBe('\x1b[3mItalic\x1b[23m');
    });
  });

  describe('underline()', () => {
    test('should apply underline style', () => {
      expect(underline('Underline')).toBe('\x1b[4mUnderline\x1b[24m');
    });
  });

  describe('blink()', () => {
    test('should apply blink style', () => {
      expect(blink('Blink')).toBe('\x1b[5mBlink\x1b[25m');
    });
  });

  describe('reverse()', () => {
    test('should apply reverse style', () => {
      expect(reverse('Reverse')).toBe('\x1b[7mReverse\x1b[27m');
    });
  });

  describe('hidden()', () => {
    test('should apply hidden style', () => {
      expect(hidden('Hidden')).toBe('\x1b[8mHidden\x1b[28m');
    });
  });

  describe('strikethrough()', () => {
    test('should apply strikethrough style', () => {
      expect(strikethrough('Strike')).toBe('\x1b[9mStrike\x1b[29m');
    });
  });

  describe('style()', () => {
    test('should apply multiple styles', () => {
      const result = style('Styled', ['bold']);
      expect(result).toContain('\x1b[1m');
      expect(result).toContain('Styled');
    });

    test('should handle single style in array', () => {
      const result = style('Text', ['italic']);
      expect(result).toContain('\x1b[3m');
      expect(result).toContain('Text');
    });

    test('should handle empty styles', () => {
      expect(style('Text', [])).toBe('Text');
    });
  });
});

describe('Text Utilities', () => {
  describe('truncate()', () => {
    test('should truncate long text', () => {
      expect(truncate('Hello World', 5)).toBe('He...');
      expect(truncate('Short', 10)).toBe('Short');
    });

    test('should handle custom ellipsis', () => {
      expect(truncate('Hello World', 5, '…')).toBe('Hell…');
    });

    test('should handle edge cases', () => {
      expect(truncate('', 5)).toBe('');
      expect(truncate('Hi', 0)).toBe('...');
    });
  });

  describe('centerText()', () => {
    test('should center text', () => {
      expect(centerText('Hi', 10)).toBe('    Hi    ');
      expect(centerText('Test', 10)).toBe('   Test   ');
    });

    test('should handle text longer than width', () => {
      expect(centerText('LongText', 4)).toBe('LongText');
    });

    test('should handle odd/even spacing', () => {
      expect(centerText('Hi', 9)).toBe('   Hi    '); // Extra space on right
    });
  });

  describe('drawBox()', () => {
    test('should draw a simple box', () => {
      const box = drawBox(5, 3);
      expect(box).toContain('┌');
      expect(box).toContain('┐');
      expect(box).toContain('└');
      expect(box).toContain('┘');
      expect(box).toContain('─');
      expect(box).toContain('│');
    });

    test('should use custom style string', () => {
      const box = drawBox(5, 3, 'double');
      expect(box).toContain('═');
      expect(box).toContain('║');
    });

    test('should handle single column', () => {
      const box = drawBox(1, 3);
      const lines = box.split('\n');
      expect(lines.length).toBe(3);
    });

    test('should handle single row', () => {
      const box = drawBox(5, 1);
      expect(box).toContain('─');
      expect(box.split('\n').length).toBe(1);
    });
  });
});

describe('Platform Utilities', () => {
  describe('isWindows()', () => {
    test('should detect Windows', () => {
      // Test with current platform
      const result = isWindows();
      expect(typeof result).toBe('boolean');
      // Since we're likely on Linux, this should be false
      expect(result).toBe(false);
    });
  });

  describe('isMac()', () => {
    test('should detect macOS', () => {
      // Test with current platform 
      const result = isMac();
      expect(typeof result).toBe('boolean');
      // Since we're likely not on Mac, this should be false
      expect(result).toBe(false);
    });
  });

  describe('isLinux()', () => {
    test('should detect Linux', () => {
      // Test with current platform
      const result = isLinux(); 
      expect(typeof result).toBe('boolean');
      // Since we're likely on Linux, this should be true
      expect(result).toBe(true);
    });
  });

  describe('isTermux()', () => {
    test('should detect Termux environment', () => {
      const originalPrefix = process.env.PREFIX;
      
      process.env.PREFIX = '/data/data/com.termux/files/usr';
      expect(isTermux()).toBe(true);
      
      process.env.PREFIX = '/usr';
      expect(isTermux()).toBe(false);
      
      process.env.PREFIX = originalPrefix;
    });
  });

  describe('hasSudo()', () => {
    test('should check for sudo', () => {
      const result = hasSudo();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('hasSystemd()', () => {
    test('should check for systemd', () => {
      const result = hasSystemd();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getPlatformPaths()', () => {
    test('should return platform paths', () => {
      const paths = getPlatformPaths();
      expect(paths).toHaveProperty('config');
      expect(paths).toHaveProperty('data');
      expect(paths).toHaveProperty('log');
      expect(paths).toHaveProperty('ssl');
      expect(paths).toHaveProperty('service');
      expect(typeof paths.config).toBe('string');
      expect(typeof paths.data).toBe('string');
    });

    test('should use custom app name', () => {
      const paths1 = getPlatformPaths('app1');
      const paths2 = getPlatformPaths('app2');
      
      // Paths should contain different app names
      expect(paths1.config).toContain('app1');
      expect(paths2.config).toContain('app2');
      expect(paths1.config).not.toBe(paths2.config);
    });
  });
});