/**
 * Draw box helper method
 */

import { RenderContext } from './types'
import { Region } from '../ScreenManager/index'

export function drawBox(this: any, context: RenderContext, region: Region, style: string = 'single'): void {
  // Simple box drawing implementation
  const x = context.region.x + region.x;
  const y = context.region.y + region.y;
  const { width, height } = region;
  
  // Draw simple ASCII box
  const topLeft = '┌';
  const topRight = '┐';
  const bottomLeft = '└';
  const bottomRight = '┘';
  const horizontal = '─';
  const vertical = '│';
  
  // Top line
  let topLine = topLeft + horizontal.repeat(width - 2) + topRight;
  context.screen.write(topLine, x, y);
  
  // Side lines
  for (let i = 1; i < height - 1; i++) {
    context.screen.write(vertical, x, y + i);
    context.screen.write(vertical, x + width - 1, y + i);
  }
  
  // Bottom line
  let bottomLine = bottomLeft + horizontal.repeat(width - 2) + bottomRight;
  context.screen.write(bottomLine, x, y + height - 1);
}