/**
 * Comprehensive test suite for Screen class and all its methods
 * Testing both container class and individual method files
 */

import { Screen } from '../src';

// Import individual method files for direct testing
import { constructor } from '../src/core/Screen/constructor';
import { write } from '../src/core/Screen/write';
import { clear } from '../src/core/Screen/clear';
import { moveCursor } from '../src/core/Screen/moveCursor';
import { hideCursor } from '../src/core/Screen/hideCursor';
import { showCursor } from '../src/core/Screen/showCursor';
import { saveCursor } from '../src/core/Screen/saveCursor';
import { restoreCursor } from '../src/core/Screen/restoreCursor';
import { writeLine } from '../src/core/Screen/writeLine';
import { writeAt } from '../src/core/Screen/writeAt';
import { clearLine } from '../src/core/Screen/clearLine';
import { getWidth } from '../src/core/Screen/getWidth';
import { getHeight } from '../src/core/Screen/getHeight';
import { startBuffer } from '../src/core/Screen/startBuffer';
import { addToBuffer } from '../src/core/Screen/addToBuffer';
import { flushBuffer } from '../src/core/Screen/flushBuffer';
import { updateDimensions } from '../src/core/Screen/updateDimensions';
import { enableAlternateScreen } from '../src/core/Screen/enableAlternateScreen';
import { disableAlternateScreen } from '../src/core/Screen/disableAlternateScreen';
import { reset } from '../src/core/Screen/reset';

