/**
 * JSON editing logic
 */

import { JsonNode } from './types';
import { buildNodeTree } from './nodeTree';

/**
 * Parse value based on type
 */
export function parseValue(this: any, editValue: string, type: JsonNode['type']): any {
  let newValue: any = editValue;
  
  if (type === 'number') {
    newValue = Number(editValue);
    if (isNaN(newValue)) return null;
  } else if (type === 'boolean') {
    newValue = editValue.toLowerCase() === 'true';
  } else if (type === 'null') {
    newValue = null;
  }
  
  return newValue;
}

/**
 * Update value in data
 */
export function updateValue(this: any, data: any, path: string[], value: any): any {
  if (path.length === 0) {
    return value;
  }
  
  let current = data;
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]];
  }
  current[path[path.length - 1]] = value;
  return data;
}

/**
 * Add new property to object
 */
export function addProperty(this: any, data: any, node: JsonNode): { data: any; newNodePath: string[] } {
  if (node.type !== 'object') {
    throw new Error('Can only add properties to objects');
  }
  
  const key = `newProperty${Object.keys(node.value).length}`;
  node.value[key] = '';
  
  return {
    data,
    newNodePath: [...node.path, key]
  };
}

/**
 * Delete property from data
 */
export function deleteProperty(this: any, data: any, node: JsonNode): any {
  if (node.path.length === 0) {
    throw new Error('Cannot delete root node');
  }
  
  // Get parent and delete property
  let parent = data;
  for (let i = 0; i < node.path.length - 1; i++) {
    parent = parent[node.path[i]];
  }
  
  const lastKey = node.path[node.path.length - 1];
  if (Array.isArray(parent)) {
    parent.splice(Number(lastKey), 1);
  } else {
    delete parent[lastKey];
  }
  
  return data;
}