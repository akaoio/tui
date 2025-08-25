/**
 * Flex justification logic
 */

import { FlexAlign, LayoutResult } from './types';

/**
 * Apply flex justification
 */
export function applyJustification(this: any, results: LayoutResult[],
  justify: FlexAlign,
  isRow: boolean,
  containerWidth: number,
  containerHeight: number): void {
  if (results.length === 0) return;
  
  const totalSize = isRow
    ? results[results.length - 1].x + results[results.length - 1].width - results[0].x
    : results[results.length - 1].y + results[results.length - 1].height - results[0].y;
  
  const availableSpace = isRow ? containerWidth : containerHeight;
  const extraSpace = availableSpace - totalSize;
  
  if (extraSpace <= 0) return;
  
  switch (justify) {
    case 'center':
      const offset = extraSpace / 2;
      results.forEach((r: any) => {
        if (isRow) {
          r.x += offset;
          r.contentX += offset;
        } else {
          r.y += offset;
          r.contentY += offset;
        }
      });
      break;
      
    case 'end':
      results.forEach((r: any) => {
        if (isRow) {
          r.x += extraSpace;
          r.contentX += extraSpace;
        } else {
          r.y += extraSpace;
          r.contentY += extraSpace;
        }
      });
      break;
      
    case 'space-between':
      if (results.length > 1) {
        const gap = extraSpace / (results.length - 1);
        results.forEach((r, i) => {
          const offset = gap * i;
          if (isRow) {
            r.x += offset;
            r.contentX += offset;
          } else {
            r.y += offset;
            r.contentY += offset;
          }
        });
      }
      break;
      
    case 'space-around':
      const gap = extraSpace / results.length;
      results.forEach((r, i) => {
        const offset = gap * (i + 0.5);
        if (isRow) {
          r.x += offset;
          r.contentX += offset;
        } else {
          r.y += offset;
          r.contentY += offset;
        }
      });
      break;
      
    case 'space-evenly':
      const evenGap = extraSpace / (results.length + 1);
      results.forEach((r, i) => {
        const offset = evenGap * (i + 1);
        if (isRow) {
          r.x += offset;
          r.contentX += offset;
        } else {
          r.y += offset;
          r.contentY += offset;
        }
      });
      break;
  }
}