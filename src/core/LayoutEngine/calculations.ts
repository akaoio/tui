/**
 * Layout calculation methods
 */

import { Box, ComputedBox, LayoutNode, Direction } from './types';

/**
 * Calculate content box from border box
 */
export function calculateContentBox(this: any, borderBox: Box,
  padding: number = 0,
  border: number = 0): Box {
  return {
    x: borderBox.x + border + padding,
    y: borderBox.y + border + padding,
    width: Math.max(0, borderBox.width - 2 * (border + padding)),
    height: Math.max(0, borderBox.height - 2 * (border + padding))
  };
}

/**
 * Calculate padding box from border box
 */
export function calculatePaddingBox(this: any, borderBox: Box, border: number = 0): Box {
  return {
    x: borderBox.x + border,
    y: borderBox.y + border,
    width: Math.max(0, borderBox.width - 2 * border),
    height: Math.max(0, borderBox.height - 2 * border)
  };
}

/**
 * Calculate margin box from border box
 */
export function calculateMarginBox(this: any, borderBox: Box, margin: number = 0): Box {
  return {
    x: borderBox.x - margin,
    y: borderBox.y - margin,
    width: borderBox.width + 2 * margin,
    height: borderBox.height + 2 * margin
  };
}

/**
 * Create computed box with all layout boxes
 */
export function createComputedBox(this: any, x: number,
  y: number,
  width: number,
  height: number,
  padding: number = 0,
  border: number = 0,
  margin: number = 0): ComputedBox {
  const borderBox: Box = { x, y, width, height };
  
  return {
    ...borderBox,
    borderBox,
    paddingBox: calculatePaddingBox(borderBox, border),
    contentBox: calculateContentBox(borderBox, padding, border),
    marginBox: calculateMarginBox(borderBox, margin)
  };
}

/**
 * Calculate flex layout
 */
export function calculateFlexLayout(this: any, container: Box,
  children: LayoutNode[],
  direction: Direction,
  gap: number = 0): void {
  if (children.length === 0) return;
  
  const isHorizontal = direction === Direction.HORIZONTAL;
  const mainSize = isHorizontal ? container.width : container.height;
  const crossSize = isHorizontal ? container.height : container.width;
  
  // Calculate total gap space
  const totalGap = gap * (children.length - 1);
  const availableMainSize = mainSize - totalGap;
  
  // Calculate flex items
  let totalFlex = 0;
  let totalFixed = 0;
  
  for (const child of children) {
    const flex = child.props?.flex || 0;
    if (flex > 0) {
      totalFlex += flex;
    } else {
      const fixedSize = isHorizontal 
        ? (child.props?.width || 0)
        : (child.props?.height || 0);
      totalFixed += fixedSize;
    }
  }
  
  // Calculate sizes
  const flexUnit = totalFlex > 0 
    ? (availableMainSize - totalFixed) / totalFlex 
    : 0;
  
  // Position children
  let mainPos = isHorizontal ? container.x : container.y;
  
  for (const child of children) {
    const flex = child.props?.flex || 0;
    
    let childMainSize: number;
    if (flex > 0) {
      childMainSize = flex * flexUnit;
    } else {
      childMainSize = isHorizontal 
        ? (child.props?.width || 0)
        : (child.props?.height || 0);
    }
    
    // Set computed box
    const x = isHorizontal ? mainPos : container.x;
    const y = isHorizontal ? container.y : mainPos;
    const width = isHorizontal ? childMainSize : crossSize;
    const height = isHorizontal ? crossSize : childMainSize;
    
    child.computed = createComputedBox(
      x, y, width, height,
      child.props?.style?.padding || 0,
      child.props?.border ? 1 : 0,
      child.props?.style?.margin || 0
    );
    
    mainPos += childMainSize + gap;
  }
}

/**
 * Calculate grid layout
 */
export function calculateGridLayout(this: any, container: Box,
  children: LayoutNode[],
  columns: number,
  rows: number,
  gap: number = 0): void {
  if (children.length === 0) return;
  
  const cellWidth = (container.width - gap * (columns - 1)) / columns;
  const cellHeight = (container.height - gap * (rows - 1)) / rows;
  
  let index = 0;
  for (let row = 0; row < rows && index < children.length; row++) {
    for (let col = 0; col < columns && index < children.length; col++) {
      const child = children[index++];
      
      const x = container.x + col * (cellWidth + gap);
      const y = container.y + row * (cellHeight + gap);
      
      child.computed = createComputedBox(
        x, y, cellWidth, cellHeight,
        child.props?.style?.padding || 0,
        child.props?.border ? 1 : 0,
        child.props?.style?.margin || 0
      );
    }
  }
}

/**
 * Calculate stack layout (vertical stacking)
 */
export function calculateStackLayout(this: any, container: Box,
  children: LayoutNode[],
  gap: number = 0): void {
  calculateFlexLayout(container, children, Direction.VERTICAL, gap);
}