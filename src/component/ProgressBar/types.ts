import { ComponentOptions } from '../Component';
import { Color } from '../../utils/colors';

export interface ProgressBarOptions extends ComponentOptions {
  total: number;
  current?: number;
  showPercentage?: boolean;
  showNumbers?: boolean;
  barWidth?: number;
  completeChar?: string;
  incompleteChar?: string;
  barColor?: Color;
}