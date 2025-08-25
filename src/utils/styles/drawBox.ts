/**
 * Box drawing function
 */

import { BoxStyle } from './types';
import { BoxStyles } from './boxStyles';

export function drawBox(this: any, width: number,
  height: number,
  style: BoxStyle | string = BoxStyles.Single): string {
  
  // Convert string to BoxStyle if needed
  let boxStyle: BoxStyle;
  if (typeof style === 'string') {
    const styleMap: { [key: string]: BoxStyle } = {
      'single': BoxStyles.Single,
      'double': BoxStyles.Double,
      'rounded': BoxStyles.Rounded,
      'bold': BoxStyles.Bold,
      'ascii': BoxStyles.ASCII,
    };
    boxStyle = styleMap[style.toLowerCase()] || BoxStyles.Single;
  } else {
    boxStyle = style;
  }
  // Handle edge cases
  if (width < 1 || height < 1) {
    return '';
  }
  
  if (width === 1 && height === 1) {
    return boxStyle.topLeft || '┌';
  }
  
  if (width === 1) {
    // Single column - return vertical lines separated by newlines
    const lines: string[] = [];
    for (let i = 0; i < height; i++) {
      lines.push(boxStyle.vertical);
    }
    return lines.join('\n');
  }
  
  if (height === 1) {
    // Single row - return just horizontal line
    return boxStyle.horizontal.repeat(width);
  }
  
  const lines: string[] = [];
  
  const topLine = boxStyle.topLeft + boxStyle.horizontal.repeat(Math.max(0, width - 2)) + boxStyle.topRight;
  lines.push(topLine);
  
  for (let i = 0; i < height - 2; i++) {
    const middleLine = boxStyle.vertical + ' '.repeat(Math.max(0, width - 2)) + boxStyle.vertical;
    lines.push(middleLine);
  }
  
  const bottomLine = boxStyle.bottomLeft + boxStyle.horizontal.repeat(Math.max(0, width - 2)) + boxStyle.bottomRight;
  lines.push(bottomLine);
  
  return lines.join('\n');
}