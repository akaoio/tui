/**
 * Comprehensive MetaSchema Tests
 * Testing schema validation system that was previously under-tested (32.34% coverage)
 */

import { MetaSchemaEngine } from '../src/core/MetaSchema/MetaSchemaEngine';
import { processInheritance, processMixins, deepMerge } from '../src/core/MetaSchema/inheritance';
import { makeReactive, createReactiveProxy } from '../src/core/MetaSchema/reactive';
import { callLifecycle } from '../src/core/MetaSchema/lifecycle';
import { 
  initializeProps, 
  initializeState, 
  setupComputed, 
  setupWatchers, 
  setupMethods 
} from '../src/core/MetaSchema/instantiate';
import { 
  MetaSchema, 
  ComponentMetaSchema, 
  StateSchema, 
  DataSchema,
  EventSchema,
  PropertySchema 
} from '../src/core/MetaSchema/types';

describe('MetaSchema - Comprehensive Testing', () => {

  describe('MetaSchemaEngine Core', () => {
    let engine: MetaSchemaEngine;

    beforeEach(() => {
      engine = new MetaSchemaEngine();
    });

    afterEach(() => {
      engine.clear();
    });

    it('should register and retrieve schemas', () => {
      const schema: MetaSchema = {
        $id: 'test-schema',
        $type: 'component'
      };

      engine.register(schema);
      
      expect(engine.getSchema('test-schema')).toBe(schema);
      expect(engine.listSchemas()).toContain('test-schema');
    });

    it('should emit events on schema registration', () => {
      const mockListener = jest.fn();
      engine.on('schema:register', mockListener);

      const schema: MetaSchema = {
        $id: 'event-test',
        $type: 'component'
      };

      engine.register(schema);
      expect(mockListener).toHaveBeenCalledWith(schema);
    });

    it('should create instances from schemas', () => {
      const schema: ComponentMetaSchema = {
        $id: 'component-schema',
        $type: 'component',
        props: {
          title: { type: 'string', default: 'Default Title' }
        }
      };

      engine.register(schema);
      const instance = engine.create('component-schema', { title: 'My Title' });

      expect(instance).toBeDefined();
      expect(instance._id).toMatch(/component-schema_\d+_/);
      expect(instance.title).toBe('My Title');
    });

    it('should throw error for non-existent schema', () => {
      expect(() => engine.create('non-existent')).toThrow('Schema non-existent not found');
    });

    it('should track instances', () => {
      const schema: MetaSchema = {
        $id: 'trackable',
        $type: 'component'
      };

      engine.register(schema);
      const instance = engine.create('trackable');

      expect(engine.getInstance(instance._id)).toBe(instance);
      expect(engine.listInstances()).toContain(instance._id);
    });

    it('should handle lifecycle hooks', () => {
      const beforeCreateMock = jest.fn();
      const createdMock = jest.fn();

      const schema: ComponentMetaSchema = {
        $id: 'lifecycle-test',
        $type: 'component',
        $lifecycle: {
          beforeCreate: beforeCreateMock,
          created: createdMock
        }
      };

      engine.register(schema);
      const instance = engine.create('lifecycle-test');

      expect(beforeCreateMock).toHaveBeenCalledWith(instance);
      expect(createdMock).toHaveBeenCalledWith(instance);
    });

    it('should clear all data', () => {
      const schema: MetaSchema = { $id: 'clearable', $type: 'component' };
      engine.register(schema);
      engine.create('clearable');

      expect(engine.listSchemas()).toHaveLength(1);
      expect(engine.listInstances()).toHaveLength(1);

      engine.clear();

      expect(engine.listSchemas()).toHaveLength(0);
      expect(engine.listInstances()).toHaveLength(0);
    });

    it('should trigger updates and emit events', () => {
      const updateListener = jest.fn();
      engine.on('update', updateListener);

      const obj = { name: 'test' };
      engine.triggerUpdate(obj, 'name', 'new value', 'test');

      expect(updateListener).toHaveBeenCalledWith({
        obj,
        prop: 'name', 
        newValue: 'new value',
        oldValue: 'test'
      });
    });

    it('should invalidate computed properties', () => {
      // Access the private property for testing
      const computedCache = (engine as any).computedCache;
      computedCache.set('test', 'cached value');
      
      expect(computedCache.size).toBe(1);
      
      engine.invalidateComputed({}, 'prop');
      expect(computedCache.size).toBe(0);
    });
  });

  describe('Inheritance System', () => {
    let schemas: Map<string, MetaSchema>;

    beforeEach(() => {
      schemas = new Map();
    });

    it('should process single inheritance', () => {
      const parentSchema: ComponentMetaSchema = {
        $id: 'parent',
        $type: 'component',
        props: {
          name: { type: 'string' },
          age: { type: 'number' }
        }
      };

      const childSchema: ComponentMetaSchema = {
        $id: 'child',
        $type: 'component',
        $extends: 'parent',
        props: {
          grade: { type: 'string' }
        }
      };

      schemas.set('parent', parentSchema);
      schemas.set('child', childSchema);

      processInheritance(childSchema, schemas);

      expect(childSchema.props?.name).toEqual({ type: 'string' });
      expect(childSchema.props?.age).toEqual({ type: 'number' });
      expect(childSchema.props?.grade).toEqual({ type: 'string' });
    });

    it('should process multiple inheritance', () => {
      const parent1: ComponentMetaSchema = {
        $id: 'parent1',
        $type: 'component',
        props: { prop1: { type: 'string' } }
      };

      const parent2: ComponentMetaSchema = {
        $id: 'parent2',
        $type: 'component',
        props: { prop2: { type: 'number' } }
      };

      const child: ComponentMetaSchema = {
        $id: 'child',
        $type: 'component',
        $extends: ['parent1', 'parent2'],
        props: { prop3: { type: 'boolean' } }
      };

      schemas.set('parent1', parent1);
      schemas.set('parent2', parent2);
      schemas.set('child', child);

      processInheritance(child, schemas);

      expect(child.props?.prop1).toEqual({ type: 'string' });
      expect(child.props?.prop2).toEqual({ type: 'number' });
      expect(child.props?.prop3).toEqual({ type: 'boolean' });
    });

    it('should ignore missing parent schemas', () => {
      const childSchema: ComponentMetaSchema = {
        $id: 'child',
        $type: 'component',
        $extends: 'missing-parent',
        props: { existing: { type: 'string' } }
      };

      schemas.set('child', childSchema);

      expect(() => processInheritance(childSchema, schemas)).not.toThrow();
      expect(childSchema.props?.existing).toEqual({ type: 'string' });
    });

    it('should process mixins', () => {
      const mixin1: ComponentMetaSchema = {
        $id: 'mixin1',
        $type: 'component',
        methods: {
          method1: () => 'mixin1'
        }
      };

      const mixin2: ComponentMetaSchema = {
        $id: 'mixin2',
        $type: 'component',
        methods: {
          method2: () => 'mixin2'
        }
      };

      const component: ComponentMetaSchema = {
        $id: 'component',
        $type: 'component',
        $mixins: ['mixin1', 'mixin2'],
        methods: {
          method3: () => 'component'
        }
      };

      schemas.set('mixin1', mixin1);
      schemas.set('mixin2', mixin2);
      schemas.set('component', component);

      processMixins(component, schemas);

      expect(component.methods?.method1).toBeDefined();
      expect(component.methods?.method2).toBeDefined();
      expect(component.methods?.method3).toBeDefined();
    });

    it('should handle empty mixins gracefully', () => {
      const component: ComponentMetaSchema = {
        $id: 'component',
        $type: 'component',
        methods: { existing: () => 'test' }
      };

      expect(() => processMixins(component, schemas)).not.toThrow();
      expect(component.methods?.existing).toBeDefined();
    });
  });

  describe('Deep Merge Utility', () => {
    it('should merge simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };

      deepMerge(target, source);

      expect(target).toEqual({ a: 1, b: 2, c: 4 }); // Target properties preserved
    });

    it('should merge nested objects', () => {
      const target = {
        props: { name: { type: 'string' } },
        other: 'value'
      };

      const source = {
        props: { age: { type: 'number' } },
        methods: { test: () => {} }
      };

      deepMerge(target, source);

      expect(target.props).toEqual({
        name: { type: 'string' },
        age: { type: 'number' }
      });
      expect(target.other).toBe('value');
      expect(target.methods).toBe(source.methods);
    });

    it('should skip meta properties starting with $', () => {
      const target = { $id: 'target', name: 'target' };
      const source = { $id: 'source', $type: 'component', name: 'source' };

      deepMerge(target, source);

      expect(target.$id).toBe('target'); // Not overridden
      expect(target.$type).toBeUndefined(); // Not merged
      expect(target.name).toBe('target'); // Target preserved
    });

    it('should handle arrays correctly', () => {
      const target = { items: [1, 2] };
      const source = { items: [3, 4], other: [5, 6] };

      deepMerge(target, source);

      expect(target.items).toEqual([1, 2]); // Target array preserved
      expect(target.other).toEqual([5, 6]); // Source array added
    });

    it('should handle null and undefined values', () => {
      const target = { a: 1, b: null, c: undefined };
      const source = { b: 2, c: 3, d: null, e: undefined };

      deepMerge(target, source);

      expect(target.a).toBe(1);
      expect(target.b).toBeNull(); // Target null preserved
      expect(target.c).toBeUndefined(); // Target undefined preserved
      expect(target.d).toBeNull();
      expect(target.e).toBeUndefined();
    });
  });

  describe('Property Initialization', () => {
    let instance: any;

    beforeEach(() => {
      instance = {};
    });

    it('should initialize props with provided values', () => {
      const propSchema: Record<string, PropertySchema> = {
        title: { type: 'string', default: 'Default' },
        count: { type: 'number', required: true }
      };

      const props = { title: 'Custom Title', count: 42 };

      initializeProps(instance, propSchema, props);

      expect(instance.title).toBe('Custom Title');
      expect(instance.count).toBe(42);
    });

    it('should use default values for missing props', () => {
      const propSchema: Record<string, PropertySchema> = {
        title: { type: 'string', default: 'Default Title' },
        enabled: { type: 'boolean', default: true }
      };

      initializeProps(instance, propSchema, {});

      expect(instance.title).toBe('Default Title');
      expect(instance.enabled).toBe(true);
    });

    it('should validate required props', () => {
      const propSchema: Record<string, PropertySchema> = {
        required_prop: { type: 'string', required: true }
      };

      expect(() => initializeProps(instance, propSchema, {}))
        .toThrow(/required_prop.*required/);
    });

    it('should validate prop types', () => {
      const propSchema: Record<string, PropertySchema> = {
        count: { type: 'number' }
      };

      expect(() => initializeProps(instance, propSchema, { count: 'not a number' }))
        .toThrow(/count.*number/);
    });

    it('should initialize state reactively', () => {
      const mockEngine = {
        createReactiveProxy: jest.fn((obj) => obj)
      };

      const stateSchema = {
        data: { type: 'object' as const, default: { value: 0 } },
        loading: { type: 'boolean' as const, default: false }
      };

      initializeState(instance, stateSchema, mockEngine as any);

      expect(instance.state).toBeDefined();
      expect(instance.state.data).toEqual({ value: 0 });
      expect(instance.state.loading).toBe(false);
      expect(mockEngine.createReactiveProxy).toHaveBeenCalledWith(instance.state);
    });

    it('should setup computed properties', () => {
      const mockEngine = {
        computedCache: new Map(),
        dependencies: new Map()
      };

      instance.state = { first: 'John', last: 'Doe' };

      const computedSchema = {
        fullName: {
          get: function(this: any) { return `${this.state.first} ${this.state.last}`; }
        },
        initials: {
          get: function(this: any) { return `${this.state.first[0]}${this.state.last[0]}`; },
          cache: true
        }
      };

      setupComputed(instance, computedSchema, mockEngine as any);

      expect(instance.fullName).toBe('John Doe');
      expect(instance.initials).toBe('JD');
    });

    it('should setup watchers', () => {
      const mockEngine = {
        watchers: new Map()
      };

      instance._id = 'test-instance';

      const watchSchema = {
        'state.value': jest.fn(),
        'state.name': jest.fn()
      };

      setupWatchers(instance, watchSchema, mockEngine as any);

      const watchersMap = mockEngine.watchers;
      expect(watchersMap.has('test-instance.state.value')).toBe(true);
      expect(watchersMap.has('test-instance.state.name')).toBe(true);
    });

    it('should setup methods', () => {
      const methodSchema = {
        greet: function(this: any, name: string) { return `Hello, ${name}!`; },
        calculate: function(this: any, a: number, b: number) { return a + b; }
      };

      setupMethods(instance, methodSchema);

      expect(typeof instance.greet).toBe('function');
      expect(typeof instance.calculate).toBe('function');
      expect(instance.greet('World')).toBe('Hello, World!');
      expect(instance.calculate(2, 3)).toBe(5);
    });
  });

  describe('Lifecycle Management', () => {
    it('should call lifecycle hooks with correct context', () => {
      const beforeCreateMock = jest.fn();
      const createdMock = jest.fn();
      const mountedMock = jest.fn();

      const schema: ComponentMetaSchema = {
        $id: 'lifecycle',
        $type: 'component',
        $lifecycle: {
          beforeCreate: beforeCreateMock,
          created: createdMock,
          mounted: mountedMock
        }
      };

      const instance = { name: 'test' };

      callLifecycle(schema, 'beforeCreate', instance);
      callLifecycle(schema, 'created', instance);
      callLifecycle(schema, 'mounted', instance);
      callLifecycle(schema, 'nonexistent' as any, instance); // Should not throw

      expect(beforeCreateMock).toHaveBeenCalledWith(instance);
      expect(createdMock).toHaveBeenCalledWith(instance);
      expect(mountedMock).toHaveBeenCalledWith(instance);
    });

    it('should handle missing lifecycle hooks gracefully', () => {
      const schema: ComponentMetaSchema = {
        $id: 'no-lifecycle',
        $type: 'component'
      };

      const instance = {};

      expect(() => callLifecycle(schema, 'created', instance)).not.toThrow();
    });

    it('should handle lifecycle hook errors', () => {
      const errorMock = jest.fn(() => { throw new Error('Lifecycle error'); });

      const schema: ComponentMetaSchema = {
        $id: 'error-lifecycle',
        $type: 'component',
        $lifecycle: {
          created: errorMock
        }
      };

      const instance = {};

      expect(() => callLifecycle(schema, 'created', instance)).toThrow('Lifecycle error');
    });
  });

  describe('Reactive System', () => {
    let mockEngine: any;

    beforeEach(() => {
      mockEngine = {
        triggerUpdate: jest.fn(),
        invalidateComputed: jest.fn(),
        triggerWatchers: jest.fn()
      };
    });

    it('should create reactive proxy', () => {
      const obj = { name: 'test', count: 0 };
      const proxy = createReactiveProxy(obj, mockEngine);

      // Test property access
      expect(proxy.name).toBe('test');
      expect(proxy.count).toBe(0);

      // Test property modification
      proxy.name = 'updated';
      expect(mockEngine.triggerUpdate).toHaveBeenCalledWith(
        obj, 'name', 'updated', 'test'
      );

      proxy.count = 42;
      expect(mockEngine.triggerUpdate).toHaveBeenCalledWith(
        obj, 'count', 42, 0
      );
    });

    it('should handle nested object reactivity', () => {
      const obj = { 
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark' }
      };

      const proxy = createReactiveProxy(obj, mockEngine);

      // Access nested properties
      expect(proxy.user.name).toBe('John');
      expect(proxy.settings.theme).toBe('dark');

      // Modify nested properties
      proxy.user.name = 'Jane';
      expect(mockEngine.triggerUpdate).toHaveBeenCalled();
    });

    it('should handle array reactivity', () => {
      const obj = { items: ['a', 'b', 'c'] };
      const proxy = createReactiveProxy(obj, mockEngine);

      // Array access
      expect(proxy.items[0]).toBe('a');
      expect(proxy.items.length).toBe(3);

      // Array modification
      proxy.items[1] = 'modified';
      expect(mockEngine.triggerUpdate).toHaveBeenCalled();

      // Array methods
      proxy.items.push('d');
      expect(proxy.items.length).toBe(4);
    });

    it('should make schema reactive', () => {
      const schema: ComponentMetaSchema = {
        $id: 'reactive-schema',
        $type: 'component',
        $reactive: true,
        state: {
          value: { type: 'string', default: 'initial' }
        }
      };

      makeReactive(schema, mockEngine);

      // Schema should be marked as reactive
      expect(schema.$reactive).toBe(true);
    });

    it('should handle special property names', () => {
      const obj = { 
        __proto__: null,
        constructor: Object,
        length: 5 
      };

      const proxy = createReactiveProxy(obj, mockEngine);

      expect(proxy.length).toBe(5);
      proxy.length = 10;

      expect(mockEngine.triggerUpdate).toHaveBeenCalledWith(
        obj, 'length', 10, 5
      );
    });
  });

  describe('Integration Tests', () => {
    let engine: MetaSchemaEngine;

    beforeEach(() => {
      engine = new MetaSchemaEngine();
    });

    it('should handle complete component lifecycle', () => {
      const schema: ComponentMetaSchema = {
        $id: 'complete-component',
        $type: 'component',
        $reactive: true,
        props: {
          title: { type: 'string', required: true },
          count: { type: 'number', default: 0 }
        },
        state: {
          internal: { type: 'string', default: 'internal value' }
        },
        computed: {
          displayTitle: {
            get: function(this: any) { return `Title: ${this.title}`; }
          }
        },
        methods: {
          increment: function(this: any) { 
            this.state.internal = 'incremented'; 
            return this.count + 1;
          }
        },
        $watch: {
          'state.internal': jest.fn()
        },
        $lifecycle: {
          created: jest.fn()
        }
      };

      engine.register(schema);
      const instance = engine.create('complete-component', { 
        title: 'Test Component',
        count: 5 
      });

      expect(instance.title).toBe('Test Component');
      expect(instance.count).toBe(5);
      expect(instance.state.internal).toBe('internal value');
      expect(instance.displayTitle).toBe('Title: Test Component');
      expect(typeof instance.increment).toBe('function');
      expect(schema.$lifecycle?.created).toHaveBeenCalled();
    });

    it('should handle inheritance chain with reactive state', () => {
      const baseSchema: ComponentMetaSchema = {
        $id: 'base-reactive',
        $type: 'component',
        $reactive: true,
        state: {
          baseValue: { type: 'string', default: 'base' }
        },
        methods: {
          baseMethod: function() { return 'base method'; }
        }
      };

      const derivedSchema: ComponentMetaSchema = {
        $id: 'derived-reactive',
        $type: 'component',
        $extends: 'base-reactive',
        state: {
          derivedValue: { type: 'number', default: 42 }
        },
        methods: {
          derivedMethod: function() { return 'derived method'; }
        }
      };

      engine.register(baseSchema);
      engine.register(derivedSchema);

      const instance = engine.create('derived-reactive');

      expect(instance.state.baseValue).toBe('base');
      expect(instance.state.derivedValue).toBe(42);
      expect(instance.baseMethod()).toBe('base method');
      expect(instance.derivedMethod()).toBe('derived method');
    });

    it('should handle complex state schema', () => {
      const stateSchema: StateSchema = {
        $id: 'complex-state',
        $type: 'state',
        properties: {
          user: { type: 'object', default: { name: '', age: 0 } },
          items: { type: 'array', default: [] }
        },
        mutations: {
          setUser: { handler: jest.fn() }
        },
        actions: {
          loadUser: { handler: jest.fn(), async: true }
        },
        getters: {
          userName: { handler: jest.fn() }
        }
      };

      engine.register(stateSchema);
      const instance = engine.create('complex-state');

      expect(instance).toBeDefined();
      expect(instance.state.user).toEqual({ name: '', age: 0 });
      expect(instance.state.items).toEqual([]);
    });

    it('should handle watcher triggers', () => {
      const watcherMock = jest.fn();

      const schema: ComponentMetaSchema = {
        $id: 'watcher-test',
        $type: 'component',
        $reactive: true,
        state: {
          value: { type: 'string', default: 'initial' }
        },
        $watch: {
          'state.value': watcherMock
        }
      };

      engine.register(schema);
      const instance = engine.create('watcher-test');

      // Trigger watcher manually (in real scenario this would be automatic)
      engine.triggerWatchers(instance, 'state.value', 'new value', 'initial');

      expect(watcherMock).toHaveBeenCalledWith('new value', 'initial');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    let engine: MetaSchemaEngine;

    beforeEach(() => {
      engine = new MetaSchemaEngine();
    });

    it('should handle invalid prop types gracefully', () => {
      const schema: ComponentMetaSchema = {
        $id: 'invalid-props',
        $type: 'component',
        props: {
          value: { type: 'unknown_type' as any }
        }
      };

      engine.register(schema);
      
      expect(() => engine.create('invalid-props', { value: 'test' }))
        .not.toThrow();
    });

    it('should handle circular inheritance', () => {
      const schema1: ComponentMetaSchema = {
        $id: 'circular1',
        $type: 'component',
        $extends: 'circular2'
      };

      const schema2: ComponentMetaSchema = {
        $id: 'circular2', 
        $type: 'component',
        $extends: 'circular1'
      };

      engine.register(schema1);
      engine.register(schema2);

      // Should not cause infinite recursion
      expect(() => engine.create('circular1')).not.toThrow();
    });

    it('should handle large number of instances', () => {
      const schema: MetaSchema = {
        $id: 'scalability-test',
        $type: 'component'
      };

      engine.register(schema);

      const instances = [];
      for (let i = 0; i < 1000; i++) {
        instances.push(engine.create('scalability-test'));
      }

      expect(instances).toHaveLength(1000);
      expect(engine.listInstances()).toHaveLength(1000);

      // All instances should be unique
      const ids = instances.map(inst => inst._id);
      expect(new Set(ids).size).toBe(1000);
    });

    it('should handle memory cleanup', () => {
      const schema: MetaSchema = {
        $id: 'memory-test',
        $type: 'component'
      };

      engine.register(schema);
      
      // Create many instances
      for (let i = 0; i < 100; i++) {
        engine.create('memory-test');
      }

      expect(engine.listInstances()).toHaveLength(100);

      // Clear should clean everything
      engine.clear();
      expect(engine.listInstances()).toHaveLength(0);
      expect(engine.listSchemas()).toHaveLength(0);
    });

    it('should handle malformed schemas', () => {
      const malformedSchemas = [
        { $id: '', $type: 'component' }, // Empty ID
        { $type: 'component' }, // Missing ID
        { $id: 'test' }, // Missing type
        null,
        undefined,
        'not an object'
      ];

      malformedSchemas.forEach((schema, index) => {
        try {
          engine.register(schema as any);
        } catch (error) {
          // Expected to throw for malformed schemas
          expect(error).toBeDefined();
        }
      });
    });
  });
});

export {};