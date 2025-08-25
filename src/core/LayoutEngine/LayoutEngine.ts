/**
 * LayoutEngine - Main class for layout calculations
 */

import { 
  Box, 
  ComputedBox, 
  LayoutNode, 
  LayoutConstraints,
  Direction,
  Alignment,
  JustifyContent 
} from './types';
import {
  createComputedBox,
  calculateFlexLayout,
  calculateGridLayout,
  calculateStackLayout
} from './calculations';

/**
 * LayoutEngine - Handles all layout calculations
 */
export class LayoutEngine {
  private static instance: LayoutEngine;
  private rootBox: Box = { x: 0, y: 0, width: 80, height: 24 };
  
  /**
   * Get singleton instance
   */
  static getInstance(): LayoutEngine {
    if (!LayoutEngine.instance) {
      LayoutEngine.instance = new LayoutEngine();
    }
    return LayoutEngine.instance;
  }

  /**
   * Update root dimensions
   */
  updateDimensions(width: number, height: number): void {
    this.rootBox = { x: 0, y: 0, width, height };
  }

  /**
   * Compute layout tree with proper box model
   */
  computeLayout(node: LayoutNode, parentBox: Box = this.rootBox): ComputedBox {
    this.calculateLayout(node, {
      width: parentBox.width,
      height: parentBox.height
    });
    return node.computed || createComputedBox(0, 0, 0, 0, 0, 0, 0);
  }
  
  /**
   * Calculate layout for a tree of nodes
   */
  calculateLayout(
    root: LayoutNode,
    constraints: LayoutConstraints
  ): void {
    const width = constraints.width || 80;
    const height = constraints.height || 24;
    
    // Set root computed box
    root.computed = createComputedBox(
      0, 0, width, height,
      root.props?.style?.padding || 0,
      root.props?.border ? 1 : 0,
      root.props?.style?.margin || 0
    );
    
    // Recursively calculate children
    this.calculateChildren(root);
  }
  
  /**
   * Calculate children layout based on parent layout type
   */
  private calculateChildren(node: LayoutNode): void {
    if (!node.children || node.children.length === 0) return;
    if (!node.computed) return;
    
    const layoutType = node.props?.layout || 'stack';
    const container = node.computed.contentBox;
    const gap = node.props?.gap || 0;
    
    switch (layoutType) {
      case 'flex':
        this.calculateFlex(container, node.children, node.props);
        break;
      
      case 'grid':
        this.calculateGrid(container, node.children, node.props);
        break;
      
      case 'absolute':
        this.calculateAbsolute(container, node.children);
        break;
      
      case 'stack':
      default:
        calculateStackLayout(container, node.children, gap);
        break;
    }
    
    // Recursively calculate children's children
    for (const child of node.children) {
      this.calculateChildren(child);
    }
  }
  
  /**
   * Calculate flex layout with alignment
   */
  private calculateFlex(
    container: Box,
    children: LayoutNode[],
    props: any
  ): void {
    const direction = props?.direction || Direction.HORIZONTAL;
    const gap = props?.gap || 0;
    
    calculateFlexLayout(container, children, direction, gap);
    
    // Apply alignment
    const align = props?.align || Alignment.START;
    const justify = props?.justify || JustifyContent.START;
    
    this.applyAlignment(container, children, direction, align, justify);
  }
  
  /**
   * Calculate grid layout
   */
  private calculateGrid(
    container: Box,
    children: LayoutNode[],
    props: any
  ): void {
    const columns = props?.columns || 1;
    const rows = props?.rows || Math.ceil(children.length / columns);
    const gap = props?.gap || 0;
    
    calculateGridLayout(container, children, columns, rows, gap);
  }
  
  /**
   * Calculate absolute positioning
   */
  private calculateAbsolute(
    container: Box,
    children: LayoutNode[]
  ): void {
    for (const child of children) {
      const position = child.props?.position || {};
      const x = container.x + (position.x || 0);
      const y = container.y + (position.y || 0);
      const width = position.width || container.width;
      const height = position.height || container.height;
      
      child.computed = createComputedBox(
        x, y, width, height,
        child.props?.style?.padding || 0,
        child.props?.border ? 1 : 0,
        child.props?.style?.margin || 0
      );
    }
  }
  
