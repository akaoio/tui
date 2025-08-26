/**
 * Test suite for Form submit function
 */

import { submit } from '../../src/component/Form/submit';

describe('Form submit', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      components: new Map(),
      emit: jest.fn()
    };
  });

  test('should collect values from components and emit submit event', () => {
    // Mock components with getValue methods
    const component1 = {
      getValue: jest.fn().mockReturnValue('value1')
    };
    const component2 = {
      getValue: jest.fn().mockReturnValue('value2')
    };
    const component3 = {
      getValue: jest.fn().mockReturnValue('value3')
    };

    mockContext.components.set('comp1', component1);
    mockContext.components.set('comp2', component2);
    mockContext.components.set('comp3', component3);

    submit.call(mockContext);

    // Verify getValue was called on all components
    expect(component1.getValue).toHaveBeenCalled();
    expect(component2.getValue).toHaveBeenCalled();
    expect(component3.getValue).toHaveBeenCalled();

    // Verify emit was called with correct structure
    // Note: Map.forEach passes (value, key, map), so index is actually the key
    expect(mockContext.emit).toHaveBeenCalledWith('submit', {
      field_comp1: 'value1',
      field_comp2: 'value2',
      field_comp3: 'value3'
    });
  });

  test('should handle empty components map', () => {
    submit.call(mockContext);

    expect(mockContext.emit).toHaveBeenCalledWith('submit', {});
  });

  test('should handle components with undefined getValue', () => {
    const component1 = {
      getValue: () => undefined
    };
    const component2 = {
      getValue: () => null
    };

    mockContext.components.set('comp1', component1);
    mockContext.components.set('comp2', component2);

    submit.call(mockContext);

    expect(mockContext.emit).toHaveBeenCalledWith('submit', {
      field_comp1: undefined,
      field_comp2: null
    });
  });

  test('should handle components with complex values', () => {
    const component1 = {
      getValue: jest.fn().mockReturnValue({ nested: 'object' })
    };
    const component2 = {
      getValue: jest.fn().mockReturnValue(['array', 'value'])
    };
    const component3 = {
      getValue: jest.fn().mockReturnValue(42)
    };

    mockContext.components.set('comp1', component1);
    mockContext.components.set('comp2', component2);
    mockContext.components.set('comp3', component3);

    submit.call(mockContext);

    expect(mockContext.emit).toHaveBeenCalledWith('submit', {
      field_comp1: { nested: 'object' },
      field_comp2: ['array', 'value'],
      field_comp3: 42
    });
  });

  test('should use key-based field names', () => {
    const component1 = { getValue: () => 'first' };
    const component2 = { getValue: () => 'second' };

    mockContext.components.set('customKey1', component1);
    mockContext.components.set('customKey2', component2);

    submit.call(mockContext);

    const expectedValues = expect.objectContaining({
      field_customKey1: 'first',
      field_customKey2: 'second'
    });

    expect(mockContext.emit).toHaveBeenCalledWith('submit', expectedValues);
  });

  test('should handle components that throw during getValue', () => {
    const component1 = {
      getValue: jest.fn().mockReturnValue('good_value')
    };
    const component2 = {
      getValue: jest.fn().mockImplementation(() => {
        throw new Error('Component error');
      })
    };

    mockContext.components.set('comp1', component1);
    mockContext.components.set('comp2', component2);

    // The function should handle errors gracefully or throw - let's test the current behavior
    expect(() => {
      submit.call(mockContext);
    }).toThrow('Component error');
  });
});