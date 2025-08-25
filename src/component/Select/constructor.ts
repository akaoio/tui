/**
 * Select constructor logic
 */

import { Screen } from '../../core/screen';
import { Keyboard } from '../../core/keyboard';
import { SelectOptions, SelectState } from './types';
import { SelectRenderer } from './renderer';
import { SelectNavigation } from './navigation';
import { SelectionManager } from './selection';
import { updateValue } from './updateValue';

export function constructor(
  this: any,
  screen: Screen,
  keyboard: Keyboard,
  options: SelectOptions
): void {
  this.options = options.options || [];
  this.multiple = options.multiple || false;
  this.maxDisplay = options.maxDisplay || 10;
  
  this.state = {
    selectedIndex: options.selected || 0,
    hoveredIndex: options.selected || 0,
    scrollOffset: 0,
    selectedIndices: new Set(),
    isOpen: false
  };
  
  this.height = 1;
  
  if (this.multiple && this.state.selectedIndex >= 0) {
    this.state.selectedIndices.add(this.state.selectedIndex);
  }
  
  this.renderer = new SelectRenderer(screen);
  this.navigation = new SelectNavigation(this.options, this.maxDisplay);
  this.selection = new SelectionManager(this.options, this.multiple);
  
  updateValue.call(this);
}