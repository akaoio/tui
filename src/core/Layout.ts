/**
 * Layout Engine for TUI
 * Provides flexbox-like and grid layouts for terminal UI
 */

import { Viewport, ResponsiveValue } from './Viewport'
import { Spacing, parseSpacing } from './Theme'

/**
 * Layout types
 */
export type LayoutType = 'flex' | 'grid' | 'absolute' | 'relative'

/**
 * Flex direction
 */
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'

/**
 * Flex alignment
 */
export type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'

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
    | 'quarter'                // 25% of parent

/**
 * Box model (like CSS)
 */
export interface BoxModel {
    width?: SizeUnit | ResponsiveValue<SizeUnit>
    height?: SizeUnit | ResponsiveValue<SizeUnit>
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    padding?: number | number[] | Spacing | ResponsiveValue<number | number[] | Spacing>
    margin?: number | number[] | Spacing | ResponsiveValue<number | number[] | Spacing>
    border?: boolean | 'all' | 'top' | 'right' | 'bottom' | 'left' | string[]
}

/**
 * Flex container properties
 */
export interface FlexContainer extends BoxModel {
    type: 'flex'
    direction?: FlexDirection | ResponsiveValue<FlexDirection>
    wrap?: boolean | ResponsiveValue<boolean>
    justify?: FlexAlign | ResponsiveValue<FlexAlign>
    align?: FlexAlign | ResponsiveValue<FlexAlign>
    gap?: number | ResponsiveValue<number>
}

/**
 * Flex item properties
 */
export interface FlexItem extends BoxModel {
    flex?: number | string  // flex-grow flex-shrink flex-basis
    order?: number
    alignSelf?: FlexAlign
}

/**
 * Grid container properties
 */
export interface GridContainer extends BoxModel {
    type: 'grid'
    columns?: number | string[] | ResponsiveValue<number | string[]>  // e.g., ['1fr', '2fr', '1fr']
    rows?: number | string[] | ResponsiveValue<number | string[]>
    gap?: number | [number, number] | ResponsiveValue<number | [number, number]>
    autoFlow?: 'row' | 'column' | 'dense'
}

/**
 * Grid item properties
 */
export interface GridItem extends BoxModel {
    column?: number | string  // e.g., '1 / 3' for span
    row?: number | string
    columnSpan?: number
    rowSpan?: number
}

/**
 * Absolute positioning
 */
export interface AbsolutePosition extends BoxModel {
    type: 'absolute'
    top?: number | string
    right?: number | string
    bottom?: number | string
    left?: number | string
    zIndex?: number
}

/**
 * Calculated layout result
 */
export interface LayoutResult {
    x: number
    y: number
    width: number
    height: number
    contentX: number      // After padding
    contentY: number
    contentWidth: number   // After padding
    contentHeight: number
    visible: boolean
    overflow: 'visible' | 'hidden' | 'scroll' | 'auto'
}

/**
 * Layout engine calculates positions and sizes
 */
export class LayoutEngine {
    private viewport: Viewport
    
    constructor() {
        this.viewport = Viewport.getInstance()
    }
    
    /**
     * Parse size unit to absolute value
     */
    private parseSize(
        size: SizeUnit,
        parentSize: number,
        totalFractions?: number,
        fractionUnit?: number
    ): number {
        if (typeof size === 'number') {
            return size
        }
        
        if (typeof size === 'string') {
            if (size === 'auto') {
                return -1  // Special value for auto
            }
            if (size === 'full') {
                return parentSize
            }
            if (size === 'half') {
                return Math.floor(parentSize / 2)
            }
            if (size === 'third') {
                return Math.floor(parentSize / 3)
            }
            if (size === 'quarter') {
                return Math.floor(parentSize / 4)
            }
            if (size.endsWith('%')) {
                const percent = parseFloat(size)
                return Math.floor(parentSize * (percent / 100))
            }
            if (size.endsWith('fr') && fractionUnit) {
                const fractions = parseFloat(size)
                return Math.floor(fractions * fractionUnit)
            }
        }
        
        return 0
    }
    