describe('Screen - Complete Testing', () => {
  // Mock stdout
  const mockStdout = {
    write: jest.fn(),
    isTTY: true,
    columns: 80,
    rows: 24,
    on: jest.fn(),
    removeListener: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Container Class', () => {
    let screen: Screen;

    beforeEach(() => {
      screen = new Screen(mockStdout as any);
    });

    test('should create screen with default stdout', () => {
      const defaultScreen = new Screen();
      expect(defaultScreen).toBeDefined();
      expect(defaultScreen['stdout']).toBeDefined();
    });

    test('should create screen with custom stdout', () => {
      expect(screen).toBeDefined();
      expect(screen['stdout']).toBe(mockStdout);
    });

    test('should delegate all methods correctly', () => {
      const methods = [
        'getWidth', 'getHeight', 'clear', 'clearLine', 'moveCursor',
        'hideCursor', 'showCursor', 'saveCursor', 'restoreCursor',
        'write', 'writeLine', 'writeAt', 'startBuffer', 'addToBuffer',
        'flushBuffer', 'enableAlternateScreen', 'disableAlternateScreen',
        'reset'
      ];

      methods.forEach(method => {
        expect((screen as any)[method]).toBeDefined();
        expect(typeof (screen as any)[method]).toBe('function');
      });
    });

    test('should have proper initialization', () => {
      expect(screen['buffer']).toBeNull();
      expect(screen['width']).toBe(80);
      expect(screen['height']).toBe(24);
    });
  });

  describe('Screen Method Files - Direct Testing', () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        stdout: mockStdout,
        buffer: null,
        width: 80,
        height: 24
      };
      jest.clearAllMocks();
    });

    describe('constructor()', () => {
      test('should initialize with default stdout', () => {
        constructor.call(mockContext);
        
        expect(mockContext.stdout).toBe(process.stdout);
        expect(mockContext.buffer).toBeNull();
        expect(mockContext.width).toBe(80);
        expect(mockContext.height).toBe(24);
      });

      test('should initialize with custom stdout', () => {
        constructor.call(mockContext, mockStdout as any);
        
        expect(mockContext.stdout).toBe(mockStdout);
        expect(mockStdout.on).toHaveBeenCalledWith('resize', expect.any(Function));
      });

      test('should not set resize listener for non-TTY', () => {
        const nonTTY = { ...mockStdout, isTTY: false };
        constructor.call(mockContext, nonTTY as any);
        
        expect(nonTTY.on).not.toHaveBeenCalled();
      });
    });

    describe('write()', () => {
      test('should write to stdout when not buffering', () => {
        write.call(mockContext, 'Hello World');
        
        expect(mockStdout.write).toHaveBeenCalledWith('Hello World');
      });

      test('should add to buffer when buffering', () => {
        mockContext.buffer = [];
        mockContext.buffering = true;
        write.call(mockContext, 'Buffered Text');
        
        expect(mockContext.buffer.join("")).toContain('Buffered Text');
        expect(mockStdout.write).not.toHaveBeenCalled();
      });

      test('should handle empty strings', () => {
        write.call(mockContext, '');
        
        expect(mockStdout.write).toHaveBeenCalledWith('');
      });

      test('should handle special characters', () => {
        const special = '\x1b[31mRed Text\x1b[0m';
        write.call(mockContext, special);
        
        expect(mockStdout.write).toHaveBeenCalledWith(special);
      });
    });

    describe('clear()', () => {
      test('should clear screen and move cursor to origin', () => {
        clear.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[2J');
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[1;1H');
      });
    });

    describe('moveCursor()', () => {
      test('should move cursor to specified position', () => {
        moveCursor.call(mockContext, 10, 5);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[6;11H');
      });

      test('should handle origin (0,0)', () => {
        moveCursor.call(mockContext, 0, 0);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[1;1H');
      });

      test('should handle large coordinates', () => {
        moveCursor.call(mockContext, 100, 50);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[51;101H');
      });
    });

    describe('cursor visibility', () => {
      test('hideCursor should hide cursor', () => {
        hideCursor.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?25l');
      });

      test('showCursor should show cursor', () => {
        showCursor.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?25h');
      });

      test('saveCursor should save cursor position', () => {
        saveCursor.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[s');
      });

      test('restoreCursor should restore cursor position', () => {
        restoreCursor.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[u');
      });
    });

    describe('writeLine()', () => {
      test('should write text with newline', () => {
        writeLine.call(mockContext, 'Line of text');
        
        expect(mockStdout.write).toHaveBeenCalledWith('Line of text\n');
      });

      test('should handle empty line', () => {
        writeLine.call(mockContext, '');
        
        expect(mockStdout.write).toHaveBeenCalledWith('\n');
      });
    });

    describe('writeAt()', () => {
      test('should save, move, write, and restore cursor', () => {
        writeAt.call(mockContext, 10, 5, 'Positioned Text');
        
        // Should save cursor
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[s');
        // Should move to position
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[6;11H');
        // Should write text
        expect(mockStdout.write).toHaveBeenCalledWith('Positioned Text');
        // Should restore cursor
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[u');
      });
    });

    describe('clearLine()', () => {
      test('should clear current line', () => {
        clearLine.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[2K');
      });
    });

    describe('dimensions', () => {
      test('getWidth should return width', () => {
        const width = getWidth.call(mockContext);
        
        expect(width).toBe(80);
      });

      test('getHeight should return height', () => {
        const height = getHeight.call(mockContext);
        
        expect(height).toBe(24);
      });

      test('updateDimensions should update from stdout', () => {
        updateDimensions.call(mockContext);
        
        expect(mockContext.width).toBe(80);
        expect(mockContext.height).toBe(24);
      });

      test('updateDimensions should handle stdout without dimensions', () => {
        const noSizeStdout = { columns: undefined, rows: undefined };
        mockContext.stdout = noSizeStdout;
        
        updateDimensions.call(mockContext);
        
        // Should keep defaults
        expect(mockContext.width).toBe(80);
        expect(mockContext.height).toBe(24);
      });
    });

    describe('buffering', () => {
      test('startBuffer should initialize buffer', () => {
        startBuffer.call(mockContext);
        
        expect(Array.isArray(mockContext.buffer)).toBe(true);
        expect(mockContext.buffer).toHaveLength(0);
      });

      test('addToBuffer should add text to buffer', () => {
        mockContext.buffer = [];
        addToBuffer.call(mockContext, 'Buffer Text');
        
        expect(mockContext.buffer.join("")).toContain('Buffer Text');
      });

      test('flushBuffer should output and clear buffer', () => {
        mockContext.buffer = ['Text 1', 'Text 2', 'Text 3'];
        
        flushBuffer.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('Text 1Text 2Text 3');
        expect(mockContext.buffer).toEqual([]);
      });

      test('flushBuffer should handle empty buffer', () => {
        mockContext.buffer = [];
        
        flushBuffer.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('');
        expect(mockContext.buffer).toBeNull();
      });

      test('flushBuffer should handle null buffer', () => {
        mockContext.buffer = null;
        
        expect(() => flushBuffer.call(mockContext)).not.toThrow();
        expect(mockStdout.write).not.toHaveBeenCalled();
      });
    });

    describe('alternate screen', () => {
      test('enableAlternateScreen should enter alternate screen', () => {
        enableAlternateScreen.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049h');
      });

      test('disableAlternateScreen should exit alternate screen', () => {
        disableAlternateScreen.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049l');
      });
    });

    describe('reset()', () => {
      test('should reset terminal', () => {
        reset.call(mockContext);
        
        expect(mockStdout.write).toHaveBeenCalledWith('\x1bc');
      });
    });
  });

  describe('Screen Integration Tests', () => {
    let screen: Screen;

    beforeEach(() => {
      screen = new Screen(mockStdout as any);
    });

    test('should handle write workflow', () => {
      screen.clear();
      screen.write('Hello ');
      screen.write('World');
      screen.moveCursor(0, 1);
      screen.writeLine('Second line');
      
      expect(mockStdout.write).toHaveBeenCalledTimes(5);
    });

    test('should handle buffering workflow', () => {
      screen.startBuffer();
      screen.write('Buffered 1');
      screen.write('Buffered 2');
      screen.flushBuffer();
      
      expect(mockStdout.write).toHaveBeenCalledWith('Buffered 1Buffered 2');
    });

    test('should handle cursor operations', () => {
      screen.hideCursor();
      screen.moveCursor(10, 10);
      screen.writeAt(5, 5, 'Positioned');
      screen.showCursor();
      
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?25l');
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[11;11H');
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?25h');
    });

    test('should handle alternate screen mode', () => {
      screen.enableAlternateScreen();
      screen.clear();
      screen.write('Alternate content');
      screen.disableAlternateScreen();
      
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049h');
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049l');
    });

    test('should handle dimension queries', () => {
      expect(screen.getWidth()).toBe(80);
      expect(screen.getHeight()).toBe(24);
      
      // Update stdout dimensions
      mockStdout.columns = 120;
      mockStdout.rows = 40;
      
      screen['updateDimensions']();
      expect(screen.getWidth()).toBe(120);
      expect(screen.getHeight()).toBe(40);
    });
  });

  describe('Edge Cases', () => {
    test('should handle methods with null stdout', () => {
      const nullContext = {
        stdout: null,
        buffer: null,
        width: 80,
        height: 24
      };

      expect(() => {
        write.call(nullContext, 'test');
      }).toThrow();
    });

    test('should handle very large text', () => {
      const largeText = 'x'.repeat(10000);
      write.call({ stdout: mockStdout, buffer: null }, largeText);
      
      expect(mockStdout.write).toHaveBeenCalledWith(largeText);
    });

    test('should handle special escape sequences', () => {
      const escapeText = '\x1b[31m\x1b[1mBold Red\x1b[0m';
      write.call({ stdout: mockStdout, buffer: null }, escapeText);
      
      expect(mockStdout.write).toHaveBeenCalledWith(escapeText);
    });

    test('should handle negative cursor positions', () => {
      moveCursor.call({ stdout: mockStdout }, -5, -10);
      
      // Should still send the command (terminal will handle bounds)
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[-9;-4H');
    });
  });
});