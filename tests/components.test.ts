import { Input } from '../src/component/Input/Input';
import { Checkbox } from '../src/component/Checkbox/Checkbox';
import { Radio } from '../src/component/Radio/Radio';
import { Select } from '../src/component/Select/Select';
import { Spinner } from '../src/component/Spinner/Spinner';
import { ProgressBar } from '../src/component/ProgressBar/ProgressBar';
import { Screen } from '../src/core/screen';
import { Keyboard, Key } from '../src/core/keyboard';
import { mockStdout, mockStdin, createKeyEvent } from './setup';

describe('Components', () => {
  let screen: Screen;
  let keyboard: Keyboard;

  beforeEach(() => {
    jest.clearAllMocks();
    screen = new Screen(mockStdout as any);
    keyboard = new Keyboard(mockStdin as any);
  });

  describe('Input', () => {
    it('should create input with placeholder', () => {
      const input = new Input(screen, keyboard, {
        placeholder: 'Enter text...',
        x: 0,
        y: 0,
      });

      input.render();
      expect(mockStdout.write).toHaveBeenCalled();
    });

    it('should handle text input and emit change', () => {
      const input = new Input(screen, keyboard);
      const changeSpy = jest.fn();
      input.on('change', changeSpy);

      input.focus();
      
      // Simulate typing 'a'
      const event = createKeyEvent('a');
      input.handleKey('a' as Key, event);
      
      expect(changeSpy).toHaveBeenCalledWith('a');
      expect(input.getValue()).toBe('a');
    });

    it('should validate input on submit', () => {
      const validator = jest.fn((value: string) => {
        return value.length < 3 ? 'Too short' : null;
      });

      const input = new Input(screen, keyboard, { validator });
      const errorSpy = jest.fn();
      input.on('error', errorSpy);
      
      input.setValue('ab');
      input.focus();
      
      // Trigger validation with Enter
      input.handleKey(Key.ENTER, createKeyEvent('return'));
      
      expect(errorSpy).toHaveBeenCalledWith('Too short');
      expect(input.getError()).toBe('Too short');
    });

    it('should handle backspace correctly', () => {
      const input = new Input(screen, keyboard);
      input.setValue('test');
      input.focus();
      
      // Move cursor to end
      input.state.cursorPosition = 4;
      
      input.handleKey(Key.BACKSPACE, createKeyEvent('backspace'));
      expect(input.getValue()).toBe('tes');
      expect(input.state.cursorPosition).toBe(3);
    });

    it('should handle arrow key navigation', () => {
      const input = new Input(screen, keyboard);
      input.setValue('hello');
      input.state.cursorPosition = 5;
      input.focus();
      
      // Move left
      input.handleKey(Key.LEFT, createKeyEvent('left'));
      expect(input.state.cursorPosition).toBe(4);
      
      // Move right
      input.handleKey(Key.RIGHT, createKeyEvent('right'));
      expect(input.state.cursorPosition).toBe(5);
    });

    it('should clear error on valid input', () => {
      const validator = (value: string) => value.length < 3 ? 'Too short' : null;
      const input = new Input(screen, keyboard, { validator });
      
      // Set invalid value and validate
      input.setValue('ab');
      input.validate();
      expect(input.getError()).toBe('Too short');
      
      // Set valid value
      input.setValue('valid');
      input.clearError();
      expect(input.getError()).toBeNull();
    });
  });

  describe('Checkbox', () => {
    it('should toggle on space', () => {
      const checkbox = new Checkbox(screen, keyboard, {
        label: 'Test checkbox',
      });

      expect(checkbox.isChecked()).toBe(false);
      
      checkbox.focus();
      checkbox.handleKey(Key.SPACE, createKeyEvent('space'));
      
      expect(checkbox.isChecked()).toBe(true);
      
      checkbox.handleKey(Key.SPACE, createKeyEvent('space'));
      expect(checkbox.isChecked()).toBe(false);
    });

    it('should emit change event', () => {
      const checkbox = new Checkbox(screen, keyboard, {
        label: 'Test',
      });

      const changeSpy = jest.fn();
      checkbox.on('change', changeSpy);
      
      checkbox.toggle();
      expect(changeSpy).toHaveBeenCalledWith(true);
      
      checkbox.toggle();
      expect(changeSpy).toHaveBeenCalledWith(false);
    });

    it('should not toggle when disabled', () => {
      const checkbox = new Checkbox(screen, keyboard, {
        label: 'Test',
        disabled: true,
      });

      expect(checkbox.isDisabled()).toBe(true);
      expect(checkbox.isChecked()).toBe(false);
      
      checkbox.toggle();
      expect(checkbox.isChecked()).toBe(false);
    });

    it('should handle check/uncheck methods', () => {
      const checkbox = new Checkbox(screen, keyboard, {
        label: 'Test',
      });

      checkbox.check();
      expect(checkbox.isChecked()).toBe(true);
      
      checkbox.uncheck();
      expect(checkbox.isChecked()).toBe(false);
    });
  });

  describe('Radio', () => {
    const options = [
      { value: 1, label: 'Option 1' },
      { value: 2, label: 'Option 2' },
      { value: 3, label: 'Option 3' },
    ];

    it('should select option with arrow keys', () => {
      const radio = new Radio(screen, keyboard, { options });
      
      expect(radio.getSelectedOption()).toEqual(options[0]);
      
      radio.focus();
      radio.handleKey(Key.DOWN, createKeyEvent('down'));
      expect(radio.getSelectedOption()).toEqual(options[1]);
      
      radio.handleKey(Key.UP, createKeyEvent('up'));
      expect(radio.getSelectedOption()).toEqual(options[0]);
    });

    it('should emit change event on selection', () => {
      const radio = new Radio(screen, keyboard, { options });
      const changeSpy = jest.fn();
      radio.on('change', changeSpy);
      
      radio.focus();
      radio.handleKey(Key.DOWN, createKeyEvent('down'));
      expect(changeSpy).toHaveBeenCalledWith(2);
    });

    it('should select by value', () => {
      const radio = new Radio(screen, keyboard, { options });
      
      radio.selectByValue(3);
      expect(radio.getSelectedOption()).toEqual(options[2]);
    });

    it('should handle horizontal layout', () => {
      const radio = new Radio(screen, keyboard, { 
        options,
        orientation: 'horizontal' 
      });
      
      radio.focus();
      radio.handleKey(Key.RIGHT, createKeyEvent('right'));
      expect(radio.getSelectedOption()).toEqual(options[1]);
      
      radio.handleKey(Key.LEFT, createKeyEvent('left'));
      expect(radio.getSelectedOption()).toEqual(options[0]);
    });
  });

  describe('Select', () => {
    const options = [
      { value: 1, label: 'First' },
      { value: 2, label: 'Second' },
      { value: 3, label: 'Third' },
    ];

    it('should open and close dropdown', () => {
      const select = new Select(screen, keyboard, { options });
      
      expect(select.isOpen).toBe(false);
      
      select.open();
      expect(select.isOpen).toBe(true);
      
      select.close();
      expect(select.isOpen).toBe(false);
    });

    it('should navigate options with arrow keys', () => {
      const select = new Select(screen, keyboard, { options });
      
      select.open();
      select.focus();
      
      expect(select.highlightedIndex).toBe(0);
      
      select.handleKey(Key.DOWN, createKeyEvent('down'));
      expect(select.highlightedIndex).toBe(1);
      
      select.handleKey(Key.UP, createKeyEvent('up'));
      expect(select.highlightedIndex).toBe(0);
    });

    it('should select option with enter/space', () => {
      const select = new Select(screen, keyboard, { options });
      const changeSpy = jest.fn();
      select.on('change', changeSpy);
      
      select.open();
      select.highlightedIndex = 1;
      select.selectCurrent();
      
      expect(changeSpy).toHaveBeenCalledWith(2);
      expect(select.getSelectedOption()).toEqual(options[1]);
    });

    it('should support multiple selection', () => {
      const select = new Select(screen, keyboard, { 
        options,
        multiple: true 
      });
      
      select.open();
      
      // Select first item
      select.highlightedIndex = 0;
      select.selectCurrent();
      
      // Select second item
      select.highlightedIndex = 1;
      select.selectCurrent();
      
      const selected = select.getSelectedOptions();
      expect(selected).toHaveLength(2);
      expect(selected.map(o => o.value)).toEqual([1, 2]);
    });

    it('should clear selection', () => {
      const select = new Select(screen, keyboard, { options });
      
      select.selectedIndex = 1;
      expect(select.getSelectedOption()).toEqual(options[1]);
      
      select.clear();
      expect(select.selectedIndex).toBe(-1);
      expect(select.getSelectedOption()).toBeUndefined();
    });
  });

  describe('Spinner', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start and stop spinning', () => {
      const spinner = new Spinner(screen, keyboard, {
        text: 'Loading...',
      });

      expect(spinner.isSpinning).toBe(false);
      
      spinner.start();
      expect(spinner.isSpinning).toBe(true);
      
      spinner.stop();
      expect(spinner.isSpinning).toBe(false);
    });

    it('should rotate through frames', () => {
      const spinner = new Spinner(screen, keyboard);
      const frames = spinner.getFrames();
      
      expect(spinner.frameIndex).toBe(0);
      
      spinner.start();
      jest.advanceTimersByTime(spinner.interval);
      
      expect(spinner.frameIndex).toBe(1);
      
      jest.advanceTimersByTime(spinner.interval * frames.length);
      expect(spinner.frameIndex).toBe(1); // Should wrap around
    });

    it('should show success/fail/warning states', () => {
      const spinner = new Spinner(screen, keyboard);
      
      spinner.succeed('Done!');
      expect(spinner.text).toBe('Done!');
      expect(spinner.isSpinning).toBe(false);
      
      spinner.fail('Error!');
      expect(spinner.text).toBe('Error!');
      
      spinner.warn('Warning!');
      expect(spinner.text).toBe('Warning!');
      
      spinner.info('Info!');
      expect(spinner.text).toBe('Info!');
    });

    it('should clear spinner output', () => {
      const spinner = new Spinner(screen, keyboard);
      spinner.render();
      
      const clearSpy = jest.spyOn(spinner, 'clear');
      spinner.clear();
      
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('ProgressBar', () => {
    it('should update progress', () => {
      const progress = new ProgressBar(screen, keyboard, {
        total: 100,
      });

      expect(progress.getCurrent()).toBe(0);
      expect(progress.getPercentage()).toBe(0);
      
      progress.setProgress(50);
      expect(progress.getCurrent()).toBe(50);
      expect(progress.getPercentage()).toBe(50);
      
      progress.setProgress(100);
      expect(progress.getCurrent()).toBe(100);
      expect(progress.getPercentage()).toBe(100);
    });

    it('should increment and decrement', () => {
      const progress = new ProgressBar(screen, keyboard, {
        total: 10,
        current: 5,
      });

      progress.increment();
      expect(progress.getCurrent()).toBe(6);
      
      progress.decrement();
      expect(progress.getCurrent()).toBe(5);
    });

    it('should not exceed total', () => {
      const progress = new ProgressBar(screen, keyboard, {
        total: 10,
      });

      progress.setProgress(15);
      expect(progress.getCurrent()).toBe(10);
    });

    it('should not go below zero', () => {
      const progress = new ProgressBar(screen, keyboard, {
        total: 10,
        current: 0,
      });

      progress.decrement();
      expect(progress.getCurrent()).toBe(0);
    });

    it('should complete progress', () => {
      const progress = new ProgressBar(screen, keyboard, {
        total: 100,
      });

      progress.complete();
      expect(progress.getCurrent()).toBe(100);
      expect(progress.getPercentage()).toBe(100);
    });

    it('should reset progress', () => {
      const progress = new ProgressBar(screen, keyboard, {
        total: 100,
        current: 50,
      });

      progress.reset();
      expect(progress.getCurrent()).toBe(0);
      expect(progress.getPercentage()).toBe(0);
    });
  });
});