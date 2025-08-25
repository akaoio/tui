/**
 * Types and interfaces for LayoutEngine
 */

/**
 * Box model for layout calculations
 */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Computed box with all layout properties
 */
export interface ComputedBox extends Box {
  contentBox: Box;
  paddingBox: Box;
  borderBox: Box;
  marginBox: Box;
}

/**
 * Layout node representing a component in the layout tree
 */
export interface LayoutNode {
  type: string;
  props?: any;
  children?: LayoutNode[];
  computed?: ComputedBox;
}

/**
 * Layout constraints
 */
export interface LayoutConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  width?: number;
  height?: number;
  flex?: number;
}

/**
 * Layout direction
 */
export enum Direction {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
}

/**
 * Alignment options
 */
export enum Alignment {
  START = 'start',
  CENTER = 'center',
  END = 'end',
  STRETCH = 'stretch'
}

/**
 * Justify content options
 */
export enum JustifyContent {
  START = 'start',
  CENTER = 'center',
  END = 'end',
  SPACE_BETWEEN = 'space-between',
  SPACE_AROUND = 'space-around',
  SPACE_EVENLY = 'space-evenly'
}