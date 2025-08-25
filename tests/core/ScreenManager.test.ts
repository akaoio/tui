import { ScreenManager } from '../../src/core/ScreenManager/ScreenManager';

describe('ScreenManager', () => {
  let screenManager: ScreenManager;
  let mockStdout: any;
  let mockStdin: any;

  beforeEach(() => {
    mockStdout = {
      write: jest.fn(),
      isTTY: true,
      columns: 80,
      rows: 24,
      on: jest.fn(),
      removeListener: jest.fn()
    };

    mockStdin = {
      setRawMode: jest.fn(),
      resume: jest.fn(),
      pause: jest.fn(),
      on: jest.fn(),
      removeAllListeners: jest.fn(),
      isTTY: true
    };

    screenManager = ScreenManager.getInstance();
    screenManager.reset();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = ScreenManager.getInstance();
      const instance2 = ScreenManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('Terminal Setup', () => {
    it('should setup terminal', () => {
      screenManager.setupTerminal(mockStdout, mockStdin);
      
      expect(mockStdin.setRawMode).toHaveBeenCalledWith(true);
      expect(mockStdin.resume).toHaveBeenCalled();
    });

    it('should enable alternate screen', () => {
      screenManager.setupTerminal(mockStdout, mockStdin);
      screenManager.enterAlternateScreen();
      
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049h');
    });

    it('should disable alternate screen', () => {
      screenManager.setupTerminal(mockStdout, mockStdin);
      screenManager.exitAlternateScreen();
      
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049l');
    });

    it('should handle non-TTY gracefully', () => {
      mockStdout.isTTY = false;
      mockStdin.isTTY = false;
      
      expect(() => {
        screenManager.setupTerminal(mockStdout, mockStdin);
      }).not.toThrow();
    });
  });

  describe('Buffer Management', () => {
    beforeEach(() => {
      screenManager.setupTerminal(mockStdout, mockStdin);
    });

    it('should buffer writes', () => {
      screenManager.bufferManagement.startBuffer();
      
      screenManager.write('Hello');
      screenManager.write(' World');
      
      // Should not write immediately
      expect(mockStdout.write).not.toHaveBeenCalledWith('Hello');
      expect(mockStdout.write).not.toHaveBeenCalledWith(' World');
      
      screenManager.flush();
      
      expect(mockStdout.write).toHaveBeenCalledWith('Hello World');
    });

    it('should handle buffer overflow', () => {
      screenManager.bufferManagement.startBuffer();
      
      // Fill buffer beyond capacity
      const largeString = 'x'.repeat(100000);
      for (let i = 0; i < 10; i++) {
        screenManager.write(largeString);
      }
      
      // Should auto-flush when buffer is full
      expect(mockStdout.write).toHaveBeenCalled();
    });

    it('should clear buffer', () => {
      screenManager.bufferManagement.startBuffer();
      screenManager.write('Test');
      
      screenManager.bufferManagement.clearBuffer();
      screenManager.flush();
      
      expect(mockStdout.write).not.toHaveBeenCalledWith('Test');
    });
  });

  describe('Dimension Management', () => {
    beforeEach(() => {
      screenManager.setupTerminal(mockStdout, mockStdin);
    });

    it('should get current dimensions', () => {
      const dims = screenManager.getDimensions();
      
      expect(dims).toEqual({
        width: 80,
        height: 24
      });
    });

    it('should handle resize events', () => {
      const resizeHandler = jest.fn();
      screenManager.on('resize', resizeHandler);
      
      // Simulate resize
      mockStdout.columns = 100;
      mockStdout.rows = 30;
      
      const resizeCallback = mockStdout.on.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];
      
      resizeCallback();
      
      expect(resizeHandler).toHaveBeenCalledWith({
        width: 100,
        height: 30
      });
    });

    it('should detect dimension changes', () => {
      const initialDims = screenManager.getDimensions();
      
      mockStdout.columns = 120;
      screenManager.handleResize();
      
      const newDims = screenManager.getDimensions();
      
      expect(newDims.width).not.toBe(initialDims.width);
    });
  });

  describe('Component Registration', () => {
    let mockComponent: any;

    beforeEach(() => {
      screenManager.setupTerminal(mockStdout, mockStdin);
      
      mockComponent = {
        id: 'test-component',
        x: 10,
        y: 5,
        width: 20,
        height: 10,
        render: jest.fn(),
        handleResize: jest.fn()
      };
    });

    it('should register component', () => {
      screenManager.registerComponent(mockComponent);
      
      const components = screenManager.getRegisteredComponents();
      expect(components).toContain(mockComponent);
    });

    it('should unregister component', () => {
      screenManager.registerComponent(mockComponent);
      screenManager.unregisterComponent(mockComponent.id);
      
      const components = screenManager.getRegisteredComponents();
      expect(components).not.toContain(mockComponent);
    });

    it('should notify components on resize', () => {
      screenManager.registerComponent(mockComponent);
      
      mockStdout.columns = 100;
      screenManager.handleResize();
      
      expect(mockComponent.handleResize).toHaveBeenCalledWith({
        width: 100,
        height: 24
      });
    });

    it('should handle component render errors', () => {
      mockComponent.render = jest.fn(() => {
        throw new Error('Render failed');
      });
      
      screenManager.registerComponent(mockComponent);
      
      expect(() => {
        screenManager.renderAll();
      }).not.toThrow();
    });
  });

  describe('Cursor Management', () => {
    beforeEach(() => {
      screenManager.setupTerminal(mockStdout, mockStdin);
    });

    it('should set cursor position', () => {
      screenManager.setCursorPosition(10, 15);
      
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[16;11H');
    });

    it('should show/hide cursor', () => {
      screenManager.setCursorVisible(false);
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?25l');
      
      screenManager.setCursorVisible(true);
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?25h');
    });

    it('should save and restore cursor', () => {
      screenManager.saveCursor();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[s');
      
      screenManager.restoreCursor();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[u');
    });
  });

  describe('Region Management', () => {
    beforeEach(() => {
      screenManager.setupTerminal(mockStdout, mockStdin);
    });

    it('should fill region', () => {
      screenManager.fillRegion(5, 10, 20, 5, '*');
      
      // Should set cursor and write fill character multiple times
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[11;6H'); // First position
      expect(mockStdout.write).toHaveBeenCalledWith('*'.repeat(20));
    });

    it('should clear region', () => {
      screenManager.clearRegion(0, 0, 80, 24);
      
      // Should clear each line in the region
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[1;1H');
      expect(mockStdout.write).toHaveBeenCalledWith(' '.repeat(80));
    });

    it('should handle region boundaries', () => {
      const dims = screenManager.getDimensions();
      
      // Try to fill beyond screen boundaries
      screenManager.fillRegion(
        dims.width - 5, 
        dims.height - 5, 
        10, 
        10, 
        'X'
      );
      
      // Should not throw and should clip to boundaries
      expect(mockStdout.write).toHaveBeenCalled();
    });
  });

  describe('Mouse Events', () => {
    beforeEach(() => {
      screenManager.setupTerminal(mockStdout, mockStdin);
    });

    it('should enable mouse events', () => {
      screenManager.enableMouse();
      
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1000h');
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1002h');
    });

    it('should disable mouse events', () => {
      screenManager.disableMouse();
      
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1000l');
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1002l');
    });

    it('should parse mouse events', () => {
      const mouseData = '\x1b[M !#'; // Mouse click at (1,3)
      const event = screenManager.parseMouseEvent(mouseData);
      
      expect(event).toEqual({
        button: 0,
        x: 1,
        y: 3,
        type: 'click'
      });
    });

    it('should handle mouse event', () => {
      const mouseHandler = jest.fn();
      screenManager.on('mouse', mouseHandler);
      
      const mouseEvent = {
        button: 0,
        x: 10,
        y: 15,
        type: 'click'
      };
      
      screenManager.handleMouseEvent(mouseEvent);
      
      expect(mouseHandler).toHaveBeenCalledWith(mouseEvent);
    });
  });

  describe('Input Processing', () => {
    beforeEach(() => {
      screenManager.setupTerminal(mockStdout, mockStdin);
    });

    it('should handle input data', () => {
      const inputHandler = jest.fn();
      screenManager.on('keypress', inputHandler);
      
      const inputCallback = mockStdin.on.mock.calls.find(
        call => call[0] === 'data'
      )?.[1];
      
      inputCallback('a');
      
      expect(inputHandler).toHaveBeenCalled();
    });

    it('should parse key sequences', () => {
      const key = screenManager.parseKey('\x1b[A'); // Up arrow
      
      expect(key).toEqual({
        name: 'up',
        sequence: '\x1b[A',
        ctrl: false,
        meta: false,
        shift: false
      });
    });

    it('should handle special key combinations', () => {
      const ctrlC = screenManager.parseKey('\x03');
      
      expect(ctrlC).toEqual({
        name: 'c',
        sequence: '\x03',
        ctrl: true,
        meta: false,
        shift: false
      });
    });

    it('should emit keypress events', () => {
      const keypressHandler = jest.fn();
      screenManager.on('keypress', keypressHandler);
      
      screenManager.emitKeypress('a', {
        name: 'a',
        sequence: 'a',
        ctrl: false,
        meta: false,
        shift: false
      });
      
      expect(keypressHandler).toHaveBeenCalledWith('a', {
        name: 'a',
        sequence: 'a',
        ctrl: false,
        meta: false,
        shift: false
      });
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      screenManager.setupTerminal(mockStdout, mockStdin);
    });

    it('should cleanup on exit', () => {
      screenManager.cleanup();
      
      expect(mockStdin.setRawMode).toHaveBeenCalledWith(false);
      expect(mockStdin.pause).toHaveBeenCalled();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049l'); // Exit alt screen
    });

    it('should remove all event listeners', () => {
      const handler = jest.fn();
      screenManager.on('resize', handler);
      
      screenManager.cleanup();
      
      expect(mockStdin.removeAllListeners).toHaveBeenCalled();
      expect(mockStdout.removeListener).toHaveBeenCalled();
    });

    it('should restore terminal state', () => {
      screenManager.setCursorVisible(false);
      screenManager.enterAlternateScreen();
      
      screenManager.cleanup();
      
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?25h'); // Show cursor
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[0m');   // Reset colors
    });
  });

  describe('Error Handling', () => {
    it('should handle write errors gracefully', () => {
      mockStdout.write = jest.fn(() => {
        throw new Error('Write failed');
      });
      
      screenManager.setupTerminal(mockStdout, mockStdin);
      
      expect(() => {
        screenManager.write('test');
      }).not.toThrow();
    });

    it('should handle resize errors', () => {
      screenManager.setupTerminal(mockStdout, mockStdin);
      
      mockStdout.columns = NaN;
      mockStdout.rows = undefined;
      
      expect(() => {
        screenManager.handleResize();
      }).not.toThrow();
      
      const dims = screenManager.getDimensions();
      expect(dims.width).toBeGreaterThan(0);
      expect(dims.height).toBeGreaterThan(0);
    });

    it('should handle invalid cursor positions', () => {
      screenManager.setupTerminal(mockStdout, mockStdin);
      
      expect(() => {
        screenManager.setCursorPosition(-10, -5);
      }).not.toThrow();
      
      expect(() => {
        screenManager.setCursorPosition(1000, 1000);
      }).not.toThrow();
    });
  });
});