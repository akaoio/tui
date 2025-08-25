/**
 * Layout Engine - Main class for layout calculations
 */

import { Viewport } from '../Viewport';
import { FlexContainer, FlexItem, GridContainer, GridItem, LayoutResult } from './types';
import { calculateFlexLayout } from './flexLayout';
import { calculateGridLayout } from './gridLayout';

/**
 * Layout engine calculates positions and sizes
 */
export class LayoutEngine {
  private viewport: Viewport;
  
  constructor() {
    this.viewport = Viewport.getInstance();
  }
  
  /**
   * Calculate flex layout
   */
  calculateFlexLayout(
    container: FlexContainer,
    items: FlexItem[],
    parentWidth: number,
    parentHeight: number
  ): LayoutResult[] {
    return calculateFlexLayout(container, items, parentWidth, parentHeight, this.viewport);
  }
  
  /**
   * Calculate grid layout
   */
  calculateGridLayout(
    container: GridContainer,
    items: GridItem[],
    parentWidth: number,
    parentHeight: number
  ): LayoutResult[] {
    return calculateGridLayout(container, items, parentWidth, parentHeight, this.viewport);
  }
}