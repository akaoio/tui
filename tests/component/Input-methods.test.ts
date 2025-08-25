// Test individual method files for Input component
import { getValue } from '../../src/component/Input/getValue';
import { setValue } from '../../src/component/Input/setValue';
import { getError } from '../../src/component/Input/getError';
import { clearError } from '../../src/component/Input/clearError';

describe('Input Methods', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      state: {
        value: '',
        cursorPosition: 0,
        error: null
      }
    };
  });

  describe('getValue', () => {
    it('should return current value', () => {
      mockContext.state.value = 'test';
      const result = getValue.call(mockContext);
      expect(result).toBe('test');
    });

    it('should return empty string for null value', () => {
      mockContext.state.value = null;
      const result = getValue.call(mockContext);
      expect(result).toBe('');
    });

    it('should handle undefined state', () => {
      mockContext.state = {};
      const result = getValue.call(mockContext);
      expect(result).toBe('');
    });
  });

  describe('setValue', () => {
    it('should set value', () => {
      setValue.call(mockContext, 'hello');
      expect(mockContext.state.value).toBe('hello');
    });

    it('should adjust cursor position', () => {
      mockContext.state.cursorPosition = 10;
      setValue.call(mockContext, 'hi');
      expect(mockContext.state.cursorPosition).toBe(2);
    });

    it('should handle empty string', () => {
      setValue.call(mockContext, '');
      expect(mockContext.state.value).toBe('');
      expect(mockContext.state.cursorPosition).toBe(0);
    });

    it('should handle null input', () => {
      setValue.call(mockContext, null as any);
      expect(mockContext.state.value).toBe('');
    });
  });

  describe('getError', () => {
    it('should return current error', () => {
      mockContext.state.error = 'Invalid input';
      const result = getError.call(mockContext);
      expect(result).toBe('Invalid input');
    });

    it('should return null when no error', () => {
      mockContext.state.error = null;
      const result = getError.call(mockContext);
      expect(result).toBeNull();
    });

    it('should handle undefined error', () => {
      delete mockContext.state.error;
      const result = getError.call(mockContext);
      expect(result).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      mockContext.state.error = 'Some error';
      clearError.call(mockContext);
      expect(mockContext.state.error).toBeNull();
    });

    it('should handle already null error', () => {
      mockContext.state.error = null;
      clearError.call(mockContext);
      expect(mockContext.state.error).toBeNull();
    });

    it('should handle missing state', () => {
      mockContext.state = {};
      expect(() => {
        clearError.call(mockContext);
      }).not.toThrow();
    });
  });
});