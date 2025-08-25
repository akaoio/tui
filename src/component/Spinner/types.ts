import { ComponentOptions } from '../Component';
import { Color } from '../../utils/colors';

export interface SpinnerOptions extends ComponentOptions {
  text?: string;
  style?: 'dots' | 'line' | 'circle' | 'square' | 'arrow' | 'pulse';
  color?: Color;
}