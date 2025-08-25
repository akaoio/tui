/**
 * Select selectCurrent method
 */

import { updateValue } from './updateValue';
import { close } from './close';

export function selectCurrent(this: any): void {
  const result = this.selection.selectCurrent(this.state);
  
  if (result.value !== undefined) {
    updateValue.call(this);
    this.emit('select', result.value);
    this.emit('change', result.value);
    
    if (result.shouldClose) {
      close.call(this);
    }
  }
}