  /**
   * Apply alignment to flex items
   */
  private applyAlignment(
    container: Box,
    children: LayoutNode[],
    direction: Direction,
    align: Alignment,
    justify: JustifyContent
  ): void {
    const isHorizontal = direction === Direction.HORIZONTAL;
    
    // Apply justify content (main axis)
    this.applyJustifyContent(container, children, isHorizontal, justify);
    
    // Apply align items (cross axis)
    this.applyAlignItems(container, children, isHorizontal, align);
  }
  
  /**
   * Apply justify content alignment
   */
  private applyJustifyContent(
    container: Box,
    children: LayoutNode[],
    isHorizontal: boolean,
    justify: JustifyContent
  ): void {
    if (children.length === 0) return;
    
    const mainSize = isHorizontal ? container.width : container.height;
    let totalSize = 0;
    
    // Calculate total size
    for (const child of children) {
      if (!child.computed) continue;
      totalSize += isHorizontal 
        ? child.computed.width 
        : child.computed.height;
    }
    
    const freeSpace = mainSize - totalSize;
    
    switch (justify) {
      case JustifyContent.CENTER:
        this.offsetChildren(children, isHorizontal, freeSpace / 2);
        break;
      
      case JustifyContent.END:
        this.offsetChildren(children, isHorizontal, freeSpace);
        break;
      
      case JustifyContent.SPACE_BETWEEN:
        if (children.length > 1) {
          this.distributeChildren(
            children, 
            isHorizontal, 
            freeSpace / (children.length - 1),
            0
          );
        }
        break;
      
      case JustifyContent.SPACE_AROUND:
        this.distributeChildren(
          children,
          isHorizontal,
          freeSpace / children.length,
          freeSpace / (children.length * 2)
        );
        break;
      
      case JustifyContent.SPACE_EVENLY:
        this.distributeChildren(
          children,
          isHorizontal,
          freeSpace / (children.length + 1),
          freeSpace / (children.length + 1)
        );
        break;
    }
  }
  
  /**
   * Apply align items alignment
   */
  private applyAlignItems(
    container: Box,
    children: LayoutNode[],
    isHorizontal: boolean,
    align: Alignment
  ): void {
    const crossSize = isHorizontal ? container.height : container.width;
    
    for (const child of children) {
      if (!child.computed) continue;
      
      const childCrossSize = isHorizontal 
        ? child.computed.height 
        : child.computed.width;
      
      let offset = 0;
      
      switch (align) {
        case Alignment.CENTER:
          offset = (crossSize - childCrossSize) / 2;
          break;
        
        case Alignment.END:
          offset = crossSize - childCrossSize;
          break;
        
        case Alignment.STRETCH:
          // Stretch to fill cross axis
          if (isHorizontal) {
            child.computed.height = crossSize;
            child.computed.borderBox.height = crossSize;
          } else {
            child.computed.width = crossSize;
            child.computed.borderBox.width = crossSize;
          }
          continue;
      }
      
      // Apply offset
      if (isHorizontal) {
        child.computed.y += offset;
        child.computed.borderBox.y += offset;
      } else {
        child.computed.x += offset;
        child.computed.borderBox.x += offset;
      }
    }
  }
  
  /**
   * Offset children by a fixed amount
   */
  private offsetChildren(
    children: LayoutNode[],
    isHorizontal: boolean,
    offset: number
  ): void {
    for (const child of children) {
      if (!child.computed) continue;
      
      if (isHorizontal) {
        child.computed.x += offset;
        child.computed.borderBox.x += offset;
      } else {
        child.computed.y += offset;
        child.computed.borderBox.y += offset;
      }
    }
  }
  
  /**
   * Distribute children with spacing
   */
  private distributeChildren(
    children: LayoutNode[],
    isHorizontal: boolean,
    spacing: number,
    initialOffset: number
  ): void {
    let currentOffset = initialOffset;
    
    for (const child of children) {
      if (!child.computed) continue;
      
      if (isHorizontal) {
        child.computed.x += currentOffset;
        child.computed.borderBox.x += currentOffset;
        currentOffset += spacing;
      } else {
        child.computed.y += currentOffset;
        child.computed.borderBox.y += currentOffset;
        currentOffset += spacing;
      }
    }
  }
}