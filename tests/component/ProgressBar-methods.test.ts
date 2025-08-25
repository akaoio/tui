// Test individual ProgressBar method files
import { increment } from '../../src/component/ProgressBar/increment';
import { decrement } from '../../src/component/ProgressBar/decrement';
import { setProgress } from '../../src/component/ProgressBar/setProgress';
import { complete } from '../../src/component/ProgressBar/complete';
import { reset } from '../../src/component/ProgressBar/reset';
import { getPercentage } from '../../src/component/ProgressBar/getPercentage';

describe('ProgressBar Methods', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      current: 0,
      total: 100,
      value: 0,
      emit: jest.fn(),
      render: jest.fn(),
      setProgress: function(value: number) {
        setProgress.call(this, value);
      },
      getPercentage: function() {
        return getPercentage.call(this);
      }
    };
  });

  describe('increment', () => {
    it('should increment by 1 by default', () => {
      increment.call(mockContext);
      expect(mockContext.current).toBe(1);
      expect(mockContext.emit).toHaveBeenCalledWith('progress', 1, 100, 1);
    });

    it('should increment by custom amount', () => {
      increment.call(mockContext, 5);
      expect(mockContext.current).toBe(5);
      expect(mockContext.emit).toHaveBeenCalledWith('progress', 5, 100, 5);
    });

    it('should not exceed total', () => {
      mockContext.current = 99;
      increment.call(mockContext, 5);
      expect(mockContext.current).toBe(100);
    });

    it('should handle negative increment', () => {
      mockContext.current = 10;
      increment.call(mockContext, -3);
      expect(mockContext.current).toBe(7);
    });

    it('should not go below 0 with negative increment', () => {
      mockContext.current = 2;
      increment.call(mockContext, -5);
      expect(mockContext.current).toBe(0);
    });
  });

  describe('decrement', () => {
    beforeEach(() => {
      mockContext.current = 50;
    });

    it('should decrement by 1 by default', () => {
      decrement.call(mockContext);
      expect(mockContext.current).toBe(49);
      expect(mockContext.emit).toHaveBeenCalledWith('progress', 49, 100, 49);
    });

    it('should decrement by custom amount', () => {
      decrement.call(mockContext, 10);
      expect(mockContext.current).toBe(40);
    });

    it('should not go below 0', () => {
      mockContext.current = 5;
      decrement.call(mockContext, 10);
      expect(mockContext.current).toBe(0);
    });

    it('should handle negative decrement', () => {
      decrement.call(mockContext, -5);
      expect(mockContext.current).toBe(55);
    });
  });

  describe('setProgress', () => {
    it('should set progress value', () => {
      setProgress.call(mockContext, 75);
      expect(mockContext.current).toBe(75);
      expect(mockContext.emit).toHaveBeenCalledWith('progress', 75, 100, 75);
    });

    it('should clamp to total', () => {
      setProgress.call(mockContext, 150);
      expect(mockContext.current).toBe(100);
    });

    it('should clamp to 0', () => {
      setProgress.call(mockContext, -10);
      expect(mockContext.current).toBe(0);
    });

    it('should handle fractional values', () => {
      setProgress.call(mockContext, 33.7);
      expect(mockContext.current).toBe(33.7);
    });

    it('should emit complete event at 100%', () => {
      setProgress.call(mockContext, 100);
      expect(mockContext.emit).toHaveBeenCalledWith('complete');
    });
  });

  describe('complete', () => {
    it('should set to total value', () => {
      complete.call(mockContext);
      expect(mockContext.current).toBe(100);
      expect(mockContext.emit).toHaveBeenCalledWith('progress', 100, 100, 100);
      expect(mockContext.emit).toHaveBeenCalledWith('complete');
    });

    it('should work with custom total', () => {
      mockContext.total = 50;
      complete.call(mockContext);
      expect(mockContext.current).toBe(50);
    });

    it('should handle zero total', () => {
      mockContext.total = 0;
      complete.call(mockContext);
      expect(mockContext.current).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset to 0', () => {
      mockContext.current = 75;
      reset.call(mockContext);
      expect(mockContext.current).toBe(0);
      expect(mockContext.emit).toHaveBeenCalledWith('progress', 0, 100, 0);
    });

    it('should work when already at 0', () => {
      mockContext.current = 0;
      reset.call(mockContext);
      expect(mockContext.current).toBe(0);
      expect(mockContext.emit).toHaveBeenCalledWith('progress', 0, 100, 0);
    });
  });
});