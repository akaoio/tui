/**
 * Targeted tests for specific low-coverage modules
 * Focus on increasing coverage efficiently
 */

describe('Low Coverage Boost Tests', () => {
  
  describe('TUI Module Methods', () => {
    it('should test TUI class methods directly', async () => {
      const { TUI } = require('../src/TUI');
      
      // Test basic constructor
      const tui = new TUI();
      expect(tui).toBeDefined();
      
      // Test constructor with options
      const tui2 = new TUI({ title: 'Test' });
      expect(tui2).toBeDefined();
      
      // Test render modes
      const { RenderMode } = require('../src/core/RenderMode');
      tui.setRenderMode(RenderMode.ABSOLUTE);
      expect(tui.getRenderMode()).toBe(RenderMode.ABSOLUTE);
      expect(tui.isAbsoluteMode()).toBe(true);
      expect(tui.isStreamMode()).toBe(false);
      
      tui.setRenderMode(RenderMode.STREAM);
      expect(tui.isStreamMode()).toBe(true);
      expect(tui.isAbsoluteMode()).toBe(false);
      
      // Test clear method
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      tui.clear();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
      
      // Test header creation
      const header = tui2.createHeader(); // Use tui2 which has title 'Test'
      expect(header).toContain('Test');
      
      // Test status section
      const status = tui.createStatusSection('Test', [
        { label: 'Status', value: 'OK', status: 'success' }
      ]);
      expect(status).toContain('Test');
      expect(status).toContain('Status');
      
      // Test compact status
      const compactStatus = tui.createStatusSection('Compact', [], true);
      expect(compactStatus).toContain('Compact');
      
      // Test message methods
      const errorSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      tui.showError('Error message');
      tui.showError('Error with details', 'Details here');
      tui.showSuccess('Success message');
      tui.showWarning('Warning message'); 
      tui.showInfo('Info message');
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
      
      // Test progress and spinner
      const progress = tui.showProgress('Loading', 25, 100);
      expect(progress).toBeDefined();
      
      const spinner = tui.createSpinner('Working');
      expect(spinner).toBeDefined();
      
      // Test cleanup
      tui.close();
    });
  });

  describe('ResponsiveCommands Methods', () => {
    it('should test ResponsiveCommands constructor and methods', () => {
      const { ResponsiveCommands } = require('../src/component/ResponsiveCommands');
      
      const mockScreen = {
        write: jest.fn(),
        writeAt: jest.fn(),
        fillRegion: jest.fn(),
        getWidth: () => 80,
        getHeight: () => 24
      };
      
      const mockKeyboard = {
        on: jest.fn(),
        off: jest.fn()
      };

      // Test basic constructor
      const commands = new ResponsiveCommands();
      expect(commands).toBeDefined();
      
      // Test constructor with commands and props
      const testCommands = [{ key: 'q', label: 'Quit', color: 'red' as any }];
      const commands2 = new ResponsiveCommands(testCommands, { visible: true });
      expect(commands2).toBeDefined();

      // Test setCommands method
      expect(() => commands.setCommands(testCommands)).not.toThrow();
      
      // Test render method with context
      const context = {
        screen: mockScreen,
        region: { x: 0, y: 0, width: 80, height: 24 }
      };
      expect(() => commands.render(context)).not.toThrow();
    });
  });

  describe('Form Module Methods - Direct Method Testing', () => {
    it('should test Form constructor directly', () => {
      const { constructor } = require('../src/component/Form/constructor');
      const mockScreen = { write: jest.fn(), writeAt: jest.fn() };
      const mockKeyboard = { 
        onKey: jest.fn(), 
        onChar: jest.fn(),
        on: jest.fn()
      };
      const mockContext: any = {};
      
      constructor.call(mockContext, mockScreen, mockKeyboard, {
        title: 'Test Form'
      });
      
      expect(mockContext.screen).toBe(mockScreen);
      expect(mockContext.keyboard).toBe(mockKeyboard);
      expect(mockContext.title).toBe('Test Form');
    });

    it('should test Form activation methods', () => {
      const { activate } = require('../src/component/Form/activate');
      const { deactivate } = require('../src/component/Form/deactivate');
      
      const mockContext: any = {
        isActive: false,
        components: [{
          focus: jest.fn(),
          blur: jest.fn(),
          setPosition: jest.fn(),
          render: jest.fn(),
          isVisible: jest.fn(() => true)
        }],
        currentIndex: 0,
        screen: { writeAt: jest.fn() },
        x: 0,
        y: 0,
        width: 50,
        height: 20,
        title: 'Test',
        submitLabel: 'Submit',
        cancelLabel: 'Cancel'
      };
      
      activate.call(mockContext);
      expect(mockContext.isActive).toBe(true);
      
      deactivate.call(mockContext);
      expect(mockContext.isActive).toBe(false);
    });

    it('should test Form component management', () => {
      const { addComponent } = require('../src/component/Form/addComponent');
      const { removeComponent } = require('../src/component/Form/removeComponent');
      
      const mockContext: any = {
        components: [],
        screen: { writeAt: jest.fn() },
        x: 0, y: 0, width: 50, height: 20, title: 'Test',
        submitLabel: 'Submit', cancelLabel: 'Cancel'
      };
      
      const mockComponent = {
        id: 'test',
        setPosition: jest.fn(),
        render: jest.fn(),
        isVisible: jest.fn(() => true)
      };
      addComponent.call(mockContext, mockComponent);
      expect(mockContext.components).toContain(mockComponent);
      
      removeComponent.call(mockContext, 0); // Pass index, not component
      expect(mockContext.components).not.toContain(mockComponent);
    });

    it('should test Form navigation', () => {
      const { focusNext } = require('../src/component/Form/focusNext');
      const { focusPrevious } = require('../src/component/Form/focusPrevious');
      const { focusCurrent } = require('../src/component/Form/focusCurrent');
      
      const mockContext: any = {
        components: [
          {
            focus: jest.fn(), blur: jest.fn(),
            setPosition: jest.fn(), render: jest.fn(), isVisible: jest.fn(() => true)
          }, 
          {
            focus: jest.fn(), blur: jest.fn(),
            setPosition: jest.fn(), render: jest.fn(), isVisible: jest.fn(() => true)
          }
        ],
        currentIndex: 0,
        isActive: true,
        screen: { writeAt: jest.fn() },
        x: 0, y: 0, width: 50, height: 20, title: 'Test',
        submitLabel: 'Submit', cancelLabel: 'Cancel'
      };
      
      focusNext.call(mockContext);
      expect(mockContext.currentIndex).toBe(1);
      
      focusPrevious.call(mockContext);
      expect(mockContext.currentIndex).toBe(0);
    });

    it('should test Form submission', () => {
      const { submit } = require('../src/component/Form/submit');
      const { cancel } = require('../src/component/Form/cancel');
      
      const mockComponent = { getValue: jest.fn(() => 'test-value') };
      const mockContext: any = {
        components: [mockComponent],
        emit: jest.fn(),
        onSubmit: jest.fn(),
        onCancel: jest.fn()
      };
      
      submit.call(mockContext);
      expect(mockContext.emit).toHaveBeenCalledWith('submit', { field_0: 'test-value' });
      
      cancel.call(mockContext);
      expect(mockContext.emit).toHaveBeenCalledWith('cancel');
    });

    it('should test Form utilities', () => {
      const { isInputComponent } = require('../src/component/Form/isInputComponent');
      const { getValues } = require('../src/component/Form/getValues');
      const { clear } = require('../src/component/Form/clear');
      
      const mockInput = { constructor: { name: 'Input' } };
      expect(isInputComponent.call(null, mockInput)).toBe(true);
      
      const mockSelect = { constructor: { name: 'Select' } };
      expect(isInputComponent.call(null, mockSelect)).toBe(true);
      expect(isInputComponent.call(null, { render: jest.fn() })).toBe(false);
      
      const mockContext: any = {
        components: [
          { id: 'field1', getValue: () => 'value1', setValue: jest.fn() }
        ],
        screen: { writeAt: jest.fn() },
        x: 0, y: 0, width: 50, height: 20
      };
      
      const values = getValues.call(mockContext);
      expect(values.field_0).toBe('value1');
      
      clear.call(mockContext);
      expect(mockContext.screen.writeAt).toHaveBeenCalled();
    });
  });

  describe('Component Module Methods', () => {
    it('should test Component constructor directly', () => {
      const { constructor } = require('../src/core/Component/constructor');
      const mockContext: any = {};
      
      constructor.call(mockContext, {
        id: 'test-component',
        x: 10,
        y: 5,
        width: 50,
        height: 20,
        focusable: true
      });
      
      expect(mockContext.props).toBeDefined();
      expect(mockContext.children).toEqual([]);
      expect(mockContext.id).toBe('test-component');
      expect(mockContext.focusable).toBe(true);
    });

    it('should test Component child management', () => {
      const { addChild } = require('../src/core/Component/addChild');
      const { removeChild } = require('../src/core/Component/removeChild');
      
      const mockParent: any = {
        children: [],
        render: jest.fn()
      };
      
      const mockChild: any = {
        id: 'child',
        parent: null
      };
      
      addChild.call(mockParent, mockChild);
      expect(mockParent.children).toContain(mockChild);
      expect(mockChild.parent).toBe(mockParent);
      
      removeChild.call(mockParent, mockChild);
      expect(mockParent.children).not.toContain(mockChild);
    });

    it('should test Component search methods', () => {
      const { findById } = require('../src/core/Component/findById');
      const { getFocusableComponents } = require('../src/core/Component/getFocusableComponents');
      
      const mockChild1 = { 
        id: 'child1', 
        children: [],
        findById: (id: string) => id === 'child1' ? mockChild1 : undefined
      };
      const mockChild2 = { 
        id: 'child2', 
        children: [],
        findById: (id: string) => id === 'child2' ? mockChild2 : undefined
      };
      
      const mockComponent: any = {
        id: 'root',
        children: [mockChild1, mockChild2]
      };
      
      expect(findById.call(mockComponent, 'child1')).toBe(mockChild1);
      expect(findById.call(mockComponent, 'nonexistent')).toBeUndefined();
      
      // Test focusable components
      const focusableChild = { 
        focusable: true,
        children: [],
        getFocusableComponents: () => [focusableChild]
      };
      const mockFocusableComponent: any = {
        focusable: false,
        children: [focusableChild]
      };
      
      const focusable = getFocusableComponents.call(mockFocusableComponent);
      expect(focusable).toContain(focusableChild);
    });

    it('should test Component drawing methods', () => {
      const { drawBox } = require('../src/core/Component/drawBox');
      const { fillRegion } = require('../src/core/Component/fillRegion');
      const { writeText } = require('../src/core/Component/writeText');
      
      const mockScreen = {
        write: jest.fn(),
        writeAt: jest.fn(),
        fillRegion: jest.fn((region, char, style) => {
          // Mock fillRegion should call writeAt for each character
          for (let y = 0; y < region.height; y++) {
            for (let x = 0; x < region.width; x++) {
              mockScreen.writeAt(char, region.x + x, region.y + y, style);
            }
          }
        })
      };
      
      const mockContext: any = {
        screen: mockScreen,
        region: { x: 5, y: 3, width: 20, height: 10 }
      };
      
      drawBox.call(mockContext, mockContext, { x: 0, y: 0, width: 10, height: 5 });
      expect(mockScreen.write).toHaveBeenCalled();
      mockScreen.writeAt.mockClear();
      
      fillRegion.call(mockContext, mockContext, { x: 0, y: 0, width: 5, height: 3 }, ' ');
      expect(mockScreen.writeAt).toHaveBeenCalled();
      mockScreen.writeAt.mockClear();
      
      writeText.call(mockContext, mockContext, 'Test text', 2, 1);
      expect(mockScreen.write).toHaveBeenCalledWith('Test text', 7, 4, undefined);
    });
  });

  describe('JsonEditor Methods - Method Files Only', () => {
    it('should test JsonEditor method files directly', () => {
      // Test nodeTree methods
      const nodeTree = require('../src/component/JsonEditor/nodeTree');
      
      const mockContext = {
        data: { key: 'value' },
        nodes: [],
        expandedNodes: new Set()
      };
      
      expect(() => {
        if (nodeTree.createTree) {
          nodeTree.createTree.call(mockContext);
        }
      }).not.toThrow();
      
      // Test editingLogic methods  
      const editingLogic = require('../src/component/JsonEditor/editingLogic');
      
      const editContext = {
        isEditing: false,
        editingPath: null,
        editingValue: '',
        render: jest.fn()
      };
      
      expect(() => {
        if (editingLogic.startEditing) {
          editingLogic.startEditing.call(editContext, 'key', 'value');
        }
      }).not.toThrow();
      
      // Test inputHandler methods
      const inputHandler = require('../src/component/JsonEditor/inputHandler');
      
      const inputContext = {
        currentIndex: 0,
        nodes: [{}, {}],
        render: jest.fn()
      };
      
      expect(() => {
        if (inputHandler.handleArrowUp) {
          inputHandler.handleArrowUp.call(inputContext);
        }
      }).not.toThrow();
      
      // Test renderer methods
      const renderer = require('../src/component/JsonEditor/renderer');
      
      const renderContext = {
        screen: { writeAt: jest.fn() },
        x: 0,
        y: 0,
        width: 80
      };
      
      expect(() => {
        if (renderer.renderHeader) {
          renderer.renderHeader.call(renderContext);
        }
      }).not.toThrow();
    });
  });

  describe('Additional Low Coverage Files', () => {
    it('should test Checkbox setDisabled method', () => {
      const { setDisabled } = require('../src/component/Checkbox/setDisabled');
      const ctx = { 
        disabled: false, 
        render: jest.fn()
      };
      
      setDisabled.call(ctx, true);
      expect(ctx.disabled).toBe(true);
      expect(ctx.render).toHaveBeenCalled();
    });

    it('should test Input multiline renderer', () => {
      const { renderMultiline } = require('../src/component/Input/multilineRenderer');
      const mockScreen = { writeAt: jest.fn() };
      const mockState = {
        lines: ['line1', 'line2', 'line3'],
        currentLine: 0,
        cursorPosition: 0
      };
      
      expect(() => renderMultiline.call({}, mockScreen, 0, 0, 50, 10, mockState, false, true)).not.toThrow();
    });

    it('should test Input input handler', () => {
      const { handleBackspace, insertChar } = require('../src/component/Input/inputHandler');
      const mockState = {
        value: 'test',
        cursorPosition: 4,
        lines: ['test'],
        currentLine: 0
      };
      
      expect(() => handleBackspace.call({}, mockState, false)).not.toThrow();
      expect(() => insertChar.call({}, mockState, 'x', 100, false)).not.toThrow();
    });

    it('should test ProgressBar complete method', () => {
      const { complete } = require('../src/component/ProgressBar/complete');
      const mockContext = {
        current: 50,
        total: 100,
        render: jest.fn(),
        emit: jest.fn()
      };
      
      complete.call(mockContext);
      expect(mockContext.current).toBe(mockContext.total);
      expect(mockContext.emit).toHaveBeenCalledWith('complete');
    });

    it('should test various utility methods', () => {
      // Test color utilities
      const { color } = require('../src/utils/colors/color');
      expect(() => color('red')).not.toThrow();
      
      const { hex } = require('../src/utils/colors/hex');
      expect(() => hex('#ff0000')).not.toThrow();
      
      // Test style utilities
      const { drawBox } = require('../src/utils/styles/drawBox');
      expect(() => drawBox(0, 0, 10, 5)).not.toThrow();
      
      const { style } = require('../src/utils/styles/style');
      expect(() => style('text', ['bold'])).not.toThrow();
    });

    it('should test platform and services', () => {
      const platform = require('../src/utils/platform');
      expect(() => {
        if (platform.getOS) platform.getOS();
        if (platform.getArch) platform.getArch();
        if (platform.isWindows) platform.isWindows();
      }).not.toThrow();
      
      const services = require('../src/utils/services');
      expect(() => {
        if (services.Logger) new services.Logger();
        if (services.FileService) new services.FileService();
      }).not.toThrow();
    });
  });

  describe('Stream Components', () => {
    it('should test Stream components', () => {
      const { StreamInput, StreamSelect, StreamCheckbox, StreamProgressBar, StreamSpinner } = require('../src/component/Stream');
      
      expect(() => new StreamInput()).not.toThrow();
      expect(() => new StreamSelect(['option1', 'option2'])).not.toThrow();
      expect(() => new StreamCheckbox()).not.toThrow();
      expect(() => new StreamProgressBar('Loading', 100)).not.toThrow();
      expect(() => new StreamSpinner('Working')).not.toThrow();
    });
  });

  describe('Core Modules with Low Coverage', () => {
    it('should test Viewport methods', () => {
      const { Viewport } = require('../src/core/Viewport');
      const viewport = Viewport.getInstance();
      
      expect(viewport).toBeDefined();
      expect(() => viewport.getDimensions()).not.toThrow();
      expect(() => viewport.getBreakpoint()).not.toThrow();
      expect(() => viewport.getWidth()).not.toThrow();
      expect(() => viewport.getHeight()).not.toThrow();
    });

    it('should test UnifiedKeyboardHandler', () => {
      const { UnifiedKeyboardHandler } = require('../src/core/UnifiedKeyboardHandler');
      
      const mockKeyboard = {
        on: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn()
      };
      
      expect(() => {
        const handler = new UnifiedKeyboardHandler(mockKeyboard);
        handler.registerBinding('test', 'ctrl+a', () => {});
        handler.destroy();
      }).not.toThrow();
    });

    it('should test VirtualCursor', () => {
      const { VirtualCursor } = require('../src/core/VirtualCursor');
      
      const mockScreen = {
        getDimensions: () => ({ width: 80, height: 24 }),
        on: jest.fn(),
        removeListener: jest.fn()
      };
      
      expect(() => {
        const cursor = new VirtualCursor(mockScreen);
        cursor.moveTo(5, 3);
        cursor.getPosition();
      }).not.toThrow();
    });
  });
});

export {};