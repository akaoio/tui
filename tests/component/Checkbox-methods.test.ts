// Test individual Checkbox method files
import { toggle } from '../../src/component/Checkbox/toggle';
import { check } from '../../src/component/Checkbox/check';
import { uncheck } from '../../src/component/Checkbox/uncheck';
import { isChecked } from '../../src/component/Checkbox/isChecked';
import { isDisabled } from '../../src/component/Checkbox/isDisabled';

describe('Checkbox Methods', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      checked: false,
      disabled: false,
      value: false,
      emit: jest.fn(),
      render: jest.fn()
    };
  });

  describe('toggle', () => {
    it('should toggle from false to true', () => {
      mockContext.checked = false;
      toggle.call(mockContext);
      expect(mockContext.checked).toBe(true);
      expect(mockContext.emit).toHaveBeenCalledWith('change', true);
    });

    it('should toggle from true to false', () => {
      mockContext.checked = true;
      toggle.call(mockContext);
      expect(mockContext.checked).toBe(false);
      expect(mockContext.emit).toHaveBeenCalledWith('change', false);
    });

    it('should not toggle when disabled', () => {
      mockContext.checked = false;
      mockContext.disabled = true;
      toggle.call(mockContext);
      expect(mockContext.checked).toBe(false);
      expect(mockContext.emit).not.toHaveBeenCalled();
    });
  });

  describe('check', () => {
    it('should set checked to true', () => {
      mockContext.checked = false;
      check.call(mockContext);
      expect(mockContext.checked).toBe(true);
      expect(mockContext.emit).toHaveBeenCalledWith('change', true);
    });

    it('should not emit if already checked', () => {
      mockContext.checked = true;
      check.call(mockContext);
      expect(mockContext.checked).toBe(true);
      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('should not check when disabled', () => {
      mockContext.checked = false;
      mockContext.disabled = true;
      check.call(mockContext);
      expect(mockContext.checked).toBe(false);
      expect(mockContext.emit).not.toHaveBeenCalled();
    });
  });

  describe('uncheck', () => {
    it('should set checked to false', () => {
      mockContext.checked = true;
      uncheck.call(mockContext);
      expect(mockContext.checked).toBe(false);
      expect(mockContext.emit).toHaveBeenCalledWith('change', false);
    });

    it('should not emit if already unchecked', () => {
      mockContext.checked = false;
      uncheck.call(mockContext);
      expect(mockContext.checked).toBe(false);
      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('should not uncheck when disabled', () => {
      mockContext.checked = true;
      mockContext.disabled = true;
      uncheck.call(mockContext);
      expect(mockContext.checked).toBe(true);
      expect(mockContext.emit).not.toHaveBeenCalled();
    });
  });

  describe('isChecked', () => {
    it('should return true when checked', () => {
      mockContext.checked = true;
      const result = isChecked.call(mockContext);
      expect(result).toBe(true);
    });

    it('should return false when unchecked', () => {
      mockContext.checked = false;
      const result = isChecked.call(mockContext);
      expect(result).toBe(false);
    });

    it('should handle undefined state', () => {
      delete mockContext.checked;
      const result = isChecked.call(mockContext);
      expect(result).toBeFalsy();
    });
  });

  describe('isDisabled', () => {
    it('should return true when disabled', () => {
      mockContext.disabled = true;
      const result = isDisabled.call(mockContext);
      expect(result).toBe(true);
    });

    it('should return false when enabled', () => {
      mockContext.disabled = false;
      const result = isDisabled.call(mockContext);
      expect(result).toBe(false);
    });

    it('should handle undefined state', () => {
      delete mockContext.disabled;
      const result = isDisabled.call(mockContext);
      expect(result).toBeFalsy();
    });
  });
});