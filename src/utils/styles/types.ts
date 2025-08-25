/**
 * Style types and enums
 */

export enum Style {
  Reset = 0,
  Bold = 1,
  Dim = 2,
  Italic = 3,
  Underline = 4,
  Blink = 5,
  Reverse = 7,
  Hidden = 8,
  Strikethrough = 9,
}

export interface BoxStyle {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
  cross: string;
  horizontalDown: string;
  horizontalUp: string;
  verticalLeft: string;
  verticalRight: string;
}