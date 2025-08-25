/**
 * Rendering logic for JsonEditor
 */

import { JsonNode } from './types';

export interface RenderState {
  nodes: JsonNode[];
  selectedIndex: number;
  scrollOffset: number;
  editMode: boolean;
  editValue: string;
}

/**
 * Render JSON node as formatted line
 */
export function renderNodeLine(this: any, node: JsonNode,
  isSelected: boolean,
  editMode: boolean,
  editValue: string): string {
  const indent = '  '.repeat(node.level);
  
  // Selection indicator
  const prefix = isSelected ? '▶ ' : '  ';
  const bgColor = isSelected ? '\x1b[48;5;238m' : '';
  const resetBg = isSelected ? '\x1b[0m' : '';
  
  // Build line
  let line = `${bgColor}${prefix}${indent}`;
  
  // Expand/collapse indicator
  if (node.type === 'object' || node.type === 'array') {
    line += node.expanded ? '▼ ' : '▶ ';
  } else {
    line += '  ';
  }
  
  // Key
  if (node.key !== 'root') {
    line += `\x1b[36m${node.key}\x1b[0m${bgColor}: `;
  }
  
  // Value
  if (isSelected && editMode) {
    // Edit mode
    line += `\x1b[33m${editValue}█\x1b[0m`;
  } else {
    // Display mode
    line += renderNodeValue(node);
  }
  
  line += resetBg;
  
  return line;
}

/**
 * Render node value with appropriate styling
 */
function renderNodeValue(node: JsonNode): string {
  if (node.type === 'object') {
    const count = Object.keys(node.value).length;
    return `\x1b[90m{ ${count} properties }${node.expanded ? '' : '...'}\x1b[0m`;
  } else if (node.type === 'array') {
    return `\x1b[90m[ ${node.value.length} items ]${node.expanded ? '' : '...'}\x1b[0m`;
  } else if (node.type === 'string') {
    return `\x1b[32m"${node.value}"\x1b[0m`;
  } else if (node.type === 'number') {
    return `\x1b[33m${node.value}\x1b[0m`;
  } else if (node.type === 'boolean') {
    return node.value ? '\x1b[32mtrue\x1b[0m' : '\x1b[31mfalse\x1b[0m';
  } else if (node.type === 'null') {
    return '\x1b[90mnull\x1b[0m';
  }
  return '';
}

/**
 * Get visible nodes for rendering
 */
export function getVisibleNodes(this: any, nodes: JsonNode[],
  scrollOffset: number,
  maxHeight: number): JsonNode[] {
  return nodes.slice(scrollOffset, scrollOffset + maxHeight);
}

/**
 * Generate scroll indicator text
 */
export function getScrollIndicator(this: any, selectedIndex: number,
  totalNodes: number): string {
  return `${selectedIndex + 1}/${totalNodes}`;
}