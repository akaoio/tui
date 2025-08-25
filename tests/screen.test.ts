import { Screen } from '../src/core/screen';
import { mockStdout } from './setup';

describe('Screen', () => {
  let screen: Screen;

  beforeEach(() => {
    jest.clearAllMocks();
    screen = new Screen(mockStdout as any);
  });

  describe('Basic Operations', () => {
    it('should initialize with correct dimensions', () => {
      expect(screen.getWidth()).toBe(80);
      expect(screen.getHeight()).toBe(24);
    });

    it('should write text to screen', () => {
      screen.write('Hello World');
      expect(mockStdout.write).toHaveBeenCalledWith('Hello World');
    });

    it('should write line with newline', () => {
      screen.writeLine('Test line');
      expect(mockStdout.write).toHaveBeenCalledWith('Test line\n');
    });

    it('should write at specific position', () => {
      screen.writeAt(5, 10, 'Positioned text');
      
      // Should save cursor, move cursor, write text, restore cursor (4 calls)
      expect(mockStdout.write).toHaveBeenCalledTimes(4);
      expect(mockStdout.write).toHaveBeenCalledWith('Positioned text');
    });
  });

  describe('Cursor Management', () => {
    it('should move cursor to position', () => {
      screen.moveCursor(10, 5);
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[6;11H');
    });

    it('should hide cursor', () => {
      screen.hideCursor();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?25l');
    });

    it('should show cursor', () => {
      screen.showCursor();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?25h');
    });

    it('should save cursor position', () => {
      screen.saveCursor();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[s');
    });

    it('should restore cursor position', () => {
      screen.restoreCursor();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[u');
    });
  });

  describe('Screen Clearing', () => {
    it('should clear entire screen', () => {
      screen.clear();
      // clear() calls write() and moveCursor() separately
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[2J');
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[1;1H');
    });

    it('should clear current line', () => {
      screen.clearLine();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[2K');
    });

    it('should reset screen', () => {
      screen.reset();
      
      // reset() only writes the reset ANSI code
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[0m');
    });
  });

  describe('Alternate Screen', () => {
    it('should enable alternate screen', () => {
      screen.enableAlternateScreen();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049h');
    });

    it('should disable alternate screen', () => {
      screen.disableAlternateScreen();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049l');
    });
  });

  describe('Buffer Management', () => {
    it('should buffer writes when buffer is started', () => {
      screen.startBuffer();
      
      screen.write('First');
      screen.write('Second');
      
      // Should not write immediately
      expect(mockStdout.write).not.toHaveBeenCalled();
      
      screen.flushBuffer();
      
      // Should write all at once
      expect(mockStdout.write).toHaveBeenCalledWith('FirstSecond');
    });

    it('should add to buffer', () => {
      screen.startBuffer();
      screen.addToBuffer('Test content');
      
      expect(mockStdout.write).not.toHaveBeenCalled();
      
      screen.flushBuffer();
      expect(mockStdout.write).toHaveBeenCalledWith('Test content');
    });

    it('should handle multiple flushes', () => {
      screen.startBuffer();
      screen.addToBuffer('First');
      screen.flushBuffer();
      
      screen.addToBuffer('Second');
      screen.flushBuffer();
      
      expect(mockStdout.write).toHaveBeenCalledTimes(2);
      expect(mockStdout.write).toHaveBeenNthCalledWith(1, 'First');
      expect(mockStdout.write).toHaveBeenNthCalledWith(2, 'Second');
    });
  });

  describe('Dimension Updates', () => {
    it('should update dimensions on resize', () => {
      mockStdout.columns = 120;
      mockStdout.rows = 40;
      
      // Trigger resize via the event handler
      const resizeCallback = mockStdout.on.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];
      
      resizeCallback();
      
      expect(screen.getWidth()).toBe(120);
      expect(screen.getHeight()).toBe(40);
    });

    it('should handle resize event', () => {
      const resizeCallback = mockStdout.on.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];
      
      expect(resizeCallback).toBeDefined();
      
      mockStdout.columns = 100;
      mockStdout.rows = 30;
      
      resizeCallback();
      
      expect(screen.getWidth()).toBe(100);
      expect(screen.getHeight()).toBe(30);
    });
  });
});