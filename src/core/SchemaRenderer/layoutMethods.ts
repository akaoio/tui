/**
 * Layout building methods
 */

import { SchemaRendererState } from './types';
import { LayoutNode } from '../LayoutEngine';

/**
 * Build layout tree from schema
 */
export function buildLayoutTree(this: any, state: SchemaRendererState): void {
  if (state.schema.layout) {
    state.layoutTree = createLayoutNode(state, state.schema.layout);
  } else if (state.schema.main) {
    const mainDef = typeof state.schema.main === 'string' 
      ? state.schema.components?.[state.schema.main] || state.schema.screens?.[state.schema.main]
      : state.schema.main;
    
    if (mainDef) {
      state.layoutTree = createLayoutNode(state, mainDef);
    }
  } else if (state.schema.screens?.main) {
    state.layoutTree = createLayoutNode(state, state.schema.screens.main);
  }
}

/**
 * Create a layout node from schema definition
 */
export function createLayoutNode(this: any, state: SchemaRendererState, def: any): LayoutNode {
  // Handle component reference
  if (def.component) {
    const component = state.schema.components?.[def.component];
    if (component) {
      const merged = {
        ...component,
        ...def // Override with layout-specific props
      };
      delete merged.component; // Remove to avoid infinite recursion
      return createLayoutNode(state, merged);
    }
  }
  
  // Resolve references
  if (typeof def === 'string') {
    def = state.schema.components?.[def] || def;
  } else if (def.$ref) {
    def = resolveReference(state, def.$ref);
  }
  
  const node: LayoutNode = {
    type: def.type || 'container',
    props: { ...def.props, ...def }
  };
  
  // Process children
  const children = def.children || def.props?.children;
  if (children) {
    node.children = Array.isArray(children)
      ? children.map((child: any) => createLayoutNode(state, child))
      : [createLayoutNode(state, children)];
  }
  
  return node;
}

/**
 * Resolve a JSON reference
 */
export function resolveReference(this: any, state: SchemaRendererState, ref: string): any {
  const path = ref.replace('#/', '').split('/');
  let current: any = state.schema;
  
  for (const segment of path) {
    current = current[segment];
    if (!current) return null;
  }
  
  return current;
}

/**
 * Check if a component is focusable
 */
export function isFocusable(this: any, def: any): boolean {
  const focusableTypes = ['input', 'text', 'select', 'list', 'button', 'checkbox', 'radio'];
  return focusableTypes.includes(def.type);
}