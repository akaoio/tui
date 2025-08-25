import { ComponentRegistry } from '../../src/core/ComponentRegistry/ComponentRegistry';
import { Component } from '../../src/core/Component';

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry;
  let mockComponent: any;
  let mockComponentRef: any;

  beforeEach(() => {
    registry = ComponentRegistry.getInstance();
    registry.clear();
    
    // Create mock component (actual Component instance)
    mockComponent = {
      id: 'test-component',
      type: 'TestComponent',
      parent: null,
      children: [],
      x: 0,
      y: 0,
      width: 10,
      height: 5,
      visible: true,
      focused: false,
      render: jest.fn(),
      handleKey: jest.fn()
    };

    // Create mock ComponentRef for tests that need it
    mockComponentRef = {
      id: 'test-component',
      component: mockComponent,
      metadata: {
        id: 'test-component',
        type: 'TestComponent',
        children: [],
        props: {},
        state: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        mounted: false
      }
    };
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = ComponentRegistry.getInstance();
      const instance2 = ComponentRegistry.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Component Registration', () => {
    it('should register component', () => {
      const id = registry.register(mockComponent);
      
      expect(id).toBe('test-component');
      const ref = registry.get(id);
      expect(ref).toBeDefined();
      expect(ref?.component).toBe(mockComponent);
    });

    it('should auto-generate ID if not provided', () => {
      delete mockComponent.id;
      const id = registry.register(mockComponent);
      
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      const ref = registry.get(id);
      expect(ref).toBeDefined();
      expect(ref?.component).toBe(mockComponent);
    });

    it('should handle duplicate IDs', () => {
      registry.register(mockComponent);
      
      const duplicate = { ...mockComponent };
      const newId = registry.register(duplicate);
      
      expect(newId).not.toBe(mockComponent.id);
    });

    it('should unregister component', () => {
      const id = registry.register(mockComponent);
      registry.unregister(id);
      
      expect(registry.get(id)).toBeUndefined();
    });

    it('should update metadata on registration', () => {
      const id = registry.register(mockComponent);
      
      const retrieved = registry.get(id);
      expect(retrieved).toBeDefined();
      if (retrieved) {
        expect(retrieved.metadata).toBeDefined();
        expect(retrieved.metadata.id).toBe('test-component');
      }
    });
  });

  describe('Component Retrieval', () => {
    it('should get component by ID', () => {
      registry.register(mockComponent);
      
      const retrieved = registry.get('test-component');
      expect(retrieved).toBeDefined();
      expect(retrieved?.component).toBe(mockComponent);
    });

    it('should return undefined for non-existent ID', () => {
      const retrieved = registry.get('non-existent');
      expect(retrieved).toBeUndefined();
    });

    it('should get all components', () => {
      const comp1 = { ...mockComponent, id: 'comp1' };
      const comp2 = { ...mockComponent, id: 'comp2' };
      
      registry.register(comp1);
      registry.register(comp2);
      
      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all.some(ref => ref.component === comp1)).toBe(true);
      expect(all.some(ref => ref.component === comp2)).toBe(true);
    });

    it('should get components by type', () => {
      const comp1 = { ...mockComponent, id: 'comp1', type: 'Button' };
      const comp2 = { ...mockComponent, id: 'comp2', type: 'Input' };
      const comp3 = { ...mockComponent, id: 'comp3', type: 'Button' };
      
      registry.register(comp1);
      registry.register(comp2);
      registry.register(comp3);
      
      const buttons = registry.getByType('Button');
      expect(buttons).toHaveLength(2);
      expect(buttons.some(ref => ref.component === comp1)).toBe(true);
      expect(buttons.some(ref => ref.component === comp3)).toBe(true);
    });
  });

  describe('Component Search', () => {
    it('should find components by predicate', () => {
      const comp1 = { ...mockComponent, id: 'comp1' };
      const comp2 = { ...mockComponent, id: 'comp2' };
      const comp3 = { ...mockComponent, id: 'comp3' };
      
      registry.register(comp1);
      registry.register(comp2);
      registry.register(comp3);
      
      // Update metadata with region after registration
      registry.updateMetadata('comp1', { region: { x: 5, y: 0, width: 10, height: 5 }} as any);
      registry.updateMetadata('comp2', { region: { x: 10, y: 0, width: 10, height: 5 }} as any);
      registry.updateMetadata('comp3', { region: { x: 15, y: 0, width: 10, height: 5 }} as any);
      
      const found = registry.find(comp => (comp.metadata.region?.x || 0) > 7);
      expect(found).toHaveLength(2);
      expect(found.some(ref => ref.id === 'comp2')).toBe(true);
      expect(found.some(ref => ref.id === 'comp3')).toBe(true);
    });

    it('should find one component by predicate', () => {
      const comp1 = { ...mockComponent, id: 'comp1' };
      const comp2 = { ...mockComponent, id: 'comp2' };
      
      registry.register(comp1);
      registry.register(comp2);
      
      // Update metadata with region after registration
      registry.updateMetadata('comp1', { region: { x: 5, y: 0, width: 10, height: 5 }} as any);
      registry.updateMetadata('comp2', { region: { x: 10, y: 0, width: 10, height: 5 }} as any);
      
      const found = registry.findOne(comp => (comp.metadata.region?.x || 0) === 10);
      expect(found?.id).toBe('comp2');
    });

    it('should return undefined if findOne finds nothing', () => {
      registry.register(mockComponent);
      
      const found = registry.findOne(comp => (comp.metadata.region?.x || 0) === 999);
      expect(found).toBeUndefined();
    });

    it('should find by ID', () => {
      registry.register(mockComponent);
      
      const found = registry.findById('test-component');
      expect(found).toBeDefined();
      expect(found?.id).toBe('test-component');
    });
  });

  describe('Component Hierarchy', () => {
    it('should get children of component', () => {
      const parent = { ...mockComponent, id: 'parent', children: ['child1', 'child2'] };
      const child1 = { ...mockComponent, id: 'child1', parent: 'parent' };
      const child2 = { ...mockComponent, id: 'child2', parent: 'parent' };
      
      registry.register(parent);
      registry.register(child1);
      registry.register(child2);
      
      registry.updateComponentTree('child1', 'parent');
      registry.updateComponentTree('child2', 'parent');
      
      const children = registry.getChildren('parent');
      expect(children).toHaveLength(2);
      expect(children.some(ref => ref.id === 'child1')).toBe(true);
      expect(children.some(ref => ref.id === 'child2')).toBe(true);
    });

    it('should get ancestors of component', () => {
      const grandparent = { ...mockComponent, id: 'grandparent', children: ['parent'] };
      const parent = { ...mockComponent, id: 'parent', parent: 'grandparent', children: ['child'] };
      const child = { ...mockComponent, id: 'child', parent: 'parent' };
      
      registry.register(grandparent);
      registry.register(parent);
      registry.register(child);
      
      registry.updateComponentTree('parent', 'grandparent');
      registry.updateComponentTree('child', 'parent');
      
      const ancestors = registry.getAncestors('child');
      expect(ancestors).toHaveLength(2);
      expect(ancestors[0].id).toBe('parent');
      expect(ancestors[1].id).toBe('grandparent');
    });

    it('should update component tree', () => {
      const parent = { ...mockComponent, id: 'parent', children: [] };
      const child = { ...mockComponent, id: 'child', parent: null };
      
      registry.register(parent);
      registry.register(child);
      
      registry.updateComponentTree('child', 'parent');
      
      const updatedParent = registry.get('parent');
      const updatedChild = registry.get('child');
      
      expect(updatedParent).toBeDefined();
      expect(updatedChild).toBeDefined();
      if (updatedParent && updatedChild) {
        expect(updatedParent.metadata.children).toContain('child');
        expect(updatedChild.metadata.parent).toBe('parent');
      }
    });

    it('should move component to new parent', () => {
      const oldParent = { ...mockComponent, id: 'old-parent', children: ['child'] };
      const newParent = { ...mockComponent, id: 'new-parent', children: [] };
      const child = { ...mockComponent, id: 'child', parent: 'old-parent' };
      
      registry.register(oldParent);
      registry.register(newParent);
      registry.register(child);
      
      registry.moveToParent('child', 'new-parent');
      
      const updatedOld = registry.get('old-parent');
      const updatedNew = registry.get('new-parent');
      const updatedChild = registry.get('child');
      
      expect(updatedOld).toBeDefined();
      expect(updatedNew).toBeDefined();
      expect(updatedChild).toBeDefined();
      if (updatedOld && updatedNew && updatedChild) {
        expect(updatedOld.metadata.children).not.toContain('child');
        expect(updatedNew.metadata.children).toContain('child');
        expect(updatedChild.metadata.parent).toBe('new-parent');
      }
    });
  });

  describe('Mount/Unmount', () => {
    it('should mount component', () => {
      registry.register(mockComponent);
      registry.mount('test-component');
      
      const mounted = registry.getMounted();
      expect(mounted.length).toBeGreaterThan(0);
      expect(mounted.some(ref => ref.id === 'test-component')).toBe(true);
    });

    it('should unmount component', () => {
      registry.register(mockComponent);
      registry.mount('test-component');
      registry.unmount('test-component');
      
      const mounted = registry.getMounted();
      expect(mounted.some(ref => ref.id === 'test-component')).toBe(false);
    });

    it('should get all mounted components', () => {
      const comp1 = { ...mockComponent, id: 'comp1' };
      const comp2 = { ...mockComponent, id: 'comp2' };
      const comp3 = { ...mockComponent, id: 'comp3' };
      
      registry.register(comp1);
      registry.register(comp2);
      registry.register(comp3);
      
      registry.mount('comp1');
      registry.mount('comp3');
      
      const mounted = registry.getMounted();
      expect(mounted).toHaveLength(2);
      expect(mounted.some(ref => ref.component === comp1)).toBe(true);
      expect(mounted.some(ref => ref.component === comp3)).toBe(true);
      expect(mounted.some(ref => ref.component === comp2)).toBe(false);
    });
  });

  describe('Metadata', () => {
    it('should update component metadata', () => {
      registry.register(mockComponent);
      
      registry.updateMetadata('test-component', { 
        name: 'Updated Component'
      } as any);
      
      const component = registry.get('test-component');
      expect(component).toBeDefined();
      if (component) {
        expect(component.metadata.name).toBe('Updated Component');
      }
    });

    it('should merge metadata updates', () => {
      registry.register(mockComponent);
      
      registry.updateMetadata('test-component', { 
        name: 'New Name',
        state: { custom: 'value' }
      } as any);
      
      const component = registry.get('test-component');
      expect(component).toBeDefined();
      if (component) {
        expect(component.metadata.name).toBe('New Name');
        expect(component.metadata.state).toMatchObject({ custom: 'value' });
      }
    });
  });

  describe('Statistics', () => {
    it('should get registry statistics', () => {
      const comp1 = { ...mockComponent, id: 'comp1', type: 'Button' };
      const comp2 = { ...mockComponent, id: 'comp2', type: 'Input' };
      const comp3 = { ...mockComponent, id: 'comp3', type: 'Button' };
      
      registry.register(comp1);
      registry.register(comp2);
      registry.register(comp3);
      registry.mount('comp1');
      registry.mount('comp2');
      
      const stats = registry.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.mounted).toBe(2);
      expect(stats.byType).toMatchObject({
        Button: 2,
        Input: 1
      });
    });
  });

  describe('Tree Visualization', () => {
    it('should get tree as JSON', () => {
      const root = { ...mockComponent, id: 'root', children: ['child1', 'child2'] };
      const child1 = { ...mockComponent, id: 'child1', parent: 'root', children: ['grandchild'] };
      const child2 = { ...mockComponent, id: 'child2', parent: 'root' };
      const grandchild = { ...mockComponent, id: 'grandchild', parent: 'child1' };
      
      registry.register(root);
      registry.register(child1);
      registry.register(child2);
      registry.register(grandchild);
      
      // Update component tree relationships
      registry.updateComponentTree('child1', 'root');
      registry.updateComponentTree('child2', 'root');
      registry.updateComponentTree('grandchild', 'child1');
      
      const tree = registry.getTreeJSON();
      
      expect(tree).toBeInstanceOf(Array);
      expect(tree.length).toBeGreaterThan(0);
      expect(tree[0]).toMatchObject({
        id: 'root',
        type: 'TestComponent',
        children: expect.arrayContaining([
          expect.objectContaining({
            id: 'child1',
            type: 'TestComponent',
            children: expect.arrayContaining([
              expect.objectContaining({
                id: 'grandchild',
                type: 'TestComponent',
                children: []
              })
            ])
          }),
          expect.objectContaining({
            id: 'child2',
            type: 'TestComponent',
            children: []
          })
        ])
      });
    });

    it('should generate tree string', () => {
      const root = { ...mockComponent, id: 'root', children: ['child'] };
      const child = { ...mockComponent, id: 'child', parent: 'root' };
      
      registry.register(root);
      registry.register(child);
      
      registry.updateComponentTree('child', 'root');
      
      const treeStr = registry.tree('root');
      
      expect(treeStr).toContain('TestComponent');
      expect(treeStr).toContain('#root');
      expect(treeStr).toContain('#child');
      expect(treeStr).toContain('└');
    });
  });

  describe('Clear and Reset', () => {
    it('should clear all components', () => {
      registry.register({ ...mockComponent, id: 'comp1' });
      registry.register({ ...mockComponent, id: 'comp2' });
      
      registry.clear();
      
      expect(registry.getAll()).toHaveLength(0);
      expect(registry.get('comp1')).toBeUndefined();
      expect(registry.get('comp2')).toBeUndefined();
    });

    it('should clear mounted set', () => {
      registry.register(mockComponent);
      registry.mount('test-component');
      
      registry.clear();
      
      expect(registry.getMounted()).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined gracefully', () => {
      expect(() => registry.register(null as any)).not.toThrow();
      expect(() => registry.get(null as any)).not.toThrow();
      expect(() => registry.unregister(undefined as any)).not.toThrow();
    });

    it('should handle circular parent-child relationships', () => {
      const comp1 = { ...mockComponent, id: 'comp1', parent: 'comp2' };
      const comp2 = { ...mockComponent, id: 'comp2', parent: 'comp1' };
      
      registry.register(comp1);
      registry.register(comp2);
      
      // Should not cause infinite loop
      const ancestors = registry.getAncestors('comp1');
      expect(ancestors).toBeDefined();
    });

    it('should handle missing parent references', () => {
      const orphan = { ...mockComponent, id: 'orphan', parent: 'non-existent' };
      
      registry.register(orphan);
      
      const ancestors = registry.getAncestors('orphan');
      expect(ancestors).toHaveLength(0);
    });
  });
});