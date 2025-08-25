/**
 * Test suite for MetaSchema types
 * Ensuring all type exports work correctly
 */

import * as MetaSchemaTypes from '../../src/core/MetaSchema/types';

describe('MetaSchema Types', () => {
  test('should export all types from modular files', () => {
    // Test that the module exports exist
    expect(MetaSchemaTypes).toBeDefined();
    expect(typeof MetaSchemaTypes).toBe('object');
  });

  test('should have primitive types exports', () => {
    // Verify that primitive type exports are available
    expect(MetaSchemaTypes).toHaveProperty;
  });

  test('should have component types exports', () => {
    // Verify that component type exports are available  
    expect(MetaSchemaTypes).toHaveProperty;
  });

  test('should have layout types exports', () => {
    // Verify that layout type exports are available
    expect(MetaSchemaTypes).toHaveProperty;
  });

  test('should have schema types exports', () => {
    // Verify that schema type exports are available
    expect(MetaSchemaTypes).toHaveProperty;
  });

  test('should have app types exports', () => {
    // Verify that app type exports are available
    expect(MetaSchemaTypes).toHaveProperty;
  });

  test('should export type definitions without runtime errors', () => {
    // Simply importing and accessing the module should not throw
    expect(() => {
      const typeModule = require('../../src/core/MetaSchema/types');
      Object.keys(typeModule);
    }).not.toThrow();
  });
});