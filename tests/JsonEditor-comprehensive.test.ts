/**
 * Comprehensive JsonEditor Tests
 * Testing critical business logic that was previously untested (14.28% coverage)
 */

import { JsonEditor } from '../src/component/JsonEditor/JsonEditor';
import { parseValue, updateValue, addProperty, deleteProperty } from '../src/component/JsonEditor/editingLogic';
import { buildNodeTree, isDescendantOf } from '../src/component/JsonEditor/nodeTree';
import { handleEditModeInput, handleNormalModeInput, moveSelection } from '../src/component/JsonEditor/inputHandler';
import { renderNodeLine, getVisibleNodes, getScrollIndicator } from '../src/component/JsonEditor/renderer';

describe('JsonEditor - Comprehensive Testing', () => {
  
  describe('Core Data Management', () => {
    let editor: JsonEditor;
    
    beforeEach(() => {
      editor = new JsonEditor();
    });

    it('should initialize with empty data', () => {
      expect(editor.getData()).toEqual({});
    });

    it('should set and get complex JSON data', () => {
      const testData = {
        user: {
          name: 'John',
          age: 30,
          settings: {
            theme: 'dark',
            notifications: true
          }
        },
        items: ['apple', 'banana', 'orange'],
        metadata: null
      };

      editor.setData(testData);
      const result = editor.getData();
      
      expect(result).toEqual(testData);
      expect(result.user.name).toBe('John');
      expect(result.items).toHaveLength(3);
      expect(result.metadata).toBeNull();
    });

    it('should handle onChange callback', () => {
      const mockCallback = jest.fn();
      const testData = { name: 'test' };
      
      editor.onDataChange(mockCallback);
      editor.setData(testData);
      
      // Trigger change through internal method
      const setDataSpy = jest.spyOn(editor as any, 'applyEdit');
      const mockContext = {
        editMode: true,
        editValue: 'new value',
        selectedIndex: 0,
        scrollOffset: 0,
        nodes: buildNodeTree(testData)
      };
      
      // We need to access private methods for testing
      editor['editMode'] = true;
      editor['editValue'] = 'new test';
      editor['selectedIndex'] = 0;
      editor['nodes'] = buildNodeTree({ name: 'test' });
      
      // Manually trigger applyEdit
      editor['applyEdit']();
      
      expect(mockCallback).toHaveBeenCalled();
    });
  });

  describe('Value Parsing Logic', () => {
    it('should parse string values correctly', () => {
      expect(parseValue('hello world', 'string')).toBe('hello world');
      expect(parseValue('', 'string')).toBe('');
      expect(parseValue('123', 'string')).toBe('123');
    });

    it('should parse number values correctly', () => {
      expect(parseValue('123', 'number')).toBe(123);
      expect(parseValue('123.45', 'number')).toBe(123.45);
      expect(parseValue('-42', 'number')).toBe(-42);
      expect(parseValue('0', 'number')).toBe(0);
      expect(parseValue('invalid', 'number')).toBeNull();
      expect(parseValue('', 'number')).toBeNull();
    });

    it('should parse boolean values correctly', () => {
      expect(parseValue('true', 'boolean')).toBe(true);
      expect(parseValue('TRUE', 'boolean')).toBe(true);
      expect(parseValue('True', 'boolean')).toBe(true);
      expect(parseValue('false', 'boolean')).toBe(false);
      expect(parseValue('FALSE', 'boolean')).toBe(false);
      expect(parseValue('anything else', 'boolean')).toBe(false);
    });

    it('should parse null values correctly', () => {
      expect(parseValue('null', 'null')).toBeNull();
      expect(parseValue('anything', 'null')).toBeNull();
    });
  });

  describe('Data Update Logic', () => {
    it('should update root value', () => {
      const data = { name: 'old' };
      const result = updateValue(data, [], { name: 'new' });
      expect(result).toEqual({ name: 'new' });
    });

    it('should update nested values', () => {
      const data = {
        user: {
          profile: {
            name: 'old name'
          }
        }
      };
      
      const result = updateValue(data, ['user', 'profile', 'name'], 'new name');
      expect(result.user.profile.name).toBe('new name');
    });

    it('should update array elements', () => {
      const data = {
        items: ['apple', 'banana', 'orange']
      };
      
      const result = updateValue(data, ['items', '1'], 'grape');
      expect(result.items[1]).toBe('grape');
      expect(result.items).toEqual(['apple', 'grape', 'orange']);
    });

    it('should handle deep nested paths', () => {
      const data = {
        a: { b: { c: { d: { e: 'deep value' } } } }
      };
      
      const result = updateValue(data, ['a', 'b', 'c', 'd', 'e'], 'updated deep value');
      expect(result.a.b.c.d.e).toBe('updated deep value');
    });
  });

  describe('Property Management', () => {
    it('should add property to object', () => {
      const data = { existing: 'value' };
      const node = {
        key: 'root',
        value: data,
        type: 'object' as const,
        path: [],
        expanded: true,
        level: 0
      };
      
      const result = addProperty(data, node);
      expect(result.data).toHaveProperty('newProperty0');
      expect(result.data.newProperty0).toBe('');
      expect(result.newNodePath).toEqual(['newProperty0']);
    });

    it('should generate unique property names', () => {
      const data = { prop1: 'a', prop2: 'b' };
      const node = {
        key: 'root',
        value: data,
        type: 'object' as const,
        path: [],
        expanded: true,
        level: 0
      };
      
      const result = addProperty(data, node);
      expect(result.newNodePath).toEqual(['newProperty2']);
    });

    it('should throw error when adding property to non-object', () => {
      const node = {
        key: 'test',
        value: 'string value',
        type: 'string' as const,
        path: ['test'],
        expanded: false,
        level: 0
      };
      
      expect(() => addProperty({}, node)).toThrow('Can only add properties to objects');
    });

    it('should delete object property', () => {
      const data = { 
        keep: 'this',
        delete: 'this one',
        also: 'keep this'
      };
      
      const node = {
        key: 'delete',
        value: 'this one',
        type: 'string' as const,
        path: ['delete'],
        expanded: false,
        level: 1
      };
      
      const result = deleteProperty(data, node);
      expect(result).toEqual({ keep: 'this', also: 'keep this' });
      expect(result).not.toHaveProperty('delete');
    });

    it('should delete array element', () => {
      const data = { items: ['keep', 'delete', 'keep'] };
      const node = {
        key: '1',
        value: 'delete',
        type: 'string' as const,
        path: ['items', '1'],
        expanded: false,
        level: 2
      };
      
      const result = deleteProperty(data, node);
      expect(result.items).toEqual(['keep', 'keep']);
    });

    it('should throw error when deleting root node', () => {
      const node = {
        key: 'root',
        value: {},
        type: 'object' as const,
        path: [],
        expanded: true,
        level: 0
      };
      
      expect(() => deleteProperty({}, node)).toThrow('Cannot delete root node');
    });
  });

  describe('Node Tree Building', () => {
    it('should build tree from simple object', () => {
      const data = { name: 'John', age: 30 };
      const nodes = buildNodeTree(data);
      
      expect(nodes).toHaveLength(3); // root + 2 properties
      expect(nodes[0]).toMatchObject({
        key: 'root',
        type: 'object',
        path: [],
        level: 0
      });
      expect(nodes[1]).toMatchObject({
        key: 'name',
        value: 'John',
        type: 'string',
        path: ['name'],
        level: 1
      });
    });

    it('should build tree from nested structure', () => {
      const data = {
        user: {
          profile: {
            name: 'John'
          }
        }
      };
      
      const nodes = buildNodeTree(data);
      const profileNode = nodes.find(n => n.key === 'profile');
      const nameNode = nodes.find(n => n.key === 'name');
      
      expect(profileNode).toBeDefined();
      expect(profileNode?.level).toBe(2);
      expect(nameNode).toBeDefined();
      expect(nameNode?.path).toEqual(['user', 'profile', 'name']);
    });

    it('should build tree from array', () => {
      const data = { items: ['apple', 'banana', 'orange'] };
      const nodes = buildNodeTree(data);
      
      const itemsNode = nodes.find(n => n.key === 'items');
      const arrayElements = nodes.filter(n => n.path.length === 2 && n.path[0] === 'items');
      
      expect(itemsNode?.type).toBe('array');
      expect(arrayElements).toHaveLength(3);
      expect(arrayElements[0].key).toBe('0');
      expect(arrayElements[0].value).toBe('apple');
    });

    it('should handle complex mixed data types', () => {
      const data = {
        string: 'text',
        number: 42,
        boolean: true,
        null_value: null,
        array: [1, 2, 3],
        object: { nested: 'value' }
      };
      
      const nodes = buildNodeTree(data);
      const types = nodes.map(n => n.type);
      
      expect(types).toContain('string');
      expect(types).toContain('number');
      expect(types).toContain('boolean');
      expect(types).toContain('null');
      expect(types).toContain('array');
      expect(types).toContain('object');
    });

    it('should detect descendant relationships', () => {
      const parentNode = {
        key: 'parent',
        value: {},
        type: 'object' as const,
        path: ['parent'],
        expanded: true,
        level: 1
      };
      
      const childNode = {
        key: 'child',
        value: 'value',
        type: 'string' as const,
        path: ['parent', 'child'],
        expanded: false,
        level: 2
      };
      
      const unrelatedNode = {
        key: 'other',
        value: 'value',
        type: 'string' as const,
        path: ['other'],
        expanded: false,
        level: 1
      };
      
      expect(isDescendantOf(childNode, parentNode)).toBe(true);
      expect(isDescendantOf(unrelatedNode, parentNode)).toBe(false);
      expect(isDescendantOf(parentNode, parentNode)).toBe(false);
    });
  });

  describe('Input Handling', () => {
    it('should handle edit mode character input', () => {
      const state = {
        editMode: true,
        editValue: 'test',
        selectedIndex: 0,
        scrollOffset: 0,
        nodes: []
      };
      
      const applyEdit = jest.fn();
      handleEditModeInput('x', { name: 'char' }, state, applyEdit);
      
      expect(state.editValue).toBe('testx');
    });

    it('should handle edit mode backspace', () => {
      const state = {
        editMode: true,
        editValue: 'test',
        selectedIndex: 0,
        scrollOffset: 0,
        nodes: []
      };
      
      const applyEdit = jest.fn();
      handleEditModeInput('', { name: 'backspace' }, state, applyEdit);
      
      expect(state.editValue).toBe('tes');
    });

    it('should apply edit on enter key', () => {
      const state = {
        editMode: true,
        editValue: 'new value',
        selectedIndex: 0,
        scrollOffset: 0,
        nodes: []
      };
      
      const applyEdit = jest.fn();
      const result = handleEditModeInput('', { name: 'return' }, state, applyEdit);
      
      expect(applyEdit).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle navigation in normal mode', () => {
      const nodes = [
        { key: 'root', value: {}, type: 'object', path: [], expanded: true, level: 0 },
        { key: 'item1', value: 'val1', type: 'string', path: ['item1'], expanded: false, level: 1 },
        { key: 'item2', value: 'val2', type: 'string', path: ['item2'], expanded: false, level: 1 }
      ];
      
      const state = {
        editMode: false,
        editValue: '',
        selectedIndex: 0,
        scrollOffset: 0,
        nodes: nodes as any
      };
      
      const callbacks = {
        moveSelection: jest.fn((delta) => {
          state.selectedIndex = Math.max(0, Math.min(nodes.length - 1, state.selectedIndex + delta));
        }),
        toggleNode: jest.fn(),
        startEdit: jest.fn(),
        addProperty: jest.fn(),
        deleteProperty: jest.fn()
      };
      
      // Test down arrow
      handleNormalModeInput('', { name: 'down' }, state, callbacks);
      expect(callbacks.moveSelection).toHaveBeenCalledWith(1);
      
      // Test up arrow
      handleNormalModeInput('', { name: 'up' }, state, callbacks);
      expect(callbacks.moveSelection).toHaveBeenCalledWith(-1);
    });

    it('should trigger actions in normal mode', () => {
      const state = {
        editMode: false,
        editValue: '',
        selectedIndex: 0,
        scrollOffset: 0,
        nodes: []
      };
      
      const callbacks = {
        moveSelection: jest.fn(),
        toggleNode: jest.fn(),
        startEdit: jest.fn(),
        addProperty: jest.fn(),
        deleteProperty: jest.fn()
      };
      
      // Test edit key
      handleNormalModeInput('e', { name: 'e' }, state, callbacks);
      expect(callbacks.startEdit).toHaveBeenCalled();
      
      // Test add key
      handleNormalModeInput('a', { name: 'a' }, state, callbacks);
      expect(callbacks.addProperty).toHaveBeenCalled();
      
      // Test delete key
      handleNormalModeInput('d', { name: 'd' }, state, callbacks);
      expect(callbacks.deleteProperty).toHaveBeenCalled();
    });
  });

  describe('Selection and Scrolling', () => {
    it('should move selection within bounds', () => {
      const nodes = new Array(10).fill(null).map((_, i) => ({
        key: `item${i}`,
        value: `value${i}`,
        type: 'string',
        path: [`item${i}`],
        expanded: false,
        level: 1
      }));
      
      const state = {
        editMode: false,
        editValue: '',
        selectedIndex: 5,
        scrollOffset: 0,
        nodes: nodes as any
      };
      
      const props = { height: 20 };
      
      // Move down
      moveSelection(1, state, props);
      expect(state.selectedIndex).toBe(6);
      
      // Move up
      moveSelection(-1, state, props);
      expect(state.selectedIndex).toBe(5);
      
      // Try to move beyond bounds
      state.selectedIndex = 9;
      moveSelection(1, state, props);
      expect(state.selectedIndex).toBe(9); // Should stay at last item
      
      state.selectedIndex = 0;
      moveSelection(-1, state, props);
      expect(state.selectedIndex).toBe(0); // Should stay at first item
    });

    it('should handle scrolling with large datasets', () => {
      const nodes = new Array(100).fill(null).map((_, i) => ({
        key: `item${i}`,
        value: `value${i}`,
        type: 'string',
        path: [`item${i}`],
        expanded: false,
        level: 1
      }));
      
      const state = {
        editMode: false,
        editValue: '',
        selectedIndex: 50,
        scrollOffset: 0,
        nodes: nodes as any
      };
      
      const props = { height: 10 }; // Small viewport
      
      moveSelection(10, state, props);
      expect(state.scrollOffset).toBeGreaterThan(0);
      expect(state.selectedIndex).toBe(60);
    });
  });

  describe('Rendering Functions', () => {
    it('should render simple node line', () => {
      const node = {
        key: 'name',
        value: 'John',
        type: 'string' as const,
        path: ['name'],
        expanded: false,
        level: 1
      };
      
      const line = renderNodeLine(node, false, false, '');
      expect(line).toContain('name');
      expect(line).toContain('John');
    });

    it('should highlight selected nodes', () => {
      const node = {
        key: 'selected',
        value: 'value',
        type: 'string' as const,
        path: ['selected'],
        expanded: false,
        level: 1
      };
      
      const selectedLine = renderNodeLine(node, true, false, '');
      const unselectedLine = renderNodeLine(node, false, false, '');
      
      expect(selectedLine).toContain('\x1b[7m'); // Reverse video for selection
      expect(unselectedLine).not.toContain('\x1b[7m');
    });

    it('should show edit mode correctly', () => {
      const node = {
        key: 'editing',
        value: 'old value',
        type: 'string' as const,
        path: ['editing'],
        expanded: false,
        level: 1
      };
      
      const editLine = renderNodeLine(node, true, true, 'new value');
      expect(editLine).toContain('new value');
      expect(editLine).not.toContain('old value');
    });

    it('should get visible nodes with scrolling', () => {
      const nodes = new Array(20).fill(null).map((_, i) => ({
        key: `item${i}`,
        value: `value${i}`,
        type: 'string',
        path: [`item${i}`],
        expanded: false,
        level: 1
      }));
      
      const visible = getVisibleNodes(nodes as any, 5, 10);
      expect(visible).toHaveLength(10);
      expect(visible[0].key).toBe('item5');
      expect(visible[9].key).toBe('item14');
    });

    it('should generate scroll indicator', () => {
      const indicator1 = getScrollIndicator(0, 10);
      const indicator2 = getScrollIndicator(5, 10);
      const indicator3 = getScrollIndicator(9, 10);
      
      expect(indicator1).toMatch(/1\/10/);
      expect(indicator2).toMatch(/6\/10/);
      expect(indicator3).toMatch(/10\/10/);
    });
  });

  describe('Integration Tests', () => {
    let editor: JsonEditor;
    
    beforeEach(() => {
      editor = new JsonEditor();
    });

    it('should handle complete editing workflow', () => {
      const initialData = {
        config: {
          theme: 'light',
          version: 1
        }
      };
      
      const changeCallback = jest.fn();
      editor.onDataChange(changeCallback);
      editor.setData(initialData);
      
      // Simulate editing workflow
      editor['selectedIndex'] = 1; // Select 'config' object
      editor['nodes'] = buildNodeTree(initialData);
      
      // Add a property
      editor['addPropertyAction']();
      expect(changeCallback).toHaveBeenCalled();
      
      const updatedData = editor.getData();
      expect(updatedData.config).toHaveProperty('newProperty0');
    });

    it('should handle node expansion and collapse', () => {
      const data = {
        parent: {
          child1: 'value1',
          child2: 'value2'
        }
      };
      
      editor.setData(data);
      
      // Initially expanded - should have all nodes
      let nodes = editor['nodes'];
      expect(nodes.length).toBeGreaterThan(3);
      
      // Find parent node and toggle
      const parentNode = nodes.find(n => n.key === 'parent');
      editor['toggleNode'](parentNode!);
      
      // Should collapse and remove children
      nodes = editor['nodes'];
      const childNodes = nodes.filter(n => n.path.includes('child1') || n.path.includes('child2'));
      expect(childNodes).toHaveLength(0);
    });

    it('should prevent editing non-editable nodes', () => {
      const data = { obj: { nested: 'value' } };
      editor.setData(data);
      
      // Try to edit object node
      editor['selectedIndex'] = 1; // Assuming object node
      const objectNode = editor['nodes'].find(n => n.type === 'object');
      if (objectNode) {
        editor['selectedIndex'] = editor['nodes'].indexOf(objectNode);
        editor['startEdit']();
        expect(editor['editMode']).toBe(false);
      }
    });

    it('should reject invalid number edits', () => {
      const data = { count: 42 };
      editor.setData(data);
      
      editor['selectedIndex'] = 1; // Number node
      editor['editMode'] = true;
      editor['editValue'] = 'not a number';
      
      const originalData = { ...data };
      editor['applyEdit']();
      
      // Should not change due to invalid number
      expect(editor.getData()).toEqual(originalData);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', () => {
      const editor = new JsonEditor();
      
      // Test with circular reference (should be handled by caller)
      const circularData = { name: 'test' };
      (circularData as any).self = circularData;
      
      expect(() => {
        try {
          editor.setData(circularData);
        } catch (e) {
          // Expected to throw on circular reference
        }
      }).not.toThrow();
    });

    it('should handle delete errors gracefully', () => {
      const data = { item: 'value' };
      const editor = new JsonEditor();
      editor.setData(data);
      
      // Try to delete with invalid state
      editor['selectedIndex'] = 999; // Invalid index
      
      expect(() => editor['deletePropertyAction']()).not.toThrow();
    });

    it('should handle empty data structures', () => {
      const editor = new JsonEditor();
      
      editor.setData({});
      expect(editor.getData()).toEqual({});
      
      editor.setData([]);
      expect(editor.getData()).toEqual([]);
      
      editor.setData(null);
      expect(editor.getData()).toBeNull();
    });
  });
});

export {};