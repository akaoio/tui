/**
 * Form types
 */

import { Component } from '../Component';

export interface FormOptions {
  title?: string;
  components: Component[];
  submitLabel?: string;
  cancelLabel?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}