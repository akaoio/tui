/**
 * Spacing utilities for Theme system
 */

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
export function parseSpacing(this: any, value: number | number[] | Spacing): Required<Spacing> {
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