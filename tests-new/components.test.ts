import { Input, Checkbox, Radio, Select, Spinner, ProgressBar } from '../src-new/components';
import { Screen } from '../src-new/core/screen';
import { Keyboard, Key } from '../src-new/core/keyboard';
import { mockStdout, mockStdin, createKeyEvent } from './setup';

describe('Components', () => {
  let screen: Screen;
  let keyboard: Keyboard;

  beforeEach(() => {
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

    it('should handle text input', () => {
      const input = new Input(screen, keyboard);
      const changeSpy = jest.fn();
      input.on('change', changeSpy);

      input.focus();
      input.handleKey(Key.ENTER, createKeyEvent('a'));
      
      expect(changeSpy).toHaveBeenCalled();
    });

    it('should validate input', () => {
      const validator = jest.fn((value: string) => {
        return value.length < 3 ? 'Too short' : null;
      });

      const input = new Input(screen, keyboard, { validator });
      input.setValue('ab');
      
      const submitSpy = jest.fn();
      input.on('submit', submitSpy);
      
      input.focus();
      input.handleKey(Key.ENTER, createKeyEvent('return'));
      
      expect(input.getError()).toBe('Too short');
    });

    it('should handle backspace', () => {
      const input = new Input(screen, keyboard);
      input.setValue('test');
      input.focus();
      
      input.handleKey(Key.BACKSPACE, createKeyEvent('backspace'));
      expect(input.getValue()).toBe('tes');
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

      checkbox.focus();
      checkbox.handleKey(Key.SPACE, createKeyEvent('space'));
      
      expect(checkbox.isChecked()).toBe(false);
    });
  });

  describe('Radio', () => {
    it('should select options with arrow keys', () => {
      const radio = new Radio(screen, keyboard, {
        options: [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2 },
          { label: 'Option 3', value: 3 },
        ],
        orientation: 'vertical',
      });

      radio.focus();
      expect(radio.getValue()).toBe(1);
      
      radio.handleKey(Key.DOWN, createKeyEvent('down'));
      expect(radio.getValue()).toBe(2);
      
      radio.handleKey(Key.DOWN, createKeyEvent('down'));
      expect(radio.getValue()).toBe(3);
      
      radio.handleKey(Key.UP, createKeyEvent('up'));
      expect(radio.getValue()).toBe(2);
    });

    it('should skip disabled options', () => {
      const radio = new Radio(screen, keyboard, {
        options: [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2, disabled: true },
          { label: 'Option 3', value: 3 },
        ],
        orientation: 'vertical',
      });

      radio.focus();
      radio.handleKey(Key.DOWN, createKeyEvent('down'));
      
      expect(radio.getValue()).toBe(3); // Should skip option 2
    });
  });

  describe('Select', () => {
    it('should open and close dropdown', () => {
      const select = new Select(screen, keyboard, {
        options: [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2 },
        ],
      });

      const openSpy = jest.fn();
      const closeSpy = jest.fn();
      select.on('open', openSpy);
      select.on('close', closeSpy);

      select.focus();
      select.handleKey(Key.ENTER, createKeyEvent('return'));
      expect(openSpy).toHaveBeenCalled();
      
      select.handleKey(Key.ESCAPE, createKeyEvent('escape'));
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should navigate options', () => {
      const select = new Select(screen, keyboard, {
        options: [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2 },
          { label: 'Option 3', value: 3 },
        ],
      });

      select.focus();
      select.handleKey(Key.ENTER, createKeyEvent('return')); // Open
      
      select.handleKey(Key.DOWN, createKeyEvent('down'));
      select.handleKey(Key.DOWN, createKeyEvent('down'));
      select.handleKey(Key.ENTER, createKeyEvent('return')); // Select
      
      expect(select.getValue()).toBe(3);
    });

    it('should support multiple selection', () => {
      const select = new Select(screen, keyboard, {
        options: [
          { label: 'Option 1', value: 1 },
          { label: 'Option 2', value: 2 },
          { label: 'Option 3', value: 3 },
        ],
        multiple: true,
      });

      select.focus();
      select.handleKey(Key.ENTER, createKeyEvent('return')); // Open
      
      select.handleKey(Key.SPACE, createKeyEvent('space')); // Select first
      select.handleKey(Key.DOWN, createKeyEvent('down'));
      select.handleKey(Key.SPACE, createKeyEvent('space')); // Select second
      
      expect(select.getValue()).toEqual([1, 2]);
    });
  });

  describe('Spinner', () => {
    jest.useFakeTimers();

    it('should start and stop spinning', () => {
      const spinner = new Spinner(screen, keyboard, {
        text: 'Loading...',
      });

      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      spinner.on('start', startSpy);
      spinner.on('stop', stopSpy);

      spinner.start();
      expect(startSpy).toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      
      spinner.stop();
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should show success state', () => {
      const spinner = new Spinner(screen, keyboard);
      const successSpy = jest.fn();
      spinner.on('succeed', successSpy);

      spinner.start();
      spinner.succeed('Done!');
      
      expect(successSpy).toHaveBeenCalledWith('Done!');
    });

    it('should show fail state', () => {
      const spinner = new Spinner(screen, keyboard);
      const failSpy = jest.fn();
      spinner.on('fail', failSpy);

      spinner.start();
      spinner.fail('Error!');
      
      expect(failSpy).toHaveBeenCalledWith('Error!');
    });
  });

  describe('ProgressBar', () => {
    it('should update progress', () => {
      const progressBar = new ProgressBar(screen, keyboard, {
        total: 100,
        current: 0,
      });

      expect(progressBar.getPercentage()).toBe(0);
      
      progressBar.setProgress(50);
      expect(progressBar.getPercentage()).toBe(50);
      expect(progressBar.getCurrent()).toBe(50);
      
      progressBar.setProgress(100);
      expect(progressBar.getPercentage()).toBe(100);
    });

    it('should emit complete event', () => {
      const progressBar = new ProgressBar(screen, keyboard, {
        total: 100,
      });

      const completeSpy = jest.fn();
      progressBar.on('complete', completeSpy);
      
      progressBar.setProgress(100);
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should increment and decrement', () => {
      const progressBar = new ProgressBar(screen, keyboard, {
        total: 100,
        current: 50,
      });

      progressBar.increment(10);
      expect(progressBar.getCurrent()).toBe(60);
      
      progressBar.decrement(20);
      expect(progressBar.getCurrent()).toBe(40);
    });

    it('should not exceed bounds', () => {
      const progressBar = new ProgressBar(screen, keyboard, {
        total: 100,
      });

      progressBar.setProgress(150);
      expect(progressBar.getCurrent()).toBe(100);
      
      progressBar.setProgress(-10);
      expect(progressBar.getCurrent()).toBe(0);
    });
  });
});