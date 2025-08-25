import { ComponentOptions } from '../Component';

export interface RadioOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface RadioOptions extends ComponentOptions {
  options: RadioOption[];
  selected?: number;
  orientation?: 'horizontal' | 'vertical';
}