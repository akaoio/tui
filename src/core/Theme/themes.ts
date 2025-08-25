/**
 * Theme definitions and interfaces
 */

import { BorderStyle, BorderStyles } from './borderStyles';
import { Spacing } from './spacing';
import { ColorPalette, ColorPalettes } from './colorPalettes';

/**
 * Theme configuration
 */
export interface Theme {
    name: string
    colors: ColorPalette
    borders: {
        style: BorderStyle | keyof typeof BorderStyles
        radius?: number // For future rounded corners support
    }
    spacing: {
        padding: number | number[] | Spacing
        margin: number | number[] | Spacing
        gap?: number // Space between elements
    }
    typography?: {
        bold?: boolean
        italic?: boolean
        underline?: boolean
    }
}

/**
 * Default themes
 */
export const Themes: Record<string, Theme> = {
    default: {
        name: 'default',
        colors: ColorPalettes.default,
        borders: {
            style: 'single'
        },
        spacing: {
            padding: 1,
            margin: 0,
            gap: 1
        }
    },
    minimal: {
        name: 'minimal',
        colors: ColorPalettes.default,
        borders: {
            style: 'none'
        },
        spacing: {
            padding: 0,
            margin: 0,
            gap: 0
        }
    },
    modern: {
        name: 'modern',
        colors: ColorPalettes.dark,
        borders: {
            style: 'rounded'
        },
        spacing: {
            padding: [1, 2],
            margin: 1,
            gap: 1
        }
    },
    bold: {
        name: 'bold',
        colors: ColorPalettes.dark,
        borders: {
            style: 'double'
        },
        spacing: {
            padding: 2,
            margin: 1,
            gap: 2
        },
        typography: {
            bold: true
        }
    },
    ocean: {
        name: 'ocean',
        colors: ColorPalettes.ocean,
        borders: {
            style: 'rounded'
        },
        spacing: {
            padding: [1, 2],
            margin: 0,
            gap: 1
        }
    },
    forest: {
        name: 'forest',
        colors: ColorPalettes.forest,
        borders: {
            style: 'bold'
        },
        spacing: {
            padding: [1, 2],
            margin: 0,
            gap: 1
        }
    }
}