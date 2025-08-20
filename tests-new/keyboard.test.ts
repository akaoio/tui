import { Keyboard, Key } from '../src-new/core/keyboard';
import { mockStdin } from './setup';

describe('Keyboard', () => {
  let keyboard: Keyboard;
  let keyHandler: jest.Mock;
  let charHandler: jest.Mock;

  beforeEach(() => {
    keyboard = new Keyboard(mockStdin as any);
    keyHandler = jest.fn();
    charHandler = jest.fn();
  });

  afterEach(() => {
    keyboard.stop();
  });

  describe('start/stop', () => {
    it('should start keyboard listener', () => {
      keyboard.start();
      expect(mockStdin.setRawMode).toHaveBeenCalledWith(true);
      expect(mockStdin.resume).toHaveBeenCalled();
    });

    it('should stop keyboard listener', () => {
      keyboard.start();
      keyboard.stop();
      expect(mockStdin.setRawMode).toHaveBeenCalledWith(false);
      expect(mockStdin.pause).toHaveBeenCalled();
      expect(mockStdin.removeAllListeners).toHaveBeenCalledWith('keypress');
    });

    it('should not start twice', () => {
      keyboard.start();
      jest.clearAllMocks();
      keyboard.start();
      expect(mockStdin.setRawMode).not.toHaveBeenCalled();
    });
  });

  describe('key events', () => {
    it('should emit arrow key events', () => {
      keyboard.onKey(keyHandler);
      keyboard.start();

      const keypressHandler = mockStdin.on.mock.calls.find(
        call => call[0] === 'keypress'
      )?.[1];

      keypressHandler?.('', { name: 'up' });
      expect(keyHandler).toHaveBeenCalledWith(Key.UP, expect.any(Object));

      keypressHandler?.('', { name: 'down' });
      expect(keyHandler).toHaveBeenCalledWith(Key.DOWN, expect.any(Object));

      keypressHandler?.('', { name: 'left' });
      expect(keyHandler).toHaveBeenCalledWith(Key.LEFT, expect.any(Object));

      keypressHandler?.('', { name: 'right' });
      expect(keyHandler).toHaveBeenCalledWith(Key.RIGHT, expect.any(Object));
    });

    it('should emit special key events', () => {
      keyboard.onKey(keyHandler);
      keyboard.start();

      const keypressHandler = mockStdin.on.mock.calls.find(
        call => call[0] === 'keypress'
      )?.[1];

      keypressHandler?.('', { name: 'return' });
      expect(keyHandler).toHaveBeenCalledWith(Key.ENTER, expect.any(Object));

      keypressHandler?.('', { name: 'escape' });
      expect(keyHandler).toHaveBeenCalledWith(Key.ESCAPE, expect.any(Object));

      keypressHandler?.('', { name: 'space' });
      expect(keyHandler).toHaveBeenCalledWith(Key.SPACE, expect.any(Object));

      keypressHandler?.('', { name: 'tab' });
      expect(keyHandler).toHaveBeenCalledWith(Key.TAB, expect.any(Object));
    });

    it('should handle Ctrl+C and exit', () => {
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });

      keyboard.onKey(keyHandler);
      keyboard.start();

      const keypressHandler = mockStdin.on.mock.calls.find(
        call => call[0] === 'keypress'
      )?.[1];

      expect(() => {
        keypressHandler?.('', { name: 'c', ctrl: true });
      }).toThrow('process.exit');

      expect(keyHandler).toHaveBeenCalledWith(Key.CTRL_C, expect.any(Object));
      expect(exitSpy).toHaveBeenCalledWith(0);

      exitSpy.mockRestore();
    });
  });

  describe('char events', () => {
    it('should emit character events', () => {
      keyboard.onChar(charHandler);
      keyboard.start();

      const keypressHandler = mockStdin.on.mock.calls.find(
        call => call[0] === 'keypress'
      )?.[1];

      keypressHandler?.('a', { name: 'a' });
      expect(charHandler).toHaveBeenCalledWith('a', expect.any(Object));

      keypressHandler?.('1', { name: '1' });
      expect(charHandler).toHaveBeenCalledWith('1', expect.any(Object));
    });

    it('should not emit char events for special keys', () => {
      keyboard.onChar(charHandler);
      keyboard.start();

      const keypressHandler = mockStdin.on.mock.calls.find(
        call => call[0] === 'keypress'
      )?.[1];

      keypressHandler?.('', { name: 'return' });
      keypressHandler?.('', { name: 'escape' });
      keypressHandler?.('', { name: 'tab' });

      expect(charHandler).not.toHaveBeenCalled();
    });
  });
});