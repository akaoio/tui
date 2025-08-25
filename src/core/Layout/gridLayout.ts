/**
 * Grid layout calculation logic
 */

import { Viewport } from '../Viewport';
import { parseSpacing } from '../Theme';
import { GridContainer, GridItem, LayoutResult } from './types';

/**
 * Calculate grid layout
 */
export function calculateGridLayout(this: any, container: GridContainer,
  items: GridItem[],
  parentWidth: number,
  parentHeight: number,
  viewport: Viewport): LayoutResult[] {
  const columns = viewport.getResponsiveValue(container.columns || 1);
  const rows = viewport.getResponsiveValue(container.rows || 'auto');
  const gap = viewport.getResponsiveValue(container.gap || 0);
  
  const containerPadding = parseSpacing(viewport.getResponsiveValue(container.padding || 0));
  const containerMargin = parseSpacing(viewport.getResponsiveValue(container.margin || 0));
  
  const availableWidth = parentWidth - containerMargin.left - containerMargin.right;
  const availableHeight = parentHeight - containerMargin.top - containerMargin.bottom;
  
  const contentWidth = availableWidth - containerPadding.left - containerPadding.right;
  const contentHeight = availableHeight - containerPadding.top - containerPadding.bottom;
  
  // Calculate column widths
  const numCols = typeof columns === 'number' ? columns : columns.length;
  const [colGap, rowGap] = Array.isArray(gap) ? gap : [gap, gap];
  const colWidth = Math.floor((contentWidth - (numCols - 1) * colGap) / numCols);
  
  // Calculate row heights
  const numRows = Math.ceil(items.length / numCols);
  const rowHeight = Math.floor((contentHeight - (numRows - 1) * rowGap) / numRows);
  
  const results: LayoutResult[] = [];
  
  items.forEach((item, index) => {
    const col = index % numCols;
    const row = Math.floor(index / numCols);
    
    const x = containerMargin.left + containerPadding.left + col * (colWidth + colGap);
    const y = containerMargin.top + containerPadding.top + row * (rowHeight + rowGap);
    
    results.push({
      x,
      y,
      width: colWidth,
      height: rowHeight,
      contentX: x,
      contentY: y,
      contentWidth: colWidth,
      contentHeight: rowHeight,
      visible: true,
      overflow: 'hidden'
    });
  });
  
  return results;
}