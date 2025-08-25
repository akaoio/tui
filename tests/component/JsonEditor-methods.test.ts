/**
 * Comprehensive tests for JsonEditor component methods
 */

describe('JsonEditor Component Methods', () => {
  let mockContext: any;
  let mockScreen: any;
  let mockKeyboard: any;

  beforeEach(() => {
    // Setup mock screen
    mockScreen = {
      write: jest.fn(),
      writeAt: jest.fn(),
      clearLine: jest.fn(),
      moveCursor: jest.fn(),
      getWidth: jest.fn(() => 80),
      getHeight: jest.fn(() => 24),
      flush: jest.fn(),
      reset: jest.fn()
    };

    // Setup mock keyboard
    mockKeyboard = {
      on: jest.fn(),
      off: jest.fn(),
      handleKey: jest.fn()
    };

    // Setup mock context
    mockContext = {
      screen: mockScreen,
      keyboard: mockKeyboard,
      x: 0,
      y: 0,
      width: 60,
      height: 20,
      visible: true,
      focused: false,
      value: {},
      schema: {},
      currentPath: [],
      expandedPaths: new Set(),
      selectedPath: null,
      editingPath: null,
      editingValue: '',
      cursorPosition: 0,
      scrollOffset: 0,
      emit: jest.fn(),
      render: jest.fn()
    };
  });

  describe('JsonEditor constructor', () => {
    it('should initialize with default values', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      const ctx: any = {};
      
      JsonEditor.constructor.call(ctx, mockScreen, mockKeyboard, {});
      
      expect(ctx.value).toEqual({});
      expect(ctx.currentPath).toEqual([]);
      expect(ctx.expandedPaths).toBeInstanceOf(Set);
    });

    it('should initialize with initial value', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      const ctx: any = {};
      const initialValue = { foo: 'bar', nested: { key: 'value' } };
      
      JsonEditor.constructor.call(ctx, mockScreen, mockKeyboard, {
        value: initialValue
      });
      
      expect(ctx.value).toEqual(initialValue);
    });
  });

  describe('nodeTree', () => {
    it('should build tree from simple object', () => {
      const { nodeTree } = require('../../src/component/JsonEditor/nodeTree');
      mockContext.value = { name: 'John', age: 30 };
      
      const tree = nodeTree.buildTree.call(mockContext, mockContext.value);
      
      expect(tree).toHaveLength(2);
      expect(tree[0].key).toBe('name');
      expect(tree[0].value).toBe('John');
      expect(tree[1].key).toBe('age');
      expect(tree[1].value).toBe(30);
    });

    it('should build tree from nested object', () => {
      const { nodeTree } = require('../../src/component/JsonEditor/nodeTree');
      mockContext.value = {
        user: {
          name: 'John',
          address: {
            city: 'NYC'
          }
        }
      };
      
      const tree = nodeTree.buildTree.call(mockContext, mockContext.value);
      
      expect(tree).toHaveLength(1);
      expect(tree[0].key).toBe('user');
      expect(tree[0].type).toBe('object');
      expect(tree[0].children).toBeDefined();
    });

    it('should build tree from array', () => {
      const { nodeTree } = require('../../src/component/JsonEditor/nodeTree');
      mockContext.value = ['item1', 'item2', 'item3'];
      
      const tree = nodeTree.buildTree.call(mockContext, mockContext.value);
      
      expect(tree).toHaveLength(3);
      expect(tree[0].key).toBe('0');
      expect(tree[0].value).toBe('item1');
    });

    it('should flatten tree for rendering', () => {
      const { nodeTree } = require('../../src/component/JsonEditor/nodeTree');
      mockContext.value = {
        expanded: {
          child: 'value'
        },
        collapsed: {
          hidden: 'data'
        }
      };
      mockContext.expandedPaths.add('expanded');
      
      const tree = nodeTree.buildTree.call(mockContext, mockContext.value);
      const flat = nodeTree.flattenTree.call(mockContext, tree);
      
      expect(flat.length).toBeGreaterThan(2);
      expect(flat.some(n => n.key === 'child')).toBe(true);
      expect(flat.some(n => n.key === 'hidden')).toBe(false);
    });
  });

  describe('editingLogic', () => {
    it('should start editing a value', () => {
      const { editingLogic } = require('../../src/component/JsonEditor/editingLogic');
      
      editingLogic.startEditing.call(mockContext, ['user', 'name'], 'John');
      
      expect(mockContext.editingPath).toEqual(['user', 'name']);
      expect(mockContext.editingValue).toBe('John');
      expect(mockContext.cursorPosition).toBe(4);
    });

    it('should cancel editing', () => {
      const { editingLogic } = require('../../src/component/JsonEditor/editingLogic');
      mockContext.editingPath = ['user', 'name'];
      mockContext.editingValue = 'Modified';
      
      editingLogic.cancelEditing.call(mockContext);
      
      expect(mockContext.editingPath).toBeNull();
      expect(mockContext.editingValue).toBe('');
      expect(mockContext.render).toHaveBeenCalled();
    });

    it('should save edited string value', () => {
      const { editingLogic } = require('../../src/component/JsonEditor/editingLogic');
      mockContext.value = { user: { name: 'John' } };
      mockContext.editingPath = ['user', 'name'];
      mockContext.editingValue = 'Jane';
      
      editingLogic.saveEditing.call(mockContext);
      
      expect(mockContext.value.user.name).toBe('Jane');
      expect(mockContext.editingPath).toBeNull();
      expect(mockContext.emit).toHaveBeenCalledWith('change', mockContext.value);
    });

    it('should save edited number value', () => {
      const { editingLogic } = require('../../src/component/JsonEditor/editingLogic');
      mockContext.value = { age: 30 };
      mockContext.editingPath = ['age'];
      mockContext.editingValue = '35';
      
      editingLogic.saveEditing.call(mockContext);
      
      expect(mockContext.value.age).toBe(35);
      expect(typeof mockContext.value.age).toBe('number');
    });

    it('should save edited boolean value', () => {
      const { editingLogic } = require('../../src/component/JsonEditor/editingLogic');
      mockContext.value = { active: false };
      mockContext.editingPath = ['active'];
      mockContext.editingValue = 'true';
      
      editingLogic.saveEditing.call(mockContext);
      
      expect(mockContext.value.active).toBe(true);
      expect(typeof mockContext.value.active).toBe('boolean');
    });

    it('should save edited null value', () => {
      const { editingLogic } = require('../../src/component/JsonEditor/editingLogic');
      mockContext.value = { optional: 'value' };
      mockContext.editingPath = ['optional'];
      mockContext.editingValue = 'null';
      
      editingLogic.saveEditing.call(mockContext);
      
      expect(mockContext.value.optional).toBeNull();
    });

    it('should save edited JSON object', () => {
      const { editingLogic } = require('../../src/component/JsonEditor/editingLogic');
      mockContext.value = { data: {} };
      mockContext.editingPath = ['data'];
      mockContext.editingValue = '{"key":"value"}';
      
      editingLogic.saveEditing.call(mockContext);
      
      expect(mockContext.value.data).toEqual({ key: 'value' });
    });

    it('should handle invalid JSON gracefully', () => {
      const { editingLogic } = require('../../src/component/JsonEditor/editingLogic');
      mockContext.value = { data: {} };
      mockContext.editingPath = ['data'];
      mockContext.editingValue = '{invalid json}';
      
      editingLogic.saveEditing.call(mockContext);
      
      // Should save as string if invalid JSON
      expect(mockContext.value.data).toBe('{invalid json}');
    });
  });

  describe('inputHandler', () => {
    it('should handle character input', () => {
      const { inputHandler } = require('../../src/component/JsonEditor/inputHandler');
      mockContext.editingValue = 'test';
      mockContext.cursorPosition = 4;
      
      inputHandler.handleCharInput.call(mockContext, 'a');
      
      expect(mockContext.editingValue).toBe('testa');
      expect(mockContext.cursorPosition).toBe(5);
    });

    it('should handle backspace', () => {
      const { inputHandler } = require('../../src/component/JsonEditor/inputHandler');
      mockContext.editingValue = 'test';
      mockContext.cursorPosition = 4;
      
      inputHandler.handleBackspace.call(mockContext);
      
      expect(mockContext.editingValue).toBe('tes');
      expect(mockContext.cursorPosition).toBe(3);
    });

    it('should handle delete', () => {
      const { inputHandler } = require('../../src/component/JsonEditor/inputHandler');
      mockContext.editingValue = 'test';
      mockContext.cursorPosition = 2;
      
      inputHandler.handleDelete.call(mockContext);
      
      expect(mockContext.editingValue).toBe('tet');
      expect(mockContext.cursorPosition).toBe(2);
    });

    it('should move cursor left', () => {
      const { inputHandler } = require('../../src/component/JsonEditor/inputHandler');
      mockContext.editingValue = 'test';
      mockContext.cursorPosition = 2;
      
      inputHandler.moveCursorLeft.call(mockContext);
      
      expect(mockContext.cursorPosition).toBe(1);
    });

    it('should move cursor right', () => {
      const { inputHandler } = require('../../src/component/JsonEditor/inputHandler');
      mockContext.editingValue = 'test';
      mockContext.cursorPosition = 2;
      
      inputHandler.moveCursorRight.call(mockContext);
      
      expect(mockContext.cursorPosition).toBe(3);
    });

    it('should not move cursor past boundaries', () => {
      const { inputHandler } = require('../../src/component/JsonEditor/inputHandler');
      mockContext.editingValue = 'test';
      mockContext.cursorPosition = 0;
      
      inputHandler.moveCursorLeft.call(mockContext);
      expect(mockContext.cursorPosition).toBe(0);
      
      mockContext.cursorPosition = 4;
      inputHandler.moveCursorRight.call(mockContext);
      expect(mockContext.cursorPosition).toBe(4);
    });
  });

  describe('renderer', () => {
    it('should render empty object', () => {
      const { renderer } = require('../../src/component/JsonEditor/renderer');
      mockContext.value = {};
      
      const lines = renderer.renderTree.call(mockContext);
      
      expect(lines).toBeDefined();
      expect(lines.length).toBeGreaterThan(0);
    });

    it('should render object with values', () => {
      const { renderer } = require('../../src/component/JsonEditor/renderer');
      mockContext.value = {
        string: 'value',
        number: 42,
        boolean: true,
        null: null
      };
      
      const lines = renderer.renderTree.call(mockContext);
      
      expect(lines.some(l => l.includes('string'))).toBe(true);
      expect(lines.some(l => l.includes('42'))).toBe(true);
      expect(lines.some(l => l.includes('true'))).toBe(true);
      expect(lines.some(l => l.includes('null'))).toBe(true);
    });

    it('should render nested structure with expansion', () => {
      const { renderer } = require('../../src/component/JsonEditor/renderer');
      mockContext.value = {
        parent: {
          child: 'value'
        }
      };
      mockContext.expandedPaths.add('parent');
      
      const lines = renderer.renderTree.call(mockContext);
      
      expect(lines.some(l => l.includes('parent'))).toBe(true);
      expect(lines.some(l => l.includes('child'))).toBe(true);
    });

    it('should highlight selected path', () => {
      const { renderer } = require('../../src/component/JsonEditor/renderer');
      mockContext.value = { selected: 'item' };
      mockContext.selectedPath = ['selected'];
      
      const lines = renderer.renderTree.call(mockContext);
      
      expect(lines).toBeDefined();
      // Should have highlighting applied
    });

    it('should show editing indicator', () => {
      const { renderer } = require('../../src/component/JsonEditor/renderer');
      mockContext.value = { field: 'value' };
      mockContext.editingPath = ['field'];
      mockContext.editingValue = 'editing...';
      
      const lines = renderer.renderTree.call(mockContext);
      
      expect(lines.some(l => l.includes('editing...'))).toBe(true);
    });
  });

  describe('navigation', () => {
    it('should navigate to next item', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      mockContext.value = {
        first: 1,
        second: 2,
        third: 3
      };
      mockContext.selectedPath = ['first'];
      
      JsonEditor.navigateNext.call(mockContext);
      
      expect(mockContext.selectedPath).toEqual(['second']);
    });

    it('should navigate to previous item', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      mockContext.value = {
        first: 1,
        second: 2,
        third: 3
      };
      mockContext.selectedPath = ['second'];
      
      JsonEditor.navigatePrevious.call(mockContext);
      
      expect(mockContext.selectedPath).toEqual(['first']);
    });

    it('should expand/collapse objects', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      mockContext.value = {
        object: { nested: 'value' }
      };
      mockContext.selectedPath = ['object'];
      
      // Expand
      JsonEditor.toggleExpand.call(mockContext);
      expect(mockContext.expandedPaths.has('object')).toBe(true);
      
      // Collapse
      JsonEditor.toggleExpand.call(mockContext);
      expect(mockContext.expandedPaths.has('object')).toBe(false);
    });
  });

  describe('value manipulation', () => {
    it('should add new property to object', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      mockContext.value = { existing: 'value' };
      mockContext.selectedPath = ['existing'];
      
      JsonEditor.addProperty.call(mockContext, 'newKey', 'newValue');
      
      expect(mockContext.value.newKey).toBe('newValue');
      expect(mockContext.emit).toHaveBeenCalledWith('change', mockContext.value);
    });

    it('should delete property', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      mockContext.value = {
        keep: 'this',
        remove: 'that'
      };
      mockContext.selectedPath = ['remove'];
      
      JsonEditor.deleteProperty.call(mockContext);
      
      expect(mockContext.value.remove).toBeUndefined();
      expect(mockContext.value.keep).toBe('this');
    });

    it('should add item to array', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      mockContext.value = {
        array: ['item1', 'item2']
      };
      mockContext.selectedPath = ['array'];
      
      JsonEditor.addArrayItem.call(mockContext, 'item3');
      
      expect(mockContext.value.array).toHaveLength(3);
      expect(mockContext.value.array[2]).toBe('item3');
    });

    it('should remove item from array', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      mockContext.value = {
        array: ['item1', 'item2', 'item3']
      };
      mockContext.selectedPath = ['array', '1'];
      
      JsonEditor.removeArrayItem.call(mockContext);
      
      expect(mockContext.value.array).toHaveLength(2);
      expect(mockContext.value.array).toEqual(['item1', 'item3']);
    });
  });

  describe('schema validation', () => {
    it('should validate against schema', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      mockContext.schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' }
        },
        required: ['name']
      };
      mockContext.value = { name: 'John', age: 30 };
      
      const isValid = JsonEditor.validateSchema.call(mockContext);
      
      expect(isValid).toBe(true);
    });

    it('should detect schema violations', () => {
      const JsonEditor = require('../../src/component/JsonEditor/JsonEditor');
      mockContext.schema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        },
        required: ['name']
      };
      mockContext.value = { age: 30 }; // Missing required 'name'
      
      const isValid = JsonEditor.validateSchema.call(mockContext);
      
      expect(isValid).toBe(false);
    });
  });
});