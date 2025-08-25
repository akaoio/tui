/**
 * Types and interfaces for ComponentAdapter
 */

import { Component } from '../../component/Component';
import { Screen } from '../screen';
import { Keyboard } from '../keyboard';

export interface SchemaComponentDefinition {
  type: string;
  props?: Record<string, any>;
  style?: Record<string, any>;
  children?: SchemaComponentDefinition[];
  data?: any;
  template?: string;
  itemTemplate?: string;
  events?: Record<string, string>;
}

export interface AdapterContext {
  screen: Screen;
  keyboard: Keyboard;
  store?: any;
  resolveValue: (value: any) => any;
}

export interface ComponentRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComponentEventData {
  component: Component;
  event: string;
  handler: string;
  args: any[];
}