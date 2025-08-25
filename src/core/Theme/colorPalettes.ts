/**
 * Color palette definitions for Theme system
 */

import { Color, BgColor } from '../../utils/colors'

/**
 * Color palette
 */
export interface ColorPalette {
    primary: Color | string
    secondary: Color | string
    success: Color | string
    warning: Color | string
    error: Color | string
    info: Color | string
    text: Color | string
    textMuted: Color | string
    background?: BgColor | string
    border: Color | string
}

/**
 * Default color palettes
 */
export const ColorPalettes = {
    default: {
        primary: Color.Cyan,
        secondary: Color.Magenta,
        success: Color.Green,
        warning: Color.Yellow,
        error: Color.Red,
        info: Color.Blue,
        text: Color.White,
        textMuted: Color.BrightBlack,
        border: Color.BrightBlack
    },
    dark: {
        primary: Color.Blue,
        secondary: Color.Magenta,
        success: Color.Green,
        warning: Color.Yellow,
        error: Color.Red,
        info: Color.Cyan,
        text: Color.BrightWhite,
        textMuted: Color.White,
        border: Color.BrightBlack
    },
    light: {
        primary: Color.Blue,
        secondary: Color.Magenta,
        success: Color.Green,
        warning: Color.Yellow,
        error: Color.Red,
        info: Color.Cyan,
        text: Color.Black,
        textMuted: Color.BrightBlack,
        border: Color.Black
    },
    ocean: {
        primary: '#00B4D8',
        secondary: '#0077B6',
        success: '#90E0EF',
        warning: '#FFB700',
        error: '#FF006E',
        info: '#CAF0F8',
        text: '#03045E',
        textMuted: '#0077B6',
        border: '#00B4D8'
    },
    forest: {
        primary: '#52B788',
        secondary: '#40916C',
        success: '#95D5B2',
        warning: '#F77F00',
        error: '#D62828',
        info: '#2D6A4F',
        text: '#081C15',
        textMuted: '#1B4332',
        border: '#40916C'
    }
} as const