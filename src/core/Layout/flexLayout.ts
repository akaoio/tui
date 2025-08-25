/**
 * Flex layout calculation logic
 */

import { Viewport } from '../Viewport';
import { parseSpacing } from '../Theme';
import { FlexContainer, FlexItem, LayoutResult } from './types';
import { parseSize } from './sizeParser';
import { applyJustification } from './justification';

/**
 * Calculate flex layout
 */
export function calculateFlexLayout(this: any, container: FlexContainer,
  items: FlexItem[],
  parentWidth: number,
  parentHeight: number,
  viewport: Viewport): LayoutResult[] {
  const direction = viewport.getResponsiveValue(container.direction || 'row');
  const wrap = viewport.getResponsiveValue(container.wrap || false);
  const justify = viewport.getResponsiveValue(container.justify || 'start');
  const align = viewport.getResponsiveValue(container.align || 'stretch');
  const gap = viewport.getResponsiveValue(container.gap || 0);
  
  const isRow = direction === 'row' || direction === 'row-reverse';
  const isReverse = direction === 'row-reverse' || direction === 'column-reverse';
  
  // Calculate container dimensions
  const containerPadding = parseSpacing(viewport.getResponsiveValue(container.padding || 0));
  const containerMargin = parseSpacing(viewport.getResponsiveValue(container.margin || 0));
  
  const availableWidth = parentWidth - containerMargin.left - containerMargin.right;
  const availableHeight = parentHeight - containerMargin.top - containerMargin.bottom;
  
  const contentWidth = availableWidth - containerPadding.left - containerPadding.right;
  const contentHeight = availableHeight - containerPadding.top - containerPadding.bottom;
  
  const results: LayoutResult[] = [];
  let currentX = containerMargin.left + containerPadding.left;
  let currentY = containerMargin.top + containerPadding.top;
  let lineHeight = 0;
  let lineWidth = 0;
  
  // Calculate item sizes
  items.forEach((item, index) => {
    const itemPadding = parseSpacing(viewport.getResponsiveValue(item.padding || 0));
    const itemMargin = parseSpacing(viewport.getResponsiveValue(item.margin || 0));
    
    let itemWidth = parseSize(
      viewport.getResponsiveValue(item.width || 'auto'),
      isRow ? contentWidth : contentHeight
    );
    
    let itemHeight = parseSize(
      viewport.getResponsiveValue(item.height || 'auto'),
      isRow ? contentHeight : contentWidth
    );
    
    // Auto sizing
    if (itemWidth === -1) {
      itemWidth = isRow ? Math.floor(contentWidth / items.length) : contentWidth;
    }
    if (itemHeight === -1) {
      itemHeight = isRow ? contentHeight : Math.floor(contentHeight / items.length);
    }
    
    // Apply constraints
    if (item.minWidth) itemWidth = Math.max(itemWidth, item.minWidth);
    if (item.maxWidth) itemWidth = Math.min(itemWidth, item.maxWidth);
    if (item.minHeight) itemHeight = Math.max(itemHeight, item.minHeight);
    if (item.maxHeight) itemHeight = Math.min(itemHeight, item.maxHeight);
    
    // Check for wrap
    if (wrap && isRow && currentX + itemWidth > contentWidth) {
      currentX = containerMargin.left + containerPadding.left;
      currentY += lineHeight + gap;
      lineHeight = 0;
    } else if (wrap && !isRow && currentY + itemHeight > contentHeight) {
      currentY = containerMargin.top + containerPadding.top;
      currentX += lineWidth + gap;
      lineWidth = 0;
    }
    
    results.push({
      x: currentX + itemMargin.left,
      y: currentY + itemMargin.top,
      width: itemWidth - itemMargin.left - itemMargin.right,
      height: itemHeight - itemMargin.top - itemMargin.bottom,
      contentX: currentX + itemMargin.left + itemPadding.left,
      contentY: currentY + itemMargin.top + itemPadding.top,
      contentWidth: itemWidth - itemMargin.left - itemMargin.right - itemPadding.left - itemPadding.right,
      contentHeight: itemHeight - itemMargin.top - itemMargin.bottom - itemPadding.top - itemPadding.bottom,
      visible: true,
      overflow: 'hidden'
    });
    
    // Update position for next item
    if (isRow) {
      currentX += itemWidth + gap;
      lineHeight = Math.max(lineHeight, itemHeight);
    } else {
      currentY += itemHeight + gap;
      lineWidth = Math.max(lineWidth, itemWidth);
    }
  });
  
  // Apply justification
  applyJustification(results, justify, isRow, contentWidth, contentHeight);
  
  // Reverse if needed
  if (isReverse) {
    results.reverse();
  }
  
  return results;
}