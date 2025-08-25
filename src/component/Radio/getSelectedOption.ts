import { RadioOption } from './types';

export function getSelectedOption(this: any): RadioOption | null {
  return this.options[this.selectedIndex] || null;
}