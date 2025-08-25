import { 
  rgb, 
  bgRgb, 
  hex, 
  bgHex, 
  reset, 
  color 
} from '../../src/utils/colors';

describe('Colors Utils', () => {
  describe('RGB Colors', () => {
    it('should create RGB foreground color', () => {
      const result = rgb(255, 0, 0);
      expect(result).toBe('\x1b[38;2;255;0;0m');
    });

    it('should create RGB background color', () => {
      const result = bgRgb(0, 255, 0);
      expect(result).toBe('\x1b[48;2;0;255;0m');
    });

    it('should clamp RGB values', () => {
      const result = rgb(300, -10, 128);
      expect(result).toBe('\x1b[38;2;255;0;128m');
    });

    it('should handle decimal RGB values', () => {
      const result = rgb(127.5, 63.7, 191.2);
      expect(result).toBe('\x1b[38;2;128;64;191m');
    });
  });

  describe('Hex Colors', () => {
    it('should convert hex to RGB foreground', () => {
      const result = hex('#FF0000');
      expect(result).toBe('\x1b[38;2;255;0;0m');
    });

    it('should convert hex to RGB background', () => {
      const result = bgHex('#00FF00');
      expect(result).toBe('\x1b[48;2;0;255;0m');
    });

    it('should handle 3-digit hex codes', () => {
      const result = hex('#F00');
      expect(result).toBe('\x1b[38;2;255;0;0m');
    });

    it('should handle hex without hash', () => {
      const result = hex('FF00FF');
      expect(result).toBe('\x1b[38;2;255;0;255m');
    });

    it('should handle lowercase hex', () => {
      const result = hex('#aabbcc');
      expect(result).toBe('\x1b[38;2;170;187;204m');
    });

    it('should handle invalid hex gracefully', () => {
      const result = hex('#GGHHII');
      expect(result).toBe('\x1b[38;2;0;0;0m'); // Default to black
    });
  });

  describe('Reset', () => {
    it('should return reset code', () => {
      const result = reset();
      expect(result).toBe('\x1b[0m');
    });
  });

  describe('Named Colors', () => {
    it('should support basic named colors', () => {
      expect(color('red')).toBe('\x1b[31m');
      expect(color('green')).toBe('\x1b[32m');
      expect(color('blue')).toBe('\x1b[34m');
      expect(color('yellow')).toBe('\x1b[33m');
      expect(color('magenta')).toBe('\x1b[35m');
      expect(color('cyan')).toBe('\x1b[36m');
      expect(color('white')).toBe('\x1b[37m');
      expect(color('black')).toBe('\x1b[30m');
    });

    it('should support bright colors', () => {
      expect(color('brightRed')).toBe('\x1b[91m');
      expect(color('brightGreen')).toBe('\x1b[92m');
      expect(color('brightBlue')).toBe('\x1b[94m');
      expect(color('brightYellow')).toBe('\x1b[93m');
      expect(color('brightMagenta')).toBe('\x1b[95m');
      expect(color('brightCyan')).toBe('\x1b[96m');
      expect(color('brightWhite')).toBe('\x1b[97m');
    });

    it('should support background colors', () => {
      expect(color('bgRed')).toBe('\x1b[41m');
      expect(color('bgGreen')).toBe('\x1b[42m');
      expect(color('bgBlue')).toBe('\x1b[44m');
      expect(color('bgYellow')).toBe('\x1b[43m');
      expect(color('bgMagenta')).toBe('\x1b[45m');
      expect(color('bgCyan')).toBe('\x1b[46m');
      expect(color('bgWhite')).toBe('\x1b[47m');
      expect(color('bgBlack')).toBe('\x1b[40m');
    });

    it('should support bright background colors', () => {
      expect(color('bgBrightRed')).toBe('\x1b[101m');
      expect(color('bgBrightGreen')).toBe('\x1b[102m');
      expect(color('bgBrightBlue')).toBe('\x1b[104m');
    });

    it('should return empty string for unknown color', () => {
      expect(color('unknownColor')).toBe('');
    });
  });

  describe('Color Combinations', () => {
    it('should combine foreground and background', () => {
      const text = `${rgb(255, 255, 255)}${bgRgb(0, 0, 0)}White on Black${reset()}`;
      expect(text).toContain('\x1b[38;2;255;255;255m');
      expect(text).toContain('\x1b[48;2;0;0;0m');
      expect(text).toContain('\x1b[0m');
    });

    it('should chain multiple colors', () => {
      const text = `${color('red')}Red ${color('green')}Green ${color('blue')}Blue${reset()}`;
      expect(text).toContain('\x1b[31m');
      expect(text).toContain('\x1b[32m');
      expect(text).toContain('\x1b[34m');
    });
  });

  describe('Edge Cases', () => {
    it('should handle NaN RGB values', () => {
      const result = rgb(NaN, NaN, NaN);
      expect(result).toBe('\x1b[38;2;0;0;0m');
    });

    it('should handle Infinity RGB values', () => {
      const result = rgb(Infinity, -Infinity, 128);
      expect(result).toBe('\x1b[38;2;255;0;128m');
    });

    it('should handle null/undefined hex', () => {
      expect(hex(null as any)).toBe('\x1b[38;2;0;0;0m');
      expect(hex(undefined as any)).toBe('\x1b[38;2;0;0;0m');
    });

    it('should handle empty hex string', () => {
      expect(hex('')).toBe('\x1b[38;2;0;0;0m');
    });

    it('should handle special hex formats', () => {
      expect(hex('0xFF0000')).toBe('\x1b[38;2;255;0;0m'); // With 0x prefix
      expect(hex('rgb(255,0,0)')).toBe('\x1b[38;2;0;0;0m'); // Not hex format
    });
  });
});