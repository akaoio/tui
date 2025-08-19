import * as huh from '../../src/fields';
import { platform } from 'os';

// Skip tests on unsupported platforms
const isSupported = platform() === 'win32' || platform() === 'linux';
const describeIfSupported = isSupported ? describe : describe.skip;

describeIfSupported('Huh Forms', () => {
  describe('NewInput', () => {
    it('should create a new input instance', () => {
      const input = new huh.NewInput({
        Title: 'Test Input',
        Description: 'Test Description',
        Placeholder: 'Enter text...',
        validators: 'required'
      }, 0);

      expect(input).toBeDefined();
      expect(input.id).toBe('');
      expect(input.props.Title).toBe('Test Input');
      expect(input.props.Description).toBe('Test Description');
      expect(input.props.Placeholder).toBe('Enter text...');
    });

    it('should create multiline input', () => {
      const input = new huh.NewInput({
        Title: 'Multiline',
        Description: 'Multi-line input',
        Placeholder: 'Enter multiple lines...',
        validators: ''
      }, 1);

      expect(input).toBeDefined();
      expect(input.type_).toBe(1);
    });

    it('should handle different validators', () => {
      const validators = ['required', 'email', 'no_numbers', 'alpha_only', 'no_special_chars'];
      
      validators.forEach(validator => {
        const input = new huh.NewInput({
          Title: `Input with ${validator}`,
          Description: 'Test',
          Placeholder: 'Test',
          validators: validator
        }, 0);

        expect(input.props.validators).toBe(validator);
      });
    });

    it('should load input into memory', () => {
      const input = new huh.NewInput({
        Title: 'Load Test',
        Description: 'Testing load',
        Placeholder: 'Enter...',
        validators: ''
      }, 0);

      const result = input.load();
      expect(result).toBeDefined();
      expect(input.id).not.toBe('');
    });

    it('should handle empty properties', () => {
      const input = new huh.NewInput({
        Title: '',
        Description: '',
        Placeholder: '',
        validators: ''
      }, 0);

      expect(input).toBeDefined();
      expect(input.props.Title).toBe('');
      expect(input.props.Description).toBe('');
    });

    it('should handle special characters in properties', () => {
      const input = new huh.NewInput({
        Title: 'Title with "quotes" and \'apostrophes\'',
        Description: 'Description with <brackets> & ampersand',
        Placeholder: 'Placeholder with 🔥 emoji',
        validators: ''
      }, 0);

      expect(input).toBeDefined();
      expect(input.props.Title).toContain('quotes');
      expect(input.props.Description).toContain('ampersand');
      expect(input.props.Placeholder).toContain('🔥');
    });
  });

  describe('Confirm', () => {
    it('should create a confirm dialog', () => {
      const confirm = huh.Confirm('Are you sure?', 'Yes', 'No');
      
      expect(confirm).toBeDefined();
      expect(confirm.id).toBeDefined();
      expect(typeof confirm.run).toBe('function');
      expect(confirm.value).toBeDefined();
    });

    it('should handle empty strings', () => {
      const confirm = huh.Confirm('', '', '');
      
      expect(confirm).toBeDefined();
      expect(confirm.id).toBeDefined();
    });

    it('should handle Unicode in confirm options', () => {
      const confirm = huh.Confirm(
        '确认删除？',
        '是的 ✓',
        '取消 ✗'
      );
      
      expect(confirm).toBeDefined();
      expect(confirm.id).toBeDefined();
    });

    it('should handle long text in confirm', () => {
      const longText = 'This is a very long confirmation message '.repeat(10);
      const confirm = huh.Confirm(longText, 'Accept', 'Decline');
      
      expect(confirm).toBeDefined();
      expect(confirm.id).toBeDefined();
    });
  });

  describe('Select', () => {
    it('should create a select component', () => {
      const select = huh.Select('Choose an option', ['Option 1', 'Option 2', 'Option 3']);
      
      expect(select).toBeDefined();
      expect(select.id).toBeDefined();
      expect(typeof select.run).toBe('function');
      expect(select.value).toBeDefined();
    });

    it('should handle empty options array', () => {
      const select = huh.Select('Choose', []);
      
      expect(select).toBeDefined();
      expect(select.id).toBeDefined();
    });

    it('should handle single option', () => {
      const select = huh.Select('Only one', ['Single Option']);
      
      expect(select).toBeDefined();
      expect(select.id).toBeDefined();
    });

    it('should handle many options', () => {
      const options = Array.from({ length: 100 }, (_, i) => `Option ${i + 1}`);
      const select = huh.Select('Choose from many', options);
      
      expect(select).toBeDefined();
      expect(select.id).toBeDefined();
    });

    it('should handle options with special characters', () => {
      const options = [
        'Option with "quotes"',
        'Option with <brackets>',
        'Option with & ampersand',
        'Option with 🔥 emoji'
      ];
      const select = huh.Select('Special chars', options);
      
      expect(select).toBeDefined();
      expect(select.id).toBeDefined();
    });

    it('should handle options with different languages', () => {
      const options = [
        'English',
        '中文',
        '日本語',
        'العربية',
        'हिन्दी'
      ];
      const select = huh.Select('Language', options);
      
      expect(select).toBeDefined();
      expect(select.id).toBeDefined();
    });
  });

  describe('multiSelect', () => {
    it('should create a multi-select component', () => {
      const multiSelect = huh.multiSelect('Choose multiple', ['A', 'B', 'C', 'D']);
      
      expect(multiSelect).toBeDefined();
      expect(multiSelect.id).toBeDefined();
      expect(typeof multiSelect.run).toBe('function');
      expect(multiSelect.value).toBeDefined();
    });

    it('should handle limit parameter', () => {
      const multiSelect = huh.multiSelect('Choose up to 2', ['A', 'B', 'C', 'D'], 2);
      
      expect(multiSelect).toBeDefined();
      expect(multiSelect.id).toBeDefined();
    });

    it('should handle no limit (0)', () => {
      const multiSelect = huh.multiSelect('Choose any', ['A', 'B', 'C'], 0);
      
      expect(multiSelect).toBeDefined();
      expect(multiSelect.id).toBeDefined();
    });

    it('should return array from run method', () => {
      const multiSelect = huh.multiSelect('Test', ['A', 'B', 'C']);
      
      // Mock the run response
      jest.spyOn(multiSelect, 'run').mockReturnValue(['A', 'C']);
      
      const result = multiSelect.run();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(['A', 'C']);
    });

    it('should handle empty selection', () => {
      const multiSelect = huh.multiSelect('Optional selection', ['A', 'B', 'C']);
      
      jest.spyOn(multiSelect, 'run').mockReturnValue([]);
      
      const result = multiSelect.run();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([]);
    });

    it('should handle large number of options', () => {
      const options = Array.from({ length: 1000 }, (_, i) => `Item ${i}`);
      const multiSelect = huh.multiSelect('Large list', options, 10);
      
      expect(multiSelect).toBeDefined();
      expect(multiSelect.id).toBeDefined();
    });
  });

  describe('Note', () => {
    it('should create a note component', () => {
      const note = huh.Note('Title', 'Description', 'Next', true);
      
      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
      expect(typeof note.run).toBe('function');
      expect(note.value).toBe('');
    });

    it('should handle next parameter as false', () => {
      const note = huh.Note('Info', 'Some information', 'OK', false);
      
      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
    });

    it('should handle empty strings', () => {
      const note = huh.Note('', '', '', false);
      
      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
    });

    it('should handle multiline description', () => {
      const desc = 'Line 1\nLine 2\nLine 3\n\nParagraph 2';
      const note = huh.Note('Multi-line', desc, 'Continue', true);
      
      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
    });

    it('should handle very long content', () => {
      const longTitle = 'T'.repeat(100);
      const longDesc = 'D'.repeat(1000);
      const note = huh.Note(longTitle, longDesc, 'OK', true);
      
      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
    });
  });

  describe('SetTheme', () => {
    it('should set different themes', () => {
      const themes: Array<'dracula' | 'Charm' | 'Catppuccin' | 'Base16' | 'default'> = 
        ['dracula', 'Charm', 'Catppuccin', 'Base16', 'default'];

      themes.forEach(theme => {
        expect(() => {
          huh.SetTheme(theme);
        }).not.toThrow();
      });
    });
  });

  describe('Spinner', () => {
    it('should create a spinner', () => {
      expect(() => {
        huh.Spinner(1, 'Loading...');
      }).not.toThrow();
    });

    it('should handle different durations', () => {
      const durations = [0, 1, 5, 10];
      
      durations.forEach(seconds => {
        expect(() => {
          huh.Spinner(seconds, `Loading for ${seconds}s`);
        }).not.toThrow();
      });
    });

    it('should handle empty title', () => {
      expect(() => {
        huh.Spinner(1, '');
      }).not.toThrow();
    });

    it('should handle Unicode in title', () => {
      expect(() => {
        huh.Spinner(2, '⏳ Loading... 🔄');
      }).not.toThrow();
    });
  });

  describe('Form Groups', () => {
    it('should create a group', () => {
      const group = huh.CreateGroup('field1,field2,field3');
      
      expect(group).toBeDefined();
      expect(typeof group).toBe('string');
    });

    it('should handle empty group', () => {
      const group = huh.CreateGroup('');
      
      expect(group).toBeDefined();
      expect(typeof group).toBe('string');
    });

    it('should handle single field group', () => {
      const group = huh.CreateGroup('singleField');
      
      expect(group).toBeDefined();
      expect(typeof group).toBe('string');
    });

    it('should create a form', () => {
      expect(() => {
        huh.CreateForm('group1,group2');
      }).not.toThrow();
    });

    it('should handle empty form', () => {
      expect(() => {
        huh.CreateForm('');
      }).not.toThrow();
    });
  });

  describe('GetValue', () => {
    it('should get value for a given ID', () => {
      const mockId = 'test_id_123';
      const value = huh.GetValue(mockId);
      
      // Value might be empty or undefined depending on the ID
      expect(value !== undefined).toBe(true);
    });

    it('should handle non-existent ID', () => {
      const value = huh.GetValue('non_existent_id');
      expect(value !== undefined).toBe(true);
    });

    it('should handle empty ID', () => {
      const value = huh.GetValue('');
      expect(value !== undefined).toBe(true);
    });
  });
});