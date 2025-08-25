import { ComponentOptions } from '../Component';

export interface CheckboxOptions extends ComponentOptions {
  label: string;
  checked?: boolean;
  disabled?: boolean;
}