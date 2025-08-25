import {
  bold,
  dim,
  italic,
  underline,
  reset,
  drawBox
} from '../../src/utils/styles';

describe('Styles Simple Tests', () => {
  describe('Text Styles', () => {
    it('should apply bold', () => {
      const result = bold('test');
      expect(result).toContain('test');
    });

    it('should apply dim', () => {
      const result = dim('test');
      expect(result).toContain('test');
    });

    it('should apply italic', () => {
      const result = italic('test');
      expect(result).toContain('test');
    });

    it('should apply underline', () => {
      const result = underline('test');
      expect(result).toContain('test');
    });

    it('should reset', () => {
      const result = reset();
      expect(typeof result).toBe('string');
    });
  });

  describe('Box Drawing', () => {
    it('should draw box', () => {
      const result = drawBox(5, 3);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle edge cases', () => {
      expect(() => drawBox(0, 0)).not.toThrow();
      expect(() => drawBox(1, 1)).not.toThrow();
    });
  });
});