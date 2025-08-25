/**
 * Input handling for JsonEditor
 */

import { JsonNode } from './types';

export interface InputHandlerState {
  editMode: boolean;
  editValue: string;
  selectedIndex: number;
  scrollOffset: number;
  nodes: JsonNode[];
}

/**
 * Handle input in edit mode
 */
export function handleEditModeInput(
  char: string,
  key: any,
  state: InputHandlerState,
  applyEdit: () => void
): boolean {
  if (key?.name === 'escape') {
    state.editMode = false;
    state.editValue = '';
    return true;
  }
  
  if (key?.name === 'return' || key?.name === 'enter') {
    applyEdit();
    return true;
  }
  
  if (key?.name === 'backspace') {
    state.editValue = state.editValue.slice(0, -1);
    return true;
  }
  
  if (char && char.length === 1) {
    state.editValue += char;
    return true;
  }
  
  return true;
}

/**
 * Handle input in normal mode
 */
export function handleNormalModeInput(
  char: string,
  key: any,
  state: InputHandlerState,
  callbacks: {
    moveSelection: (delta: number) => void;
    toggleNode: (node: JsonNode) => void;
    startEdit: () => void;
    addProperty: () => void;
    deleteProperty: () => void;
  }
): boolean {
  if (key?.name === 'up' || char === 'k') {
    callbacks.moveSelection(-1);
    return true;
  }
  
  if (key?.name === 'down' || char === 'j') {
    callbacks.moveSelection(1);
    return true;
  }
  
  if (key?.name === 'left' || char === 'h') {
    const node = state.nodes[state.selectedIndex];
    if (node && node.expanded) {
      callbacks.toggleNode(node);
    }
    return true;
  }
  
  if (key?.name === 'right' || char === 'l') {
    const node = state.nodes[state.selectedIndex];
    if (node && !node.expanded && (node.type === 'object' || node.type === 'array')) {
      callbacks.toggleNode(node);
    }
    return true;
  }
  
  if (key?.name === 'return' || key?.name === 'enter' || char === 'e') {
    callbacks.startEdit();
    return true;
  }
  
  if (char === ' ') {
    const node = state.nodes[state.selectedIndex];
    if (node) {
      callbacks.toggleNode(node);
    }
    return true;
  }
  
  if (char === 'a') {
    callbacks.addProperty();
    return true;
  }
  
  if (char === 'd' || key?.name === 'delete') {
    callbacks.deleteProperty();
    return true;
  }
  
  return false;
}

/**
 * Move selection and adjust scroll
 */
export function moveSelection(this: any, delta: number,
  state: InputHandlerState,
  props: { height?: number }): void {
  state.selectedIndex = Math.max(0, Math.min(state.nodes.length - 1, state.selectedIndex + delta));
  
  // Adjust scroll to keep selection visible
  const visibleHeight = props.height || 20;
  if (state.selectedIndex < state.scrollOffset) {
    state.scrollOffset = state.selectedIndex;
  } else if (state.selectedIndex >= state.scrollOffset + visibleHeight - 2) {
    state.scrollOffset = state.selectedIndex - visibleHeight + 3;
  }
}