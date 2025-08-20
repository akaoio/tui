import { Screen } from '../src-new/core/screen';
import { mockStdout } from './setup';

describe('Screen', () => {
  let screen: Screen;

  beforeEach(() => {
    screen = new Screen(mockStdout as any);
  });

  describe('dimensions', () => {
    it('should get screen dimensions', () => {
      expect(screen.getWidth()).toBe(80);
      expect(screen.getHeight()).toBe(24);
    });

    it('should update dimensions on resize', () => {
      const resizeHandler = mockStdout.on.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1];

      mockStdout.columns = 100;
      mockStdout.rows = 30;
      resizeHandler?.();

      expect(screen.getWidth()).toBe(100);
      expect(screen.getHeight()).toBe(30);
    });
  });

  describe('cursor operations', () => {
    it('should move cursor', () => {
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

    it('should save and restore cursor', () => {
      screen.saveCursor();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[s');

      screen.restoreCursor();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[u');
    });
  });

  describe('clear operations', () => {
    it('should clear screen', () => {
      screen.clear();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[2J');
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[1;1H');
    });

    it('should clear line', () => {
      screen.clearLine();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[2K');
    });
  });

  describe('write operations', () => {
    it('should write text', () => {
      screen.write('Hello');
      expect(mockStdout.write).toHaveBeenCalledWith('Hello');
    });

    it('should write line', () => {
      screen.writeLine('Hello');
      expect(mockStdout.write).toHaveBeenCalledWith('Hello\n');
    });

    it('should write at specific position', () => {
      screen.writeAt(5, 10, 'Hello');
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[s'); // save cursor
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[11;6H'); // move cursor
      expect(mockStdout.write).toHaveBeenCalledWith('Hello'); // write text
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[u'); // restore cursor
    });
  });

  describe('buffer operations', () => {
    it('should buffer text and flush', () => {
      screen.startBuffer();
      screen.addToBuffer('Hello');
      screen.addToBuffer(' ');
      screen.addToBuffer('World');
      
      expect(mockStdout.write).not.toHaveBeenCalled();
      
      screen.flushBuffer();
      expect(mockStdout.write).toHaveBeenCalledWith('Hello World');
    });

    it('should not flush empty buffer', () => {
      screen.startBuffer();
      screen.flushBuffer();
      expect(mockStdout.write).not.toHaveBeenCalled();
    });
  });

  describe('alternate screen', () => {
    it('should enable alternate screen', () => {
      screen.enableAlternateScreen();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049h');
    });

    it('should disable alternate screen', () => {
      screen.disableAlternateScreen();
      expect(mockStdout.write).toHaveBeenCalledWith('\x1b[?1049l');
    });
  });

  it('should reset styles', () => {
    screen.reset();
    expect(mockStdout.write).toHaveBeenCalledWith('\x1b[0m');
  });
});