/**
 * Types and interfaces for VirtualCursor
 */

export interface CursorPosition {
  x: number
  y: number
}

export interface CursorBounds {
  width: number
  height: number
}

export interface CursorStyle {
  char: string
  style: string
}