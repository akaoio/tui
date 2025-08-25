/**
 * Layout types and interfaces
 */

import { Viewport, ResponsiveValue } from '../Viewport';
import { Spacing } from '../Theme';

/**
 * Layout types
 */
export type LayoutType = 'flex' | 'grid' | 'absolute' | 'relative';

/**
 * Flex direction
 */
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

/**
 * Flex alignment
 */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly';

/**
 * Size units
 */
export type SizeUnit = 
  | number                    // Absolute size in characters
  | `${number}%`             // Percentage of parent
  | `${number}fr`            // Fraction unit (like CSS grid)
  | 'auto'                   // Automatic sizing
  | 'full'                   // 100% of parent
  | 'half'                   // 50% of parent
  | 'third'                  // 33.33% of parent
  | 'quarter';               // 25% of parent

/**
 * Box model (like CSS)
 */
export interface BoxModel {
  width?: SizeUnit | ResponsiveValue<SizeUnit>;
  height?: SizeUnit | ResponsiveValue<SizeUnit>;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  padding?: number | number[] | Spacing | ResponsiveValue<number | number[] | Spacing>;
  margin?: number | number[] | Spacing | ResponsiveValue<number | number[] | Spacing>;
  border?: boolean | 'all' | 'top' | 'right' | 'bottom' | 'left' | string[];
}

/**
 * Flex container properties
 */
export interface FlexContainer extends BoxModel {
  type: 'flex';
  direction?: FlexDirection | ResponsiveValue<FlexDirection>;
  wrap?: boolean | ResponsiveValue<boolean>;
  justify?: FlexAlign | ResponsiveValue<FlexAlign>;
  align?: FlexAlign | ResponsiveValue<FlexAlign>;
  gap?: number | ResponsiveValue<number>;
}

/**
 * Flex item properties
 */
export interface FlexItem extends BoxModel {
  flex?: number | string;  // flex-grow flex-shrink flex-basis
  order?: number;
  alignSelf?: FlexAlign;
}

/**
 * Grid container properties
 */
export interface GridContainer extends BoxModel {
  type: 'grid';
  columns?: number | string[] | ResponsiveValue<number | string[]>;  // e.g., ['1fr', '2fr', '1fr']
  rows?: number | string[] | ResponsiveValue<number | string[]>;
  gap?: number | [number, number] | ResponsiveValue<number | [number, number]>;
  autoFlow?: 'row' | 'column' | 'dense';
}

/**
 * Grid item properties
 */
export interface GridItem extends BoxModel {
  column?: number | string;  // e.g., '1 / 3' for span
  row?: number | string;
  columnSpan?: number;
  rowSpan?: number;
}

/**
 * Absolute positioning
 */
export interface AbsolutePosition extends BoxModel {
  type: 'absolute';
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;
}

/**
 * Calculated layout result
 */
export interface LayoutResult {
  x: number;
  y: number;
  width: number;
  height: number;
  contentX: number;      // After padding
  contentY: number;
  contentWidth: number;   // After padding
  contentHeight: number;
  visible: boolean;
  overflow: 'visible' | 'hidden' | 'scroll' | 'auto';
}