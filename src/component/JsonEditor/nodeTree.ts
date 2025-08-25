/**
 * JSON node tree building logic
 */

import { JsonNode } from './types';

/**
 * Build node tree from JSON data
 */
export function buildNodeTree(this: any, data: any, 
  key: string = 'root', 
  path: string[] = [], 
  level: number = 0): JsonNode[] {
  const nodes: JsonNode[] = [];
  const type = getType(data);
  
  const node: JsonNode = {
    key,
    value: data,
    type,
    path,
    expanded: level < 2, // Auto-expand first 2 levels
    level
  };
  
  nodes.push(node);
  
  if (node.expanded) {
    if (type === 'object' && data !== null) {
      node.children = [];
      Object.entries(data).forEach(([k, v]) => {
        const childNodes = buildNodeTree(v, k, [...path, k], level + 1);
        childNodes[0].parent = node;
        node.children!.push(...childNodes);
        nodes.push(...childNodes);
      });
    } else if (type === 'array') {
      node.children = [];
      data.forEach((item: any, index: number) => {
        const childNodes = buildNodeTree(item, `[${index}]`, [...path, String(index)], level + 1);
        childNodes[0].parent = node;
        node.children!.push(...childNodes);
        nodes.push(...childNodes);
      });
    }
  }
  
  return nodes;
}

/**
 * Get type of value
 */
export function getType(this: any, value: any): JsonNode['type'] {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonNode['type'];
}

/**
 * Check if node is descendant of another
 */
export function isDescendantOf(this: any, node: JsonNode, ancestor: JsonNode): boolean {
  let current = node.parent;
  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }
  return false;
}