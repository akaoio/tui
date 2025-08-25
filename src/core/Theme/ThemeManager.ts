/**
 * Theme manager singleton
 */

import { Theme, Themes } from './themes';
import { BorderStyle, BorderStyles } from './borderStyles';
import { Spacing, parseSpacing } from './spacing';

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