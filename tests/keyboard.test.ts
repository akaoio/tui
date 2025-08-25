import { Keyboard, Key } from '../src/core/keyboard';
import { mockStdin } from './setup';

describe('Keyboard', () => {
  let keyboard: Keyboard;
  let dataListener: any;
  let keypressListener: any;

  beforeEach(() => {
    jest.clearAllMocks();
    keyboard = new Keyboard(mockStdin as any);
    
    // Capture the event listeners
    dataListener = mockStdin.on.mock.calls.find(call => call[0] === 'data')?.[1];
    keypressListener = mockStdin.on.mock.calls.find(call => call[0] === 'keypress')?.[1];
  });

  afterEach(() => {
    keyboard.stop();
  });

  describe('Initialization', () => {
    it('should set raw mode on start', () => {
      keyboard.start();
      expect(mockStdin.setRawMode).toHaveBeenCalledWith(true);
      expect(mockStdin.resume).toHaveBeenCalled();
    });

    it('should disable raw mode on stop', () => {
      keyboard.start();
      keyboard.stop();
      expect(mockStdin.setRawMode).toHaveBeenCalledWith(false);
      expect(mockStdin.pause).toHaveBeenCalled();
    });
  });

  describe('Key Event Handling', () => {
    it('should handle character keys', (done) => {
      keyboard.onChar((char: string, event: any) => {
        expect(char).toBe('a');
        done();
      });

      // Simulate keypress by emitting the event directly
      keyboard.emit('char', 'a', { name: 'a', sequence: 'a' });
    });

    it('should handle special keys', (done) => {
      keyboard.onKey(Key.ENTER, () => {
        done();
      });

      keyboard.emit('keypress', '\r', { name: 'return', sequence: '\r' } as any);
    });

    it('should handle arrow keys', () => {
      const upHandler = jest.fn();
      const downHandler = jest.fn();
      const leftHandler = jest.fn();
      const rightHandler = jest.fn();

      keyboard.onKey(Key.UP, upHandler);
      keyboard.onKey(Key.DOWN, downHandler);
      keyboard.onKey(Key.LEFT, leftHandler);
      keyboard.onKey(Key.RIGHT, rightHandler);

      keyboard.emit('keypress', '', { name: 'up', sequence: '\x1b[A' } as any);
      keyboard.emit('keypress', '', { name: 'down', sequence: '\x1b[B' } as any);
      keyboard.emit('keypress', '', { name: 'left', sequence: '\x1b[D' } as any);
      keyboard.emit('keypress', '', { name: 'right', sequence: '\x1b[C' } as any);

      expect(upHandler).toHaveBeenCalled();
      expect(downHandler).toHaveBeenCalled();
      expect(leftHandler).toHaveBeenCalled();
      expect(rightHandler).toHaveBeenCalled();
    });

    it('should handle function keys', () => {
      const f1Handler = jest.fn();
      const f12Handler = jest.fn();

      keyboard.onKey(Key.F1, f1Handler);
      keyboard.onKey(Key.F12, f12Handler);

      keyboard.emit('keypress', '', { name: 'f1', sequence: '\x1bOP' } as any);
      keyboard.emit('keypress', '', { name: 'f12', sequence: '\x1b[24~' } as any);

      expect(f1Handler).toHaveBeenCalled();
      expect(f12Handler).toHaveBeenCalled();
    });

    it('should handle control combinations', () => {
      const ctrlCHandler = jest.fn();
      const ctrlXHandler = jest.fn();

      keyboard.onKey(Key.CTRL_C, ctrlCHandler);
      keyboard.onKey(Key.CTRL_X, ctrlXHandler);

      keyboard.emit('keypress', '', { name: 'c', ctrl: true, sequence: '\x03' } as any);
      keyboard.emit('keypress', '', { name: 'x', ctrl: true, sequence: '\x18' } as any);

      expect(ctrlCHandler).toHaveBeenCalled();
      expect(ctrlXHandler).toHaveBeenCalled();
    });

    it('should handle tab and escape', () => {
      const tabHandler = jest.fn();
      const escHandler = jest.fn();

      keyboard.onKey(Key.TAB, tabHandler);
      keyboard.onKey(Key.ESCAPE, escHandler);

      keyboard.emit('keypress', '\t', { name: 'tab', sequence: '\t' } as any);
      keyboard.emit('keypress', '\x1b', { name: 'escape', sequence: '\x1b' } as any);

      expect(tabHandler).toHaveBeenCalled();
      expect(escHandler).toHaveBeenCalled();
    });

    it('should handle backspace and delete', () => {
      const backspaceHandler = jest.fn();
      const deleteHandler = jest.fn();

      keyboard.onKey(Key.BACKSPACE, backspaceHandler);
      keyboard.onKey(Key.DELETE, deleteHandler);

      keyboard.emit('keypress', '\x7f', { name: 'backspace', sequence: '\x7f' } as any);
      keyboard.emit('keypress', '', { name: 'delete', sequence: '\x1b[3~' } as any);

      expect(backspaceHandler).toHaveBeenCalled();
      expect(deleteHandler).toHaveBeenCalled();
    });

    it('should handle page navigation keys', () => {
      const pageUpHandler = jest.fn();
      const pageDownHandler = jest.fn();
      const homeHandler = jest.fn();
      const endHandler = jest.fn();

      keyboard.onKey(Key.PAGE_UP, pageUpHandler);
      keyboard.onKey(Key.PAGE_DOWN, pageDownHandler);
      keyboard.onKey(Key.HOME, homeHandler);
      keyboard.onKey(Key.END, endHandler);

      keyboard.emit('keypress', '', { name: 'pageup', sequence: '\x1b[5~' } as any);
      keyboard.emit('keypress', '', { name: 'pagedown', sequence: '\x1b[6~' } as any);
      keyboard.emit('keypress', '', { name: 'home', sequence: '\x1b[H' } as any);
      keyboard.emit('keypress', '', { name: 'end', sequence: '\x1b[F' } as any);

      expect(pageUpHandler).toHaveBeenCalled();
      expect(pageDownHandler).toHaveBeenCalled();
      expect(homeHandler).toHaveBeenCalled();
      expect(endHandler).toHaveBeenCalled();
    });
  });

  describe('Generic Key Handler', () => {
    it('should handle any keypress event', () => {
      const handler = jest.fn();
      
      keyboard.onKeypress(handler);
      
      const keyEvent = { name: 'a', sequence: 'a', ctrl: false, meta: false, shift: false };
      keyboard.emit('keypress', 'a', keyEvent as any);
      
      expect(handler).toHaveBeenCalledWith('a', keyEvent);
    });

    it('should call multiple handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      keyboard.onKeypress(handler1);
      keyboard.onKeypress(handler2);
      
      keyboard.emit('keypress', 'b', { name: 'b', sequence: 'b' } as any);
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('Event Cleanup', () => {
    it('should remove all listeners on stop', () => {
      keyboard.start();
      
      const handler = jest.fn();
      keyboard.onChar(handler);
      
      keyboard.stop();
      
      expect(mockStdin.removeAllListeners).toHaveBeenCalledWith('keypress');
      expect(mockStdin.removeAllListeners).toHaveBeenCalledWith('data');
    });

    it('should not process events after stop', () => {
      const handler = jest.fn();
      keyboard.onChar(handler);
      
      keyboard.start();
      keyboard.stop();
      
      // Try to trigger event after stop
      keyboard.emit('keypress', 'a', { name: 'a', sequence: 'a' } as any);
      
      // Handler should not be called since keyboard is stopped
      expect(handler).not.toHaveBeenCalled();
    });
  });
});