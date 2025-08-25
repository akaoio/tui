import { FocusManager } from '../../src/core/FocusManager';

describe('FocusManager', () => {
  let focusManager: FocusManager;
  let mockComponent: any;
  let mockRoot: any;

  beforeEach(() => {
    // Create mock components
    mockComponent = {
      id: 'comp1',
      focus: jest.fn(),
      blur: jest.fn(),
      isFocusable: true,
      visible: true,
      disabled: false,
      handleKey: jest.fn()
    };

    mockRoot = {
      id: 'root',
      children: [],
      getFocusableComponents: jest.fn(() => []),
      findById: jest.fn((id: string) => null)
    };

    focusManager = new FocusManager();
  });

  describe('Focus Management', () => {
    it('should set root component', () => {
      focusManager.setRoot(mockRoot);
      expect(focusManager.root).toBe(mockRoot);
    });

    it('should get currently focused component', () => {
      focusManager.setRoot(mockRoot);
      focusManager.focused = mockComponent;
      
      expect(focusManager.getFocused()).toBe(mockComponent);
    });

    it('should return null when no component is focused', () => {
      focusManager.setRoot(mockRoot);
      expect(focusManager.getFocused()).toBeNull();
    });

    it('should update focus to new component', () => {
      const oldComponent = { ...mockComponent, id: 'old' };
      const newComponent = { ...mockComponent, id: 'new' };
      
      focusManager.focused = oldComponent;
      focusManager.updateFocus(newComponent);
      
      expect(oldComponent.blur).toHaveBeenCalled();
      expect(newComponent.focus).toHaveBeenCalled();
      expect(focusManager.focused).toBe(newComponent);
    });

    it('should handle null when updating focus', () => {
      focusManager.focused = mockComponent;
      focusManager.updateFocus(null);
      
      expect(mockComponent.blur).toHaveBeenCalled();
      expect(focusManager.focused).toBeNull();
    });

    it('should not blur if no component was focused', () => {
      const newComponent = { ...mockComponent };
      
      focusManager.updateFocus(newComponent);
      
      expect(newComponent.focus).toHaveBeenCalled();
      expect(focusManager.focused).toBe(newComponent);
    });
  });

  describe('Focus Navigation', () => {
    it('should focus next component', () => {
      const comp1 = { ...mockComponent, id: 'comp1', focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', focus: jest.fn(), blur: jest.fn() };
      const comp3 = { ...mockComponent, id: 'comp3', focus: jest.fn(), blur: jest.fn() };
      
      mockRoot.getFocusableComponents = jest.fn(() => [comp1, comp2, comp3]);
      
      focusManager.setRoot(mockRoot);
      focusManager.focused = comp1;
      
      focusManager.focusNext();
      
      expect(comp1.blur).toHaveBeenCalled();
      expect(comp2.focus).toHaveBeenCalled();
      expect(focusManager.focused).toBe(comp2);
    });

    it('should wrap to first component from last', () => {
      const comp1 = { ...mockComponent, id: 'comp1', focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', focus: jest.fn(), blur: jest.fn() };
      const comp3 = { ...mockComponent, id: 'comp3', focus: jest.fn(), blur: jest.fn() };
      
      mockRoot.getFocusableComponents = jest.fn(() => [comp1, comp2, comp3]);
      
      focusManager.setRoot(mockRoot);
      focusManager.focused = comp3;
      
      focusManager.focusNext();
      
      expect(comp3.blur).toHaveBeenCalled();
      expect(comp1.focus).toHaveBeenCalled();
      expect(focusManager.focused).toBe(comp1);
    });

    it('should focus previous component', () => {
      const comp1 = { ...mockComponent, id: 'comp1', focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', focus: jest.fn(), blur: jest.fn() };
      const comp3 = { ...mockComponent, id: 'comp3', focus: jest.fn(), blur: jest.fn() };
      
      mockRoot.getFocusableComponents = jest.fn(() => [comp1, comp2, comp3]);
      
      focusManager.setRoot(mockRoot);
      focusManager.focused = comp2;
      
      focusManager.focusPrevious();
      
      expect(comp2.blur).toHaveBeenCalled();
      expect(comp1.focus).toHaveBeenCalled();
      expect(focusManager.focused).toBe(comp1);
    });

    it('should wrap to last component from first', () => {
      const comp1 = { ...mockComponent, id: 'comp1', focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', focus: jest.fn(), blur: jest.fn() };
      const comp3 = { ...mockComponent, id: 'comp3', focus: jest.fn(), blur: jest.fn() };
      
      mockRoot.getFocusableComponents = jest.fn(() => [comp1, comp2, comp3]);
      
      focusManager.setRoot(mockRoot);
      focusManager.focused = comp1;
      
      focusManager.focusPrevious();
      
      expect(comp1.blur).toHaveBeenCalled();
      expect(comp3.focus).toHaveBeenCalled();
      expect(focusManager.focused).toBe(comp3);
    });

    it('should handle no focusable components', () => {
      mockRoot.getFocusableComponents = jest.fn(() => []);
      
      focusManager.setRoot(mockRoot);
      focusManager.focusNext();
      
      expect(focusManager.focused).toBeNull();
    });

    it('should focus first component when none focused', () => {
      const comp1 = { ...mockComponent, id: 'comp1', focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', focus: jest.fn(), blur: jest.fn() };
      
      mockRoot.getFocusableComponents = jest.fn(() => [comp1, comp2]);
      
      focusManager.setRoot(mockRoot);
      focusManager.focusNext();
      
      expect(comp1.focus).toHaveBeenCalled();
      expect(focusManager.focused).toBe(comp1);
    });

    it('should skip disabled components', () => {
      const comp1 = { ...mockComponent, id: 'comp1', disabled: true, focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', disabled: false, focus: jest.fn(), blur: jest.fn() };
      const comp3 = { ...mockComponent, id: 'comp3', disabled: true, focus: jest.fn(), blur: jest.fn() };
      
      mockRoot.getFocusableComponents = jest.fn(() => [comp1, comp2, comp3]);
      
      focusManager.setRoot(mockRoot);
      focusManager.focusNext();
      
      expect(comp1.focus).not.toHaveBeenCalled();
      expect(comp2.focus).toHaveBeenCalled();
      expect(focusManager.focused).toBe(comp2);
    });

    it('should skip invisible components', () => {
      const comp1 = { ...mockComponent, id: 'comp1', visible: false, focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', visible: true, focus: jest.fn(), blur: jest.fn() };
      
      mockRoot.getFocusableComponents = jest.fn(() => [comp1, comp2]);
      
      focusManager.setRoot(mockRoot);
      focusManager.focusNext();
      
      expect(comp1.focus).not.toHaveBeenCalled();
      expect(comp2.focus).toHaveBeenCalled();
    });
  });

  describe('Tab Index Support', () => {
    it('should respect tabIndex order', () => {
      const comp1 = { ...mockComponent, id: 'comp1', tabIndex: 2, focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', tabIndex: 1, focus: jest.fn(), blur: jest.fn() };
      const comp3 = { ...mockComponent, id: 'comp3', tabIndex: 3, focus: jest.fn(), blur: jest.fn() };
      
      mockRoot.getFocusableComponents = jest.fn(() => [comp1, comp2, comp3]);
      
      focusManager.setRoot(mockRoot);
      focusManager.focusNext();
      
      // Should focus comp2 first (lowest tabIndex)
      expect(comp2.focus).toHaveBeenCalled();
      expect(focusManager.focused).toBe(comp2);
      
      focusManager.focusNext();
      
      // Then comp1 (tabIndex 2)
      expect(comp1.focus).toHaveBeenCalled();
      expect(focusManager.focused).toBe(comp1);
    });

    it('should handle negative tabIndex', () => {
      const comp1 = { ...mockComponent, id: 'comp1', tabIndex: -1, focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', tabIndex: 0, focus: jest.fn(), blur: jest.fn() };
      
      mockRoot.getFocusableComponents = jest.fn(() => [comp1, comp2]);
      
      focusManager.setRoot(mockRoot);
      focusManager.focusNext();
      
      // Should skip comp1 with negative tabIndex
      expect(comp1.focus).not.toHaveBeenCalled();
      expect(comp2.focus).toHaveBeenCalled();
    });
  });

  describe('Focus Trap', () => {
    it('should trap focus within container', () => {
      const container = {
        id: 'container',
        trapFocus: true,
        getFocusableComponents: jest.fn(),
        children: []
      };
      
      const comp1 = { ...mockComponent, id: 'comp1', parent: container, focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', parent: container, focus: jest.fn(), blur: jest.fn() };
      const outsideComp = { ...mockComponent, id: 'outside', focus: jest.fn(), blur: jest.fn() };
      
      container.getFocusableComponents.mockReturnValue([comp1, comp2]);
      mockRoot.getFocusableComponents = jest.fn().mockReturnValue([comp1, comp2, outsideComp]);
      
      focusManager.setRoot(mockRoot);
      focusManager.setFocusTrap(container as any);
      focusManager.focused = comp2;
      
      focusManager.focusNext();
      
      // Should wrap within container, not go to outsideComp
      expect(comp1.focus).toHaveBeenCalled();
      expect(outsideComp.focus).not.toHaveBeenCalled();
    });

    it('should release focus trap', () => {
      const container = { ...mockRoot, trapFocus: true };
      
      focusManager.setFocusTrap(container);
      expect(focusManager.focusTrap).toBe(container);
      
      focusManager.releaseFocusTrap();
      expect(focusManager.focusTrap).toBeNull();
    });
  });

  describe('Focus History', () => {
    it('should track focus history', () => {
      const comp1 = { ...mockComponent, id: 'comp1', focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', focus: jest.fn(), blur: jest.fn() };
      const comp3 = { ...mockComponent, id: 'comp3', focus: jest.fn(), blur: jest.fn() };
      
      focusManager.updateFocus(comp1);
      focusManager.updateFocus(comp2);
      focusManager.updateFocus(comp3);
      
      const history = focusManager.getFocusHistory();
      
      expect(history).toEqual(['comp1', 'comp2', 'comp3']);
    });

    it('should restore previous focus', () => {
      const comp1 = { ...mockComponent, id: 'comp1', focus: jest.fn(), blur: jest.fn() };
      const comp2 = { ...mockComponent, id: 'comp2', focus: jest.fn(), blur: jest.fn() };
      
      mockRoot.findById = jest.fn((id: string) => {
        if (id === 'comp1') return comp1;
        if (id === 'comp2') return comp2;
        return null;
      });
      
      focusManager.setRoot(mockRoot);
      focusManager.updateFocus(comp1);
      focusManager.updateFocus(comp2);
      
      focusManager.restorePreviousFocus();
      
      expect(comp1.focus).toHaveBeenCalledTimes(2);
      expect(focusManager.focused).toBe(comp1);
    });

    it('should limit focus history size', () => {
      // Assuming max history is 50
      for (let i = 0; i < 60; i++) {
        const comp = { ...mockComponent, id: `comp${i}`, focus: jest.fn(), blur: jest.fn() };
        focusManager.updateFocus(comp);
      }
      
      const history = focusManager.getFocusHistory();
      expect(history.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null root', () => {
      expect(() => {
        focusManager.focusNext();
      }).not.toThrow();
      
      expect(focusManager.focused).toBeNull();
    });

    it('should handle circular focus', () => {
      const comp1 = { ...mockComponent, id: 'comp1', focus: jest.fn(), blur: jest.fn() };
      comp1.next = comp1; // Circular reference
      
      mockRoot.getFocusableComponents = jest.fn(() => [comp1]);
      
      focusManager.setRoot(mockRoot);
      focusManager.focused = comp1;
      
      expect(() => {
        focusManager.focusNext();
      }).not.toThrow();
    });

    it('should handle focus during transition', () => {
      const comp1 = { 
        ...mockComponent, 
        id: 'comp1',
        focus: jest.fn(() => {
          // Try to focus another component during focus
          focusManager.updateFocus({ ...mockComponent, id: 'comp2' });
        })
      };
      
      expect(() => {
        focusManager.updateFocus(comp1);
      }).not.toThrow();
    });

    it('should handle components that throw on focus', () => {
      const errorComponent = {
        ...mockComponent,
        focus: jest.fn(() => {
          throw new Error('Focus failed');
        })
      };
      
      expect(() => {
        focusManager.updateFocus(errorComponent);
      }).not.toThrow();
    });
  });
});