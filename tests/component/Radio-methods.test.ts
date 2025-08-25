// Test individual Radio method files
import { selectNext } from '../../src/component/Radio/selectNext';
import { selectPrevious } from '../../src/component/Radio/selectPrevious';
import { selectFirst } from '../../src/component/Radio/selectFirst';
import { selectLast } from '../../src/component/Radio/selectLast';
import { updateValue } from '../../src/component/Radio/updateValue';

describe('Radio Methods', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      options: [
        { value: 1, label: 'Option 1' },
        { value: 2, label: 'Option 2' },
        { value: 3, label: 'Option 3' }
      ],
      selectedIndex: 0,
      value: undefined,
      emit: jest.fn(),
      updateValue: function() {
        updateValue.call(this);
      }
    };
  });

  describe('selectNext', () => {
    it('should select next option', () => {
      selectNext.call(mockContext);
      expect(mockContext.selectedIndex).toBe(1);
      expect(mockContext.emit).toHaveBeenCalledWith('change', 2);
    });

    it('should wrap to first option', () => {
      mockContext.selectedIndex = 2;
      selectNext.call(mockContext);
      expect(mockContext.selectedIndex).toBe(0);
      expect(mockContext.emit).toHaveBeenCalledWith('change', 1);
    });

    it('should handle empty options', () => {
      mockContext.options = [];
      selectNext.call(mockContext);
      expect(mockContext.selectedIndex).toBe(0);
    });

    it('should handle single option', () => {
      mockContext.options = [{ value: 1, label: 'Only' }];
      selectNext.call(mockContext);
      expect(mockContext.selectedIndex).toBe(0);
    });
  });

  describe('selectPrevious', () => {
    it('should select previous option', () => {
      mockContext.selectedIndex = 1;
      selectPrevious.call(mockContext);
      expect(mockContext.selectedIndex).toBe(0);
      expect(mockContext.emit).toHaveBeenCalledWith('change', 1);
    });

    it('should wrap to last option', () => {
      mockContext.selectedIndex = 0;
      selectPrevious.call(mockContext);
      expect(mockContext.selectedIndex).toBe(2);
      expect(mockContext.emit).toHaveBeenCalledWith('change', 3);
    });

    it('should handle empty options', () => {
      mockContext.options = [];
      selectPrevious.call(mockContext);
      expect(mockContext.selectedIndex).toBe(0);
    });
  });

  describe('selectFirst', () => {
    it('should select first option', () => {
      mockContext.selectedIndex = 2;
      selectFirst.call(mockContext);
      expect(mockContext.selectedIndex).toBe(0);
      expect(mockContext.emit).toHaveBeenCalledWith('change', 1);
    });

    it('should not emit if already first', () => {
      mockContext.selectedIndex = 0;
      selectFirst.call(mockContext);
      expect(mockContext.selectedIndex).toBe(0);
      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('should handle empty options', () => {
      mockContext.options = [];
      selectFirst.call(mockContext);
      expect(mockContext.selectedIndex).toBe(0);
    });
  });

  describe('selectLast', () => {
    it('should select last option', () => {
      mockContext.selectedIndex = 0;
      selectLast.call(mockContext);
      expect(mockContext.selectedIndex).toBe(2);
      expect(mockContext.emit).toHaveBeenCalledWith('change', 3);
    });

    it('should not emit if already last', () => {
      mockContext.selectedIndex = 2;
      selectLast.call(mockContext);
      expect(mockContext.selectedIndex).toBe(2);
      expect(mockContext.emit).not.toHaveBeenCalled();
    });

    it('should handle empty options', () => {
      mockContext.options = [];
      selectLast.call(mockContext);
      expect(mockContext.selectedIndex).toBe(0);
    });

    it('should handle single option', () => {
      mockContext.options = [{ value: 1, label: 'Only' }];
      selectLast.call(mockContext);
      expect(mockContext.selectedIndex).toBe(0);
    });
  });
});