/**
 * Types and interfaces for SchemaRenderer
 */

import { EventEmitter } from 'events';
import { ScreenManager } from '../ScreenManager/index';
import { ComponentAdapter, SchemaComponentDefinition } from '../ComponentAdapter/index';
import { StoreManager, StoreSchema } from '../StoreManager/index';
import { LayoutEngine, LayoutNode, ComputedBox } from '../LayoutEngine/index';
import { UnifiedKeyboardHandler } from '../UnifiedKeyboardHandler';
import { MetaSchemaEngine } from '../MetaSchema/index';

export interface SchemaApp {
  name: string;
  version: string;
  store?: StoreSchema | any;  // Support both old and new format
  components?: Record<string, SchemaComponentDefinition | any>;
  screens?: Record<string, any>;
  main?: string | any;
  hooks?: {
    onMount?: string;
    onUpdate?: string;
  };
  keybindings?: Record<string, string | Function>;
  layout?: any;
}

export interface SchemaRendererState {
  screen: ScreenManager;
  componentAdapter: ComponentAdapter;
  storeManager?: StoreManager;
  layoutEngine: LayoutEngine;
  keyboardHandler?: UnifiedKeyboardHandler;
  metaEngine: MetaSchemaEngine;
  schema: SchemaApp;
  layoutTree: LayoutNode | null;
  focusableComponents: string[];
  currentFocusIndex: number;
  isDestroyed: boolean;
  
  // Compatibility properties for old code
  inputMode: boolean;
  inputText: string;
  editingTodoId: string | null;
}

export interface BoxChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
}