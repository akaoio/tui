import { rgb, bgRgb, hex, bgHex, reset } from '../../src/utils/colors';

describe('Colors Simple Tests', () => {
  describe('RGB Colors', () => {
    it('should create rgb color', () => {
      const result = rgb(255, 0, 0);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create background rgb', () => {
      const result = bgRgb(0, 255, 0);
      expect(typeof result).toBe('string');
    });

    it('should handle edge cases', () => {
      expect(() => rgb(0, 0, 0)).not.toThrow();
      expect(() => rgb(255, 255, 255)).not.toThrow();
    });
  });

  describe('Hex Colors', () => {
    it('should parse hex colors', () => {
      const result = hex('#FF0000');
      expect(typeof result).toBe('string');
    });

    it('should parse short hex', () => {
      const result = hex('#F00');
      expect(typeof result).toBe('string');
    });

    it('should handle background hex', () => {
      const result = bgHex('#00FF00');
      expect(typeof result).toBe('string');
    });
  });

  it('should reset colors', () => {
    const result = reset();
    expect(result).toBe('\x1b[0m');
  });
});