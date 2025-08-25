/**
 * Input component types and interfaces
 */

import { ComponentOptions } from '../Component';

export interface InputOptions extends ComponentOptions {
  label?: string;
  placeholder?: string;
  value?: string;
  maxLength?: number;
  password?: boolean;
  multiline?: boolean;
  validator?: (value: string) => string | null;
}

export interface InputState {
  value: string;
  cursorPosition: number;
  scrollOffset: number;
  lines: string[];
  currentLine: number;
  error: string | null;
}