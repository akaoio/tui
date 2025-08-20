/**
 * Theme System for TUI
 * Provides customizable colors, borders, spacing similar to CSS
 */

import { Color, BgColor } from '../utils/colors'

/**
 * Border style types
 */
export interface BorderStyle {
    topLeft: string
    topRight: string
    bottomLeft: string
    bottomRight: string
    horizontal: string
    vertical: string
    cross?: string
    horizontalDown?: string
    horizontalUp?: string
    verticalLeft?: string
    verticalRight?: string
}

/**
 * Predefined border styles
 */
export const BorderStyles = {
    none: {
        topLeft: ' ',
        topRight: ' ',
        bottomLeft: ' ',
        bottomRight: ' ',
        horizontal: ' ',
        vertical: ' '
    },
    single: {
        topLeft: '┌',
        topRight: '┐',
        bottomLeft: '└',
        bottomRight: '┘',
        horizontal: '─',
        vertical: '│',
        cross: '┼',
        horizontalDown: '┬',
        horizontalUp: '┴',
        verticalLeft: '├',
        verticalRight: '┤'
    },
    double: {
        topLeft: '╔',
        topRight: '╗',
        bottomLeft: '╚',
        bottomRight: '╝',
        horizontal: '═',
        vertical: '║',
        cross: '╬',
        horizontalDown: '╦',
        horizontalUp: '╩',
        verticalLeft: '╠',
        verticalRight: '╣'
    },
    rounded: {
        topLeft: '╭',
        topRight: '╮',
        bottomLeft: '╰',
        bottomRight: '╯',
        horizontal: '─',
        vertical: '│'
    },
    bold: {
        topLeft: '┏',
        topRight: '┓',
        bottomLeft: '┗',
        bottomRight: '┛',
        horizontal: '━',
        vertical: '┃',
        cross: '╋',
        horizontalDown: '┳',
        horizontalUp: '┻',
        verticalLeft: '┣',
        verticalRight: '┫'
    },
    ascii: {
        topLeft: '+',
        topRight: '+',
        bottomLeft: '+',
        bottomRight: '+',
        horizontal: '-',
        vertical: '|',
        cross: '+',
        horizontalDown: '+',
        horizontalUp: '+',
        verticalLeft: '+',
        verticalRight: '+'
    }
} as const

/**
 * Spacing configuration (like CSS box model)
 */
export interface Spacing {
    top?: number
    right?: number
    bottom?: number
    left?: number
}

/**
 * Parse spacing shorthand (like CSS)
 * Examples:
 * - 5 -> { top: 5, right: 5, bottom: 5, left: 5 }
 * - [5, 10] -> { top: 5, right: 10, bottom: 5, left: 10 }
 * - [5, 10, 15] -> { top: 5, right: 10, bottom: 15, left: 10 }
 * - [5, 10, 15, 20] -> { top: 5, right: 10, bottom: 15, left: 20 }
 */
export function parseSpacing(value: number | number[] | Spacing): Required<Spacing> {
    if (typeof value === 'number') {
        return { top: value, right: value, bottom: value, left: value }
    }
    
    if (Array.isArray(value)) {
        switch (value.length) {
            case 1:
                return { top: value[0], right: value[0], bottom: value[0], left: value[0] }
            case 2:
                return { top: value[0], right: value[1], bottom: value[0], left: value[1] }
            case 3:
                return { top: value[0], right: value[1], bottom: value[2], left: value[1] }
            case 4:
                return { top: value[0], right: value[1], bottom: value[2], left: value[3] }
            default:
                return { top: 0, right: 0, bottom: 0, left: 0 }
        }
    }
    
    return {
        top: value.top ?? 0,
        right: value.right ?? 0,
        bottom: value.bottom ?? 0,
        left: value.left ?? 0
    }
}

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

/**
 * Theme manager singleton
 */
export class ThemeManager {
    private static instance: ThemeManager
    private currentTheme: Theme
    private customThemes: Map<string, Theme> = new Map()
    
    private constructor() {
        this.currentTheme = Themes.default
    }
    
    static getInstance(): ThemeManager {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager()
        }
        return ThemeManager.instance
    }
    
    /**
     * Get current theme
     */
    getTheme(): Theme {
        return this.currentTheme
    }
    
    /**
     * Set theme by name or custom theme
     */
    setTheme(themeOrName: string | Theme): void {
        if (typeof themeOrName === 'string') {
            const theme = Themes[themeOrName] || this.customThemes.get(themeOrName)
            if (theme) {
                this.currentTheme = theme
            } else {
                throw new Error(`Theme "${themeOrName}" not found`)
            }
        } else {
            this.currentTheme = themeOrName
        }
    }
    
    /**
     * Register custom theme
     */
    registerTheme(theme: Theme): void {
        this.customThemes.set(theme.name, theme)
    }
    
    /**
     * Create theme from partial configuration
     */
    createTheme(name: string, partial: Partial<Theme>): Theme {
        const baseTheme = this.currentTheme
        const newTheme: Theme = {
            name,
            colors: { ...baseTheme.colors, ...partial.colors },
            borders: { ...baseTheme.borders, ...partial.borders },
            spacing: { ...baseTheme.spacing, ...partial.spacing },
            typography: { ...baseTheme.typography, ...partial.typography }
        }
        this.registerTheme(newTheme)
        return newTheme
    }
    
    /**
     * Get border style object
     */
    getBorderStyle(): BorderStyle {
        const { style } = this.currentTheme.borders
        if (typeof style === 'string') {
            return BorderStyles[style as keyof typeof BorderStyles] || BorderStyles.single
        }
        return style
    }
    
    /**
     * Get parsed padding
     */
    getPadding(): Required<Spacing> {
        return parseSpacing(this.currentTheme.spacing.padding)
    }
    
    /**
     * Get parsed margin
     */
    getMargin(): Required<Spacing> {
        return parseSpacing(this.currentTheme.spacing.margin)
    }
}