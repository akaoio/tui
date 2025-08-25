/**
 * Layout and style types for MetaSchema
 */

import { MetaSchema, ReactiveValue } from './primitiveTypes';

/**
 * Style schema - reactive styles
 */
export interface StyleSchema extends MetaSchema {
  $type: 'style';
  
  // Base styles
  color?: string | ReactiveValue<string>;
  background?: string | ReactiveValue<string>;
  border?: BorderSchema | ReactiveValue<BorderSchema>;
  padding?: number | number[] | ReactiveValue<number[]>;
  margin?: number | number[] | ReactiveValue<number[]>;
  
  // Positioning
  position?: 'static' | 'absolute' | 'relative' | 'fixed' | ReactiveValue<string>;
  x?: number | string | ReactiveValue<number>;
  y?: number | string | ReactiveValue<number>;
  width?: number | string | ReactiveValue<number>;
  height?: number | string | ReactiveValue<number>;
  
  // Flexbox-like
  display?: 'block' | 'flex' | 'grid' | 'none' | ReactiveValue<string>;
  flexDirection?: 'row' | 'column' | ReactiveValue<string>;
  justifyContent?: string | ReactiveValue<string>;
  alignItems?: string | ReactiveValue<string>;
  
  // Responsive
  breakpoints?: Record<string, Partial<StyleSchema>>;
  
  // Animations
  transitions?: TransitionSchema[];
  animations?: AnimationSchema[];
  
  // Pseudo-states
  hover?: Partial<StyleSchema>;
  focus?: Partial<StyleSchema>;
  active?: Partial<StyleSchema>;
  disabled?: Partial<StyleSchema>;
}

/**
 * Layout schema - defines component arrangement
 */
export interface LayoutSchema extends MetaSchema {
  $type: 'layout';
  
  type: 'flex' | 'grid' | 'absolute' | 'stack' | 'dock' | 'split';
  
  // Flex layout
  direction?: 'row' | 'column' | ReactiveValue<string>;
  wrap?: boolean | ReactiveValue<boolean>;
  gap?: number | ReactiveValue<number>;
  
  // Grid layout
  columns?: number | string | ReactiveValue<number>;
  rows?: number | string | ReactiveValue<number>;
  areas?: string[][] | ReactiveValue<string[][]>;
  
  // Alignment
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  // Constraints
  minWidth?: number | ReactiveValue<number>;
  maxWidth?: number | ReactiveValue<number>;
  minHeight?: number | ReactiveValue<number>;
  maxHeight?: number | ReactiveValue<number>;
}

/**
 * Border schema
 */
export interface BorderSchema {
  style?: 'single' | 'double' | 'rounded' | 'bold' | 'ascii' | 'none';
  color?: string;
  width?: number;
}

/**
 * Transition schema
 */
export interface TransitionSchema {
  property?: string | string[];
  duration?: number;
  easing?: string;
  delay?: number;
}

/**
 * Animation schema
 */
export interface AnimationSchema {
  name?: string;
  keyframes?: Record<string, Partial<StyleSchema>>;
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}