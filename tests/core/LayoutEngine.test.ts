import { LayoutEngine } from '../../src/core/LayoutEngine/LayoutEngine';
import { LayoutNode } from '../../src/core/LayoutEngine/types';

describe('LayoutEngine', () => {
  let layoutEngine: LayoutEngine;
  let mockNode: LayoutNode;

  beforeEach(() => {
    layoutEngine = LayoutEngine.getInstance();
    
    mockNode = {
      id: 'root',
      type: 'container',
      props: {
        layout: 'flex',
        direction: 'horizontal',
        gap: 2,
        style: {
          padding: 5,
          margin: 2
        },
        border: true
      },
      children: [
        {
          id: 'child1',
          type: 'component',
          props: {
            width: 20,
            height: 10,
            style: {
              margin: 2
            }
          }
        },
        {
          id: 'child2',
          type: 'component',
          props: {
            width: 30,
            height: 15,
            style: {
              margin: 1
            }
          }
        }
      ]
    };
  });

  describe('Singleton Instance', () => {
    it('should return the same instance', () => {
      const instance1 = LayoutEngine.getInstance();
      const instance2 = LayoutEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Dimension Updates', () => {
    it('should update root dimensions', () => {
      layoutEngine.updateDimensions(120, 40);
      const computed = layoutEngine.computeLayout(mockNode, { x: 0, y: 0, width: 120, height: 40 });
      
      expect(computed.outerBox.width).toBe(120);
      expect(computed.outerBox.height).toBe(40);
    });
  });

  describe('Layout Computation', () => {
    it('should compute layout with default dimensions', () => {
      const computed = layoutEngine.computeLayout(mockNode);
      
      expect(computed).toBeDefined();
      expect(computed.outerBox).toBeDefined();
      expect(computed.contentBox).toBeDefined();
    });

    it('should compute layout with custom parent box', () => {
      const parentBox = { x: 10, y: 10, width: 100, height: 50 };
      const computed = layoutEngine.computeLayout(mockNode, parentBox);
      
      expect(computed.outerBox.width).toBe(100);
      expect(computed.outerBox.height).toBe(50);
    });

    it('should calculate flex layout', () => {
      const computed = layoutEngine.computeLayout(mockNode, { x: 0, y: 0, width: 100, height: 50 });
      
      expect(computed).toBeDefined();
      expect(mockNode.children).toBeDefined();
      if (mockNode.children) {
        expect(mockNode.children.length).toBe(2);
        // Children should have computed boxes after layout
        expect(mockNode.children[0].computed).toBeDefined();
        expect(mockNode.children[1].computed).toBeDefined();
      }
    });

    it('should handle grid layout', () => {
      mockNode.props.layout = 'grid';
      mockNode.props.columns = 2;
      mockNode.props.rows = 2;
      
      const computed = layoutEngine.computeLayout(mockNode, { x: 0, y: 0, width: 100, height: 50 });
      
      expect(computed).toBeDefined();
      if (mockNode.children) {
        expect(mockNode.children[0].computed).toBeDefined();
        expect(mockNode.children[1].computed).toBeDefined();
      }
    });

    it('should handle stack layout', () => {
      mockNode.props.layout = 'stack';
      
      const computed = layoutEngine.computeLayout(mockNode, { x: 0, y: 0, width: 100, height: 50 });
      
      expect(computed).toBeDefined();
      if (mockNode.children) {
        expect(mockNode.children[0].computed).toBeDefined();
        expect(mockNode.children[1].computed).toBeDefined();
      }
    });

    it('should handle absolute layout', () => {
      mockNode.props.layout = 'absolute';
      if (mockNode.children) {
        mockNode.children[0].props.position = { x: 10, y: 5 };
        mockNode.children[1].props.position = { x: 40, y: 10 };
      }
      
      const computed = layoutEngine.computeLayout(mockNode, { x: 0, y: 0, width: 100, height: 50 });
      
      expect(computed).toBeDefined();
      if (mockNode.children) {
        expect(mockNode.children[0].computed).toBeDefined();
        expect(mockNode.children[1].computed).toBeDefined();
      }
    });
  });

  describe('Nested Layouts', () => {
    it('should handle nested flex layouts', () => {
      const nestedNode: LayoutNode = {
        id: 'root',
        type: 'container',
        props: {
          layout: 'flex',
          direction: 'vertical'
        },
        children: [
          {
            id: 'row1',
            type: 'container',
            props: {
              layout: 'flex',
              direction: 'horizontal'
            },
            children: [
              { id: 'cell1', type: 'component' },
              { id: 'cell2', type: 'component' }
            ]
          },
          {
            id: 'row2',
            type: 'container',
            props: {
              layout: 'flex',
              direction: 'horizontal'
            },
            children: [
              { id: 'cell3', type: 'component' },
              { id: 'cell4', type: 'component' }
            ]
          }
        ]
      };

      const computed = layoutEngine.computeLayout(nestedNode, { x: 0, y: 0, width: 100, height: 50 });
      
      expect(computed).toBeDefined();
      if (nestedNode.children) {
        expect(nestedNode.children[0].computed).toBeDefined();
        expect(nestedNode.children[1].computed).toBeDefined();
        
        const row1 = nestedNode.children[0];
        if (row1.children) {
          expect(row1.children[0].computed).toBeDefined();
          expect(row1.children[1].computed).toBeDefined();
        }
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      mockNode.children = [];
      const computed = layoutEngine.computeLayout(mockNode);
      
      expect(computed).toBeDefined();
      expect(computed.outerBox).toBeDefined();
    });

    it('should handle undefined children', () => {
      mockNode.children = undefined;
      const computed = layoutEngine.computeLayout(mockNode);
      
      expect(computed).toBeDefined();
      expect(computed.outerBox).toBeDefined();
    });

    it('should handle missing props', () => {
      const simpleNode: LayoutNode = {
        id: 'simple',
        type: 'component'
      };
      
      const computed = layoutEngine.computeLayout(simpleNode);
      
      expect(computed).toBeDefined();
      expect(computed.outerBox).toBeDefined();
    });

    it('should handle zero dimensions', () => {
      const computed = layoutEngine.computeLayout(mockNode, { x: 0, y: 0, width: 0, height: 0 });
      
      expect(computed).toBeDefined();
      expect(computed.outerBox.width).toBe(0);
      expect(computed.outerBox.height).toBe(0);
    });
  });
});