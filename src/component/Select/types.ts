/**
 * Types and interfaces for Select component
 */

import { ComponentOptions } from '../Component';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface SelectOptions extends ComponentOptions {
  options: SelectOption[];
  selected?: number;
  multiple?: boolean;
  maxDisplay?: number;
}

export interface SelectState {
  selectedIndex: number;
  hoveredIndex: number;
  scrollOffset: number;
  selectedIndices: Set<number>;
  isOpen: boolean;
}