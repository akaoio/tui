/**
 * Comprehensive tests for Select component methods
 */

describe('Select Component Methods', () => {
  // Mock context for method testing
  let mockContext: any;
  let mockScreen: any;
  let mockKeyboard: any;

  beforeEach(() => {
    // Setup mock screen
    mockScreen = {
      write: jest.fn(),
      writeAt: jest.fn(),
      clearLine: jest.fn(),
      moveCursor: jest.fn(),
      getWidth: jest.fn(() => 80),
      getHeight: jest.fn(() => 24),
      flush: jest.fn(),
      reset: jest.fn()
    };

    // Setup mock keyboard
    mockKeyboard = {
      on: jest.fn(),
      off: jest.fn(),
      handleKey: jest.fn()
    };

    // Setup mock context with all required properties
    mockContext = {
      screen: mockScreen,
      keyboard: mockKeyboard,
      x: 0,
      y: 0,
      width: 30,
      height: 10,
      visible: true,
      focused: false,
      options: [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
        { value: '3', label: 'Option 3' }
      ],
      selectedIndex: 0,
      selectedIndices: new Set(),
      value: null,
      values: [],
      label: 'Select an option',
      placeholder: 'Choose...',
      multiple: false,
      required: false,
      disabled: false,
      isOpen: false,
      highlightedIndex: 0,
      visibleStart: 0,
      visibleCount: 5,
      maxVisible: 5,
      emit: jest.fn(),
      render: jest.fn()
    };
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const { constructor } = require('../../src/component/Select/constructor');
      const ctx: any = {};
      
      constructor.call(ctx, mockScreen, mockKeyboard, {});
      
      expect(ctx.screen).toBe(mockScreen);
      expect(ctx.keyboard).toBe(mockKeyboard);
      expect(ctx.options).toEqual([]);
      expect(ctx.selectedIndex).toBe(-1);
      expect(ctx.multiple).toBe(false);
      expect(ctx.isOpen).toBe(false);
    });

    it('should initialize with custom options', () => {
      const { constructor } = require('../../src/component/Select/constructor');
      const ctx: any = {};
      const options = {
        options: ['A', 'B', 'C'],
        multiple: true,
        value: 'A',
        placeholder: 'Select items'
      };
      
      constructor.call(ctx, mockScreen, mockKeyboard, options);
      
      expect(ctx.options).toHaveLength(3);
      expect(ctx.multiple).toBe(true);
      expect(ctx.placeholder).toBe('Select items');
    });
  });

  describe('open/close', () => {
    it('should open dropdown', () => {
      const { open } = require('../../src/component/Select/open');
      
      open.call(mockContext);
      
      expect(mockContext.isOpen).toBe(true);
      expect(mockContext.highlightedIndex).toBe(0);
      expect(mockContext.render).toHaveBeenCalled();
    });

    it('should not open if disabled', () => {
      const { open } = require('../../src/component/Select/open');
      mockContext.disabled = true;
      
      open.call(mockContext);
      
      expect(mockContext.isOpen).toBe(false);
      expect(mockContext.render).not.toHaveBeenCalled();
    });

    it('should close dropdown', () => {
      const { close } = require('../../src/component/Select/close');
      mockContext.isOpen = true;
      
      close.call(mockContext);
      
      expect(mockContext.isOpen).toBe(false);
      expect(mockContext.render).toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should select next option', () => {
      const { selectNext } = require('../../src/component/Select/selectNext');
      mockContext.isOpen = true;
      mockContext.highlightedIndex = 0;
      
      selectNext.call(mockContext);
      
      expect(mockContext.highlightedIndex).toBe(1);
      expect(mockContext.render).toHaveBeenCalled();
    });

    it('should wrap to first option', () => {
      const { selectNext } = require('../../src/component/Select/selectNext');
      mockContext.isOpen = true;
      mockContext.highlightedIndex = 2;
      
      selectNext.call(mockContext);
      
      expect(mockContext.highlightedIndex).toBe(0);
    });

    it('should select previous option', () => {
      const { selectPrevious } = require('../../src/component/Select/selectPrevious');
      mockContext.isOpen = true;
      mockContext.highlightedIndex = 1;
      
      selectPrevious.call(mockContext);
      
      expect(mockContext.highlightedIndex).toBe(0);
      expect(mockContext.render).toHaveBeenCalled();
    });

    it('should wrap to last option', () => {
      const { selectPrevious } = require('../../src/component/Select/selectPrevious');
      mockContext.isOpen = true;
      mockContext.highlightedIndex = 0;
      
      selectPrevious.call(mockContext);
      
      expect(mockContext.highlightedIndex).toBe(2);
    });
  });

  describe('selection', () => {
    it('should select current highlighted option (single)', () => {
      const { selectCurrent } = require('../../src/component/Select/selectCurrent');
      mockContext.isOpen = true;
      mockContext.highlightedIndex = 1;
      
      selectCurrent.call(mockContext);
      
      expect(mockContext.selectedIndex).toBe(1);
      expect(mockContext.value).toBe('2');
      expect(mockContext.isOpen).toBe(false);
      expect(mockContext.emit).toHaveBeenCalledWith('change', '2');
    });

    it('should toggle selection in multiple mode', () => {
      const { selectCurrent } = require('../../src/component/Select/selectCurrent');
      mockContext.multiple = true;
      mockContext.isOpen = true;
      mockContext.highlightedIndex = 1;
      mockContext.selectedIndices = new Set();
      
      // First selection
      selectCurrent.call(mockContext);
      expect(mockContext.selectedIndices.has(1)).toBe(true);
      expect(mockContext.values).toContain('2');
      
      // Deselection
      selectCurrent.call(mockContext);
      expect(mockContext.selectedIndices.has(1)).toBe(false);
      expect(mockContext.values).not.toContain('2');
    });
  });

  describe('getSelectedOption', () => {
    it('should return selected option', () => {
      const { getSelectedOption } = require('../../src/component/Select/getSelectedOption');
      mockContext.selectedIndex = 1;
      
      const selected = getSelectedOption.call(mockContext);
      
      expect(selected).toEqual({ value: '2', label: 'Option 2' });
    });

    it('should return null if no selection', () => {
      const { getSelectedOption } = require('../../src/component/Select/getSelectedOption');
      mockContext.selectedIndex = -1;
      
      const selected = getSelectedOption.call(mockContext);
      
      expect(selected).toBeNull();
    });
  });

  describe('getSelectedOptions', () => {
    it('should return array of selected options in multiple mode', () => {
      const { getSelectedOptions } = require('../../src/component/Select/getSelectedOptions');
      mockContext.multiple = true;
      mockContext.selectedIndices = new Set([0, 2]);
      
      const selected = getSelectedOptions.call(mockContext);
      
      expect(selected).toHaveLength(2);
      expect(selected[0]).toEqual({ value: '1', label: 'Option 1' });
      expect(selected[1]).toEqual({ value: '3', label: 'Option 3' });
    });

    it('should return single selected option as array', () => {
      const { getSelectedOptions } = require('../../src/component/Select/getSelectedOptions');
      mockContext.selectedIndex = 1;
      
      const selected = getSelectedOptions.call(mockContext);
      
      expect(selected).toHaveLength(1);
      expect(selected[0]).toEqual({ value: '2', label: 'Option 2' });
    });
  });

  describe('setOptions', () => {
    it('should update options array', () => {
      const { setOptions } = require('../../src/component/Select/setOptions');
      const newOptions = [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' }
      ];
      
      setOptions.call(mockContext, newOptions);
      
      expect(mockContext.options).toEqual(newOptions);
      expect(mockContext.selectedIndex).toBe(-1);
      expect(mockContext.render).toHaveBeenCalled();
    });

    it('should convert string array to options', () => {
      const { setOptions } = require('../../src/component/Select/setOptions');
      
      setOptions.call(mockContext, ['Red', 'Green', 'Blue']);
      
      expect(mockContext.options).toHaveLength(3);
      expect(mockContext.options[0]).toEqual({ value: 'Red', label: 'Red' });
    });
  });

  describe('clear', () => {
    it('should clear selection', () => {
      const { clear } = require('../../src/component/Select/clear');
      mockContext.selectedIndex = 1;
      mockContext.value = '2';
      
      clear.call(mockContext);
      
      expect(mockContext.selectedIndex).toBe(-1);
      expect(mockContext.value).toBeNull();
      expect(mockContext.emit).toHaveBeenCalledWith('change', null);
    });

    it('should clear multiple selections', () => {
      const { clear } = require('../../src/component/Select/clear');
      mockContext.multiple = true;
      mockContext.selectedIndices = new Set([0, 1, 2]);
      mockContext.values = ['1', '2', '3'];
      
      clear.call(mockContext);
      
      expect(mockContext.selectedIndices.size).toBe(0);
      expect(mockContext.values).toEqual([]);
      expect(mockContext.emit).toHaveBeenCalledWith('change', []);
    });
  });

  describe('clearSelection', () => {
    it('should clear current selection in multiple mode', () => {
      const { clearSelection } = require('../../src/component/Select/clearSelection');
      mockContext.multiple = true;
      mockContext.isOpen = true;
      mockContext.highlightedIndex = 1;
      mockContext.selectedIndices = new Set([0, 1, 2]);
      mockContext.values = ['1', '2', '3'];
      
      clearSelection.call(mockContext);
      
      expect(mockContext.selectedIndices.has(1)).toBe(false);
      expect(mockContext.values).not.toContain('2');
      expect(mockContext.emit).toHaveBeenCalledWith('change', ['1', '3']);
    });
  });

  describe('handleKey', () => {
    it('should handle arrow down key', () => {
      const { handleKey } = require('../../src/component/Select/handleKey');
      const mockSelectNext = jest.fn();
      mockContext.selectNext = mockSelectNext;
      
      const event = {
        key: { name: 'down' },
        preventDefault: jest.fn()
      };
      
      handleKey.call(mockContext, event.key, event);
      
      expect(mockSelectNext).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle enter key to open', () => {
      const { handleKey } = require('../../src/component/Select/handleKey');
      const mockOpen = jest.fn();
      mockContext.open = mockOpen;
      mockContext.isOpen = false;
      
      const event = {
        key: { name: 'return' },
        preventDefault: jest.fn()
      };
      
      handleKey.call(mockContext, event.key, event);
      
      expect(mockOpen).toHaveBeenCalled();
    });

    it('should handle escape key to close', () => {
      const { handleKey } = require('../../src/component/Select/handleKey');
      const mockClose = jest.fn();
      mockContext.close = mockClose;
      mockContext.isOpen = true;
      
      const event = {
        key: { name: 'escape' },
        preventDefault: jest.fn()
      };
      
      handleKey.call(mockContext, event.key, event);
      
      expect(mockClose).toHaveBeenCalled();
    });

    it('should handle space key for selection', () => {
      const { handleKey } = require('../../src/component/Select/handleKey');
      const mockSelectCurrent = jest.fn();
      mockContext.selectCurrent = mockSelectCurrent;
      mockContext.isOpen = true;
      
      const event = {
        key: { name: 'space' },
        preventDefault: jest.fn()
      };
      
      handleKey.call(mockContext, event.key, event);
      
      expect(mockSelectCurrent).toHaveBeenCalled();
    });
  });

  describe('updateValue', () => {
    it('should update single value', () => {
      const { updateValue } = require('../../src/component/Select/updateValue');
      
      updateValue.call(mockContext, '3');
      
      expect(mockContext.value).toBe('3');
      expect(mockContext.selectedIndex).toBe(2);
      expect(mockContext.render).toHaveBeenCalled();
    });

    it('should update multiple values', () => {
      const { updateValue } = require('../../src/component/Select/updateValue');
      mockContext.multiple = true;
      
      updateValue.call(mockContext, ['1', '3']);
      
      expect(mockContext.values).toEqual(['1', '3']);
      expect(mockContext.selectedIndices.has(0)).toBe(true);
      expect(mockContext.selectedIndices.has(2)).toBe(true);
      expect(mockContext.selectedIndices.has(1)).toBe(false);
    });
  });

  describe('render', () => {
    it('should render closed select', () => {
      const { render } = require('../../src/component/Select/render');
      
      render.call(mockContext);
      
      expect(mockScreen.writeAt).toHaveBeenCalled();
      expect(mockScreen.flush).toHaveBeenCalled();
    });

    it('should render open dropdown', () => {
      const { render } = require('../../src/component/Select/render');
      mockContext.isOpen = true;
      
      render.call(mockContext);
      
      expect(mockScreen.writeAt).toHaveBeenCalled();
      expect(mockScreen.flush).toHaveBeenCalled();
    });

    it('should not render if not visible', () => {
      const { render } = require('../../src/component/Select/render');
      mockContext.visible = false;
      
      render.call(mockContext);
      
      expect(mockScreen.writeAt).not.toHaveBeenCalled();
    });
  });

  describe('navigation edge cases', () => {
    it('should handle navigation with scrolling', () => {
      const { navigation } = require('../../src/component/Select/navigation');
      mockContext.options = Array.from({ length: 20 }, (_, i) => ({
        value: `${i}`,
        label: `Option ${i}`
      }));
      mockContext.highlightedIndex = 0;
      mockContext.visibleStart = 0;
      mockContext.maxVisible = 5;
      
      // Navigate down past visible area
      for (let i = 0; i < 6; i++) {
        navigation.navigateDown.call(mockContext);
      }
      
      expect(mockContext.highlightedIndex).toBe(6);
      expect(mockContext.visibleStart).toBeGreaterThan(0);
    });

    it('should handle empty options', () => {
      const { navigation } = require('../../src/component/Select/navigation');
      mockContext.options = [];
      
      navigation.navigateDown.call(mockContext);
      
      expect(mockContext.highlightedIndex).toBe(0);
    });
  });

  describe('renderer', () => {
    it('should render dropdown items', () => {
      const { renderer } = require('../../src/component/Select/renderer');
      
      const result = renderer.renderDropdownItems.call(mockContext);
      
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should render selected value', () => {
      const { renderer } = require('../../src/component/Select/renderer');
      mockContext.selectedIndex = 1;
      mockContext.value = '2';
      
      const result = renderer.renderSelectedValue.call(mockContext);
      
      expect(result).toContain('Option 2');
    });

    it('should render placeholder when no selection', () => {
      const { renderer } = require('../../src/component/Select/renderer');
      mockContext.selectedIndex = -1;
      
      const result = renderer.renderSelectedValue.call(mockContext);
      
      expect(result).toContain('Choose...');
    });

    it('should render multiple selected values', () => {
      const { renderer } = require('../../src/component/Select/renderer');
      mockContext.multiple = true;
      mockContext.selectedIndices = new Set([0, 2]);
      mockContext.values = ['1', '3'];
      
      const result = renderer.renderSelectedValue.call(mockContext);
      
      expect(result).toContain('2 selected');
    });
  });

  describe('selection edge cases', () => {
    it('should handle required validation', () => {
      const { selection } = require('../../src/component/Select/selection');
      mockContext.required = true;
      mockContext.selectedIndex = -1;
      
      const isValid = selection.validateSelection.call(mockContext);
      
      expect(isValid).toBe(false);
    });

    it('should handle disabled options', () => {
      const { selection } = require('../../src/component/Select/selection');
      mockContext.options[1].disabled = true;
      
      const canSelect = selection.canSelectOption.call(mockContext, 1);
      
      expect(canSelect).toBe(false);
    });
  });
});