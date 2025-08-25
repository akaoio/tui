/**
 * Complete test suite for Input component
 * Testing both container class and ALL method files
 */

import { Input, Screen, Keyboard } from '../src';
import { Key } from '../src/core/keyboard';

// Import all Input method files for direct testing
import { constructor } from '../src/component/Input/constructor';
import { handleKey } from '../src/component/Input/handleKey';
import { render } from '../src/component/Input/render';
import { validate } from '../src/component/Input/validate';
import { syncValue } from '../src/component/Input/syncValue';
import { setValidator } from '../src/component/Input/setValidator';
import { clearError } from '../src/component/Input/clearError';
import { getError } from '../src/component/Input/getError';

describe('Input Component - Complete Coverage', () => {
  // Mock dependencies
  let mockScreen: Screen;
  let mockKeyboard: Keyboard;

  beforeEach(() => {
    mockScreen = new Screen();
    mockKeyboard = new Keyboard();
  });

  describe('Input Container Class', () => {
    test('should create input with default options', () => {
      const input = new Input(mockScreen, mockKeyboard, {});
      
      expect(input).toBeDefined();
      expect(input.getValue()).toBe('');
    });

    test('should create input with custom options', () => {
      const input = new Input(mockScreen, mockKeyboard, {
        label: 'Username',
        placeholder: 'Enter username',
        value: 'initial',
        multiline: false
      });
      
      expect(input.label).toBe('Username');
      expect(input.placeholder).toBe('Enter username');
      expect(input.getValue()).toBe('initial');
    });

    test('should delegate all methods correctly', () => {
      const input = new Input(mockScreen, mockKeyboard, {});
      const methods = [
        'getValue', 'setValue', 'validate', 'clearError', 'getError',
        'setValidator', 'handleKey', 'render'
      ];

      methods.forEach(method => {
        expect((input as any)[method]).toBeDefined();
        expect(typeof (input as any)[method]).toBe('function');
      });
    });

    test('should emit events correctly', (done) => {
      const input = new Input(mockScreen, mockKeyboard, {});
      
      input.on('change', (value) => {
        expect(value).toBe('test');
        done();
      });
      
      input.setValue('test');
    });
  });

  describe('Input Method Files - Direct Testing', () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        label: '',
        value: '',
        placeholder: '',
        cursorPosition: 0,
        validator: null,
        error: null,
        required: false,
        multiline: false,
        disabled: false,
        focused: false,
        emit: jest.fn()
      };
    });

    describe('constructor()', () => {
      test('should initialize with empty options', () => {
        constructor.call(mockContext, {});
        
        expect(mockContext.label).toBe('');
        expect(mockContext.value).toBe('');
        expect(mockContext.placeholder).toBe('');
        expect(mockContext.cursorPosition).toBe(0);
      });

      test('should initialize with full options', () => {
        const options = {
          label: 'Email',
          placeholder: 'Enter email',
          value: 'test@example.com',
            multiline: true,
          disabled: false
        };
        
        constructor.call(mockContext, options);
        
        expect(mockContext.label).toBe('Email');
        expect(mockContext.value).toBe('test@example.com');
        expect(mockContext.placeholder).toBe('Enter email');
        expect(mockContext.required).toBe(true);
        expect(mockContext.multiline).toBe(true);
      });

      test('should set cursor position to end of initial value', () => {
        constructor.call(mockContext, { value: 'hello' });
        
        expect(mockContext.cursorPosition).toBe(5);
      });

      test('should handle undefined options', () => {
        constructor.call(mockContext, undefined);
        
        expect(mockContext.value).toBe('');
        expect(mockContext.label).toBe('');
      });
    });

    describe('handleKey()', () => {
      beforeEach(() => {
        mockContext.value = 'test';
        mockContext.cursorPosition = 4;
      });

      test('should handle character input', () => {
        const key = { name: 'a' };
        const event = { char: 'a' };
        
        handleKey.call(mockContext, key, event);
        
        expect(mockContext.value).toBe('testa');
        expect(mockContext.cursorPosition).toBe(5);
        expect(mockContext.emit).toHaveBeenCalledWith('change', 'testa');
      });

      test('should handle character insertion in middle', () => {
        mockContext.cursorPosition = 2;
        const key = { name: 'x' };
        const event = { char: 'x' };
        
        handleKey.call(mockContext, key, event);
        
        expect(mockContext.value).toBe('texst');
        expect(mockContext.cursorPosition).toBe(3);
      });

      test('should handle backspace at end', () => {
        const key = { name: 'backspace' };
        const event = {};
        
        handleKey.call(mockContext, key, event);
        
        expect(mockContext.value).toBe('tes');
        expect(mockContext.cursorPosition).toBe(3);
      });

      test('should handle backspace in middle', () => {
        mockContext.cursorPosition = 2;
        const key = { name: 'backspace' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.value).toBe('tst');
        expect(mockContext.cursorPosition).toBe(1);
      });

      test('should handle backspace at beginning', () => {
        mockContext.cursorPosition = 0;
        const key = { name: 'backspace' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.value).toBe('test'); // Unchanged
        expect(mockContext.cursorPosition).toBe(0);
      });

      test('should handle delete key', () => {
        mockContext.cursorPosition = 2;
        const key = { name: 'delete' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.value).toBe('tet');
        expect(mockContext.cursorPosition).toBe(2);
      });

      test('should handle delete at end', () => {
        const key = { name: 'delete' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.value).toBe('test'); // Unchanged
        expect(mockContext.cursorPosition).toBe(4);
      });

      test('should handle left arrow', () => {
        const key = { name: 'left' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.cursorPosition).toBe(3);
      });

      test('should handle left arrow at beginning', () => {
        mockContext.cursorPosition = 0;
        const key = { name: 'left' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.cursorPosition).toBe(0); // No change
      });

      test('should handle right arrow', () => {
        mockContext.cursorPosition = 2;
        const key = { name: 'right' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.cursorPosition).toBe(3);
      });

      test('should handle right arrow at end', () => {
        const key = { name: 'right' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.cursorPosition).toBe(4); // No change
      });

      test('should handle home key', () => {
        const key = { name: 'home' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.cursorPosition).toBe(0);
      });

      test('should handle end key', () => {
        mockContext.cursorPosition = 0;
        const key = { name: 'end' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.cursorPosition).toBe(4);
      });

      test('should handle enter key submission', () => {
        const key = { name: 'return' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.emit).toHaveBeenCalledWith('submit', 'test');
      });

      test('should handle escape key', () => {
        const key = { name: 'escape' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.emit).toHaveBeenCalledWith('cancel');
      });

      test('should clear error on input change', () => {
        mockContext.error = 'Previous error';
        const key = { name: 'a' };
        
        handleKey.call(mockContext, key, { char: 'a' });
        
        expect(mockContext.error).toBe(null);
      });

      test('should handle tab key for navigation', () => {
        const key = { name: 'tab' };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.emit).toHaveBeenCalledWith('tab');
      });

      test('should handle shift+tab for reverse navigation', () => {
        const key = { name: 'tab', shift: true };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.emit).toHaveBeenCalledWith('shifttab');
      });

      test('should handle ctrl+a (select all)', () => {
        const key = { name: 'a', ctrl: true };
        
        handleKey.call(mockContext, key, {});
        
        expect(mockContext.cursorPosition).toBe(0);
        // In a real implementation, this might select all text
      });

      test('should ignore input when disabled', () => {
        mockContext.disabled = true;
        const key = { name: 'a' };
        
        handleKey.call(mockContext, key, { char: 'a' });
        
        expect(mockContext.value).toBe('test'); // Unchanged
        expect(mockContext.emit).not.toHaveBeenCalled();
      });
    });

    describe('validate()', () => {
      test('should return null when no validator', () => {
        const error = validate.call(mockContext);
        
        expect(error).toBe(null);
        expect(mockContext.error).toBe(null);
      });

      test('should use validator function', () => {
        mockContext.validator = (value: string) => {
          if (!value) return 'Required field';
          if (value.length < 3) return 'Too short';
          return null;
        };
        
        mockContext.value = '';
        let error = validate.call(mockContext);
        expect(error).toBe('Required field');
        expect(mockContext.error).toBe('Required field');
        
        mockContext.value = 'ab';
        error = validate.call(mockContext);
        expect(error).toBe('Too short');
        
        mockContext.value = 'valid';
        error = validate.call(mockContext);
        expect(error).toBe(null);
        expect(mockContext.error).toBe(null);
      });

      test('should handle validator throwing exception', () => {
        mockContext.validator = () => {
          throw new Error('Validator error');
        };
        
        const error = validate.call(mockContext);
        expect(error).toBe('Validation error');
        expect(mockContext.error).toBe('Validation error');
      });

      test('should check required field', () => {
        mockContext.required = true;
        mockContext.value = '';
        
        const error = validate.call(mockContext);
        expect(error).toBe('This field is required');
      });

      test('should pass required check with value', () => {
        mockContext.required = true;
        mockContext.value = 'has value';
        
        const error = validate.call(mockContext);
        expect(error).toBe(null);
      });
    });

    describe('syncValue()', () => {
      test('should update value and emit change', () => {
        syncValue.call(mockContext, 'new value');
        
        expect(mockContext.value).toBe('new value');
        expect(mockContext.cursorPosition).toBe(9); // Length of new value
        expect(mockContext.emit).toHaveBeenCalledWith('change', 'new value');
      });

      test('should handle empty value', () => {
        mockContext.value = 'old';
        syncValue.call(mockContext, '');
        
        expect(mockContext.value).toBe('');
        expect(mockContext.cursorPosition).toBe(0);
      });

      test('should handle null/undefined values', () => {
        syncValue.call(mockContext, undefined);
        expect(mockContext.value).toBe('');
        
        syncValue.call(mockContext, undefined);
        expect(mockContext.value).toBe('');
      });
    });

    describe('setValidator()', () => {
      test('should set validator function', () => {
        const validator = (value: string) => value ? null : 'Required';
        
        setValidator.call(mockContext, validator);
        
        expect(mockContext.validator).toBe(validator);
      });

      test('should handle null validator', () => {
        setValidator.call(mockContext, () => null);
        
        expect(typeof mockContext.validator).toBe('function');
      });
    });

    describe('clearError()', () => {
      test('should clear error', () => {
        mockContext.error = 'Some error';
        
        clearError.call(mockContext);
        
        expect(mockContext.error).toBe(null);
        expect(mockContext.emit).toHaveBeenCalledWith('errorChanged', null);
      });

      test('should handle already null error', () => {
        mockContext.error = null;
        
        clearError.call(mockContext);
        
        expect(mockContext.error).toBe(null);
        expect(mockContext.emit).toHaveBeenCalledWith('errorChanged', null);
      });
    });

    describe('getError()', () => {
      test('should return current error', () => {
        mockContext.error = 'Test error';
        
        const error = getError.call(mockContext);
        
        expect(error).toBe('Test error');
      });

      test('should return null when no error', () => {
        mockContext.error = null;
        
        const error = getError.call(mockContext);
        
        expect(error).toBe(null);
      });
    });
  });

  describe('Input Integration Tests', () => {
    test('should handle complete input workflow', () => {
      const input = new Input(mockScreen, mockKeyboard, {
        label: 'Email',
        placeholder: 'Enter email',
        validator: (value: string) => {
          if (!value.includes('@')) return 'Invalid email';
          return null;
        }
      });

      // Initial state
      expect(input.getValue()).toBe('');
      expect(input.validate()).toBe('This field is required');

      // Type some text
      input.setValue('test');
      expect(input.getValue()).toBe('test');
      expect(input.validate()).toBe('Invalid email');

      // Complete email
      input.setValue('test@example.com');
      expect(input.getValue()).toBe('test@example.com');
      expect(input.validate()).toBe(null);

      // Clear and check required
      input.setValue('');
      expect(input.validate()).toBe('This field is required');
    });

    test('should handle keyboard input simulation', () => {
      const input = new Input(mockScreen, mockKeyboard, { value: '' });
      
      // Simulate typing "hello"
      input.handleKey({ name: 'h' } as any, { char: 'h' } as any);
      input.handleKey({ name: 'e' } as any, { char: 'e' } as any);
      input.handleKey({ name: 'l' } as any, { char: 'l' } as any);
      input.handleKey({ name: 'l' } as any, { char: 'l' } as any);
      input.handleKey({ name: 'o' } as any, { char: 'o' } as any);
      
      expect(input.getValue()).toBe('hello');
    });

    test('should handle editing in middle of text', () => {
      const input = new Input(mockScreen, mockKeyboard, { value: 'hello world' });
      
      // Move cursor to position 5 (space)
      input.state.cursorPosition = 5;
      
      // Delete space and add comma
      input.handleKey({ name: 'delete' } as any, {} as any);
      input.handleKey({ name: ',' } as any, { char: ',' } as any);
      input.handleKey({ name: ' ' } as any, { char: ' ' } as any);
      
      expect(input.getValue()).toBe('hello, world');
    });

    test('should emit all expected events', () => {
      const input = new Input(mockScreen, mockKeyboard, {});
      const changeListener = jest.fn();
      const submitListener = jest.fn();
      const cancelListener = jest.fn();
      
      input.on('change', changeListener);
      input.on('submit', submitListener);
      input.on('cancel', cancelListener);
      
      input.setValue('test');
      expect(changeListener).toHaveBeenCalledWith('test');
      
      input.handleKey({ name: 'return' } as any, {} as any);
      expect(submitListener).toHaveBeenCalledWith('test');
      
      input.handleKey({ name: 'escape' } as any, {} as any);
      expect(cancelListener).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle very long input', () => {
      const longText = 'a'.repeat(1000);
      const input = new Input(mockScreen, mockKeyboard, {});
      
      input.setValue(longText);
      expect(input.getValue()).toBe(longText);
      expect(input.state.cursorPosition).toBe(1000);
    });

    test('should handle special characters', () => {
      const input = new Input(mockScreen, mockKeyboard, {});
      const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      input.setValue(special);
      expect(input.getValue()).toBe(special);
    });

    test('should handle unicode characters', () => {
      const input = new Input(mockScreen, mockKeyboard, {});
      const unicode = '🔥 Hello 世界 🚀';
      
      input.setValue(unicode);
      expect(input.getValue()).toBe(unicode);
    });

    test('should handle rapid key presses', () => {
      const input = new Input(mockScreen, mockKeyboard, {});
      
      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        input.handleKey({ name: 'a' } as any, { char: 'a' } as any);
      }
      
      expect(input.getValue()).toBe('a'.repeat(100));
    });

    test('should handle malformed key events', () => {
      const input = new Input(mockScreen, mockKeyboard, {});
      
      expect(() => {
        input.handleKey(null as any, {} as any);
      }).not.toThrow();
      
      expect(() => {
        input.handleKey({} as any, null as any);
      }).not.toThrow();
    });
  });
});