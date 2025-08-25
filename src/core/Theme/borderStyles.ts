/**
 * Border style definitions for Theme system
 */

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