/**
 * Types for JsonEditor component
 */

export interface JsonNode {
  key: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  path: string[];
  expanded: boolean;
  level: number;
  parent?: JsonNode;
  children?: JsonNode[];
}