    /**
     * Calculate flex layout
     */
    calculateFlexLayout(
        container: FlexContainer,
        items: FlexItem[],
        parentWidth: number,
        parentHeight: number
    ): LayoutResult[] {
        const viewport = this.viewport
        const direction = viewport.getResponsiveValue(container.direction || 'row')
        const wrap = viewport.getResponsiveValue(container.wrap || false)
        const justify = viewport.getResponsiveValue(container.justify || 'start')
        const align = viewport.getResponsiveValue(container.align || 'stretch')
        const gap = viewport.getResponsiveValue(container.gap || 0)
        
        const isRow = direction === 'row' || direction === 'row-reverse'
        const isReverse = direction === 'row-reverse' || direction === 'column-reverse'
        
        // Calculate container dimensions
        const containerPadding = parseSpacing(viewport.getResponsiveValue(container.padding || 0))
        const containerMargin = parseSpacing(viewport.getResponsiveValue(container.margin || 0))
        
        const availableWidth = parentWidth - containerMargin.left - containerMargin.right
        const availableHeight = parentHeight - containerMargin.top - containerMargin.bottom
        
        const contentWidth = availableWidth - containerPadding.left - containerPadding.right
        const contentHeight = availableHeight - containerPadding.top - containerPadding.bottom
        
        const results: LayoutResult[] = []
        let currentX = containerMargin.left + containerPadding.left
        let currentY = containerMargin.top + containerPadding.top
        let lineHeight = 0
        let lineWidth = 0
        
        // Calculate item sizes
        items.forEach((item, index) => {
            const itemPadding = parseSpacing(viewport.getResponsiveValue(item.padding || 0))
            const itemMargin = parseSpacing(viewport.getResponsiveValue(item.margin || 0))
            
            let itemWidth = this.parseSize(
                viewport.getResponsiveValue(item.width || 'auto'),
                isRow ? contentWidth : contentHeight
            )
            
            let itemHeight = this.parseSize(
                viewport.getResponsiveValue(item.height || 'auto'),
                isRow ? contentHeight : contentWidth
            )
            
            // Auto sizing
            if (itemWidth === -1) {
                itemWidth = isRow ? Math.floor(contentWidth / items.length) : contentWidth
            }
            if (itemHeight === -1) {
                itemHeight = isRow ? contentHeight : Math.floor(contentHeight / items.length)
            }
            
            // Apply constraints
            if (item.minWidth) itemWidth = Math.max(itemWidth, item.minWidth)
            if (item.maxWidth) itemWidth = Math.min(itemWidth, item.maxWidth)
            if (item.minHeight) itemHeight = Math.max(itemHeight, item.minHeight)
            if (item.maxHeight) itemHeight = Math.min(itemHeight, item.maxHeight)
            
            // Check for wrap
            if (wrap && isRow && currentX + itemWidth > contentWidth) {
                currentX = containerMargin.left + containerPadding.left
                currentY += lineHeight + gap
                lineHeight = 0
            } else if (wrap && !isRow && currentY + itemHeight > contentHeight) {
                currentY = containerMargin.top + containerPadding.top
                currentX += lineWidth + gap
                lineWidth = 0
            }
            
            results.push({
                x: currentX + itemMargin.left,
                y: currentY + itemMargin.top,
                width: itemWidth - itemMargin.left - itemMargin.right,
                height: itemHeight - itemMargin.top - itemMargin.bottom,
                contentX: currentX + itemMargin.left + itemPadding.left,
                contentY: currentY + itemMargin.top + itemPadding.top,
                contentWidth: itemWidth - itemMargin.left - itemMargin.right - itemPadding.left - itemPadding.right,
                contentHeight: itemHeight - itemMargin.top - itemMargin.bottom - itemPadding.top - itemPadding.bottom,
                visible: true,
                overflow: 'hidden'
            })
            
            // Update position for next item
            if (isRow) {
                currentX += itemWidth + gap
                lineHeight = Math.max(lineHeight, itemHeight)
            } else {
                currentY += itemHeight + gap
                lineWidth = Math.max(lineWidth, itemWidth)
            }
        })
        
        // Apply justification
        this.applyJustification(results, justify, isRow, contentWidth, contentHeight)
        
        // Reverse if needed
        if (isReverse) {
            results.reverse()
        }
        
        return results
    }
    
    /**
     * Apply flex justification
     */
    private applyJustification(
        results: LayoutResult[],
        justify: FlexAlign,
        isRow: boolean,
        containerWidth: number,
        containerHeight: number
    ): void {
        if (results.length === 0) return
        
        const totalSize = isRow
            ? results[results.length - 1].x + results[results.length - 1].width - results[0].x
            : results[results.length - 1].y + results[results.length - 1].height - results[0].y
        
        const availableSpace = isRow ? containerWidth : containerHeight
        const extraSpace = availableSpace - totalSize
        
        if (extraSpace <= 0) return
        
        switch (justify) {
            case 'center':
                const offset = extraSpace / 2
                results.forEach(r => {
                    if (isRow) {
                        r.x += offset
                        r.contentX += offset
                    } else {
                        r.y += offset
                        r.contentY += offset
                    }
                })
                break
                
            case 'end':
                results.forEach(r => {
                    if (isRow) {
                        r.x += extraSpace
                        r.contentX += extraSpace
                    } else {
                        r.y += extraSpace
                        r.contentY += extraSpace
                    }
                })
                break
                
            case 'space-between':
                if (results.length > 1) {
                    const gap = extraSpace / (results.length - 1)
                    results.forEach((r, i) => {
                        const offset = gap * i
                        if (isRow) {
                            r.x += offset
                            r.contentX += offset
                        } else {
                            r.y += offset
                            r.contentY += offset
                        }
                    })
                }
                break
                
            case 'space-around':
                const gap = extraSpace / results.length
                results.forEach((r, i) => {
                    const offset = gap * (i + 0.5)
                    if (isRow) {
                        r.x += offset
                        r.contentX += offset
                    } else {
                        r.y += offset
                        r.contentY += offset
                    }
                })
                break
                
            case 'space-evenly':
                const evenGap = extraSpace / (results.length + 1)
                results.forEach((r, i) => {
                    const offset = evenGap * (i + 1)
                    if (isRow) {
                        r.x += offset
                        r.contentX += offset
                    } else {
                        r.y += offset
                        r.contentY += offset
                    }
                })
                break
        }
    }
    
    /**
     * Calculate grid layout
     */
    calculateGridLayout(
        container: GridContainer,
        items: GridItem[],
        parentWidth: number,
        parentHeight: number
    ): LayoutResult[] {
        const viewport = this.viewport
        const columns = viewport.getResponsiveValue(container.columns || 1)
        const rows = viewport.getResponsiveValue(container.rows || 'auto')
        const gap = viewport.getResponsiveValue(container.gap || 0)
        
        const containerPadding = parseSpacing(viewport.getResponsiveValue(container.padding || 0))
        const containerMargin = parseSpacing(viewport.getResponsiveValue(container.margin || 0))
        
        const availableWidth = parentWidth - containerMargin.left - containerMargin.right
        const availableHeight = parentHeight - containerMargin.top - containerMargin.bottom
        
        const contentWidth = availableWidth - containerPadding.left - containerPadding.right
        const contentHeight = availableHeight - containerPadding.top - containerPadding.bottom
        
        // Calculate column widths
        const numCols = typeof columns === 'number' ? columns : columns.length
        const [colGap, rowGap] = Array.isArray(gap) ? gap : [gap, gap]
        const colWidth = Math.floor((contentWidth - (numCols - 1) * colGap) / numCols)
        
        // Calculate row heights
        const numRows = Math.ceil(items.length / numCols)
        const rowHeight = Math.floor((contentHeight - (numRows - 1) * rowGap) / numRows)
        
        const results: LayoutResult[] = []
        
        items.forEach((item, index) => {
            const col = index % numCols
            const row = Math.floor(index / numCols)
            
            const x = containerMargin.left + containerPadding.left + col * (colWidth + colGap)
            const y = containerMargin.top + containerPadding.top + row * (rowHeight + rowGap)
            
            results.push({
                x,
                y,
                width: colWidth,
                height: rowHeight,
                contentX: x,
                contentY: y,
                contentWidth: colWidth,
                contentHeight: rowHeight,
                visible: true,
                overflow: 'hidden'
            })
        })
        
        return results
    }
}