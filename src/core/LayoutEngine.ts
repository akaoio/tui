import { EventEmitter } from 'events'

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface LayoutNode {
  type: string
  props?: any
  children?: LayoutNode[]
  computed?: ComputedBox
  $ref?: string
}

export interface ComputedBox extends Box {
  contentBox: Box      // Inner content area
  paddingBox: Box      // Content + padding
  borderBox: Box       // Content + padding + border
  marginBox: Box       // Content + padding + border + margin
}

export class LayoutEngine extends EventEmitter {
  private rootBox: Box
  
  constructor(width: number, height: number) {
    super()
    this.rootBox = { x: 0, y: 0, width, height }
  }
  
  /**
   * Compute layout tree with proper box model
   */
  computeLayout(node: LayoutNode, parentBox: Box = this.rootBox): ComputedBox {
    const props = node.props || {}
    
    // Extract spacing properties (like CSS)
    // Padding can be in props.padding or props.style.padding
    const margin = this.parseSpacing(props.margin, 0)
    const padding = this.parseSpacing(props.style?.padding || props.padding, 0) 
    const border = (props.style?.border || props.border) ? 1 : 0
    
    // Calculate available space after margins
    const marginBox: Box = {
      x: parentBox.x + margin.left,
      y: parentBox.y + margin.top,
      width: parentBox.width - margin.left - margin.right,
      height: parentBox.height - margin.top - margin.bottom
    }
    
    // Border box is margin box minus border thickness
    const borderBox: Box = {
      x: marginBox.x,
      y: marginBox.y,
      width: marginBox.width,
      height: marginBox.height
    }
    
    // Padding box is inside the border
    const paddingBox: Box = {
      x: borderBox.x + border,
      y: borderBox.y + border,
      width: Math.max(0, borderBox.width - (border * 2)),
      height: Math.max(0, borderBox.height - (border * 2))
    }
    
    // Content box is inside padding
    const contentBox: Box = {
      x: paddingBox.x + padding.left,
      y: paddingBox.y + padding.top,
      width: Math.max(0, paddingBox.width - padding.left - padding.right),
      height: Math.max(0, paddingBox.height - padding.top - padding.bottom)
    }
    
    // Store computed layout
    const computed: ComputedBox = {
      x: borderBox.x,
      y: borderBox.y,
      width: borderBox.width,
      height: borderBox.height,
      contentBox,
      paddingBox,
      borderBox,
      marginBox
    }
    
    node.computed = computed
    
    // Layout children based on type
    if (node.children && node.children.length > 0) {
      this.layoutChildren(node, contentBox)
    }
    
    return computed
  }
  
  private layoutChildren(parent: LayoutNode, contentBox: Box): void {
    const { type, props = {} } = parent
    
    switch (type) {
      case 'grid':
        this.layoutGrid(parent.children!, contentBox, props)
        break
      case 'dock':
        this.layoutDock(parent.children!, contentBox, props)
        break
      case 'stack':
        this.layoutStack(parent.children!, contentBox, props)
        break
      case 'flex':
      case 'flexbox':
        this.layoutFlexbox(parent.children!, contentBox, props)
        break
      case 'panel':
        // Panels layout children vertically like a stack
        this.layoutStack(parent.children!, contentBox, { ...props, direction: 'vertical', gap: 0 })
        break
      default:
        // For other containers, stack children vertically
        if (parent.children && parent.children.length > 0) {
          this.layoutStack(parent.children, contentBox, { direction: 'vertical', gap: 0 })
        }
    }
  }
  
  private layoutGrid(children: LayoutNode[], contentBox: Box, props: any): void {
    const rows = props.rows || Math.ceil(Math.sqrt(children.length))
    const cols = props.cols || Math.ceil(children.length / rows)
    
    // Auto-calculate gap if not specified
    let gap = props.gap
    if (gap === undefined || gap === 'auto') {
      // For responsive layout, calculate minimal gap that prevents overlap
      // Use 2 spaces for visual separation (enough to prevent border overlap)
      gap = cols > 1 ? 2 : 0
      
      // For very wide terminals, can increase gap slightly
      if (contentBox.width > 120 && cols > 1) {
        gap = 3
      } else if (contentBox.width < 60 && cols > 1) {
        // For narrow terminals, minimize gap
        gap = 1
      }
    }
    
    // Recalculate cell dimensions with the determined gap
    const availableWidth = contentBox.width - (cols - 1) * gap
    const availableHeight = contentBox.height - (rows - 1) * gap
    
    // Distribute space evenly
    const cellWidth = Math.floor(availableWidth / cols)
    const cellHeight = Math.floor(availableHeight / rows)
    
    // Handle remainder pixels
    const widthRemainder = availableWidth - (cellWidth * cols)
    const heightRemainder = availableHeight - (cellHeight * rows)
    
    let index = 0
    for (let row = 0; row < rows && index < children.length; row++) {
      for (let col = 0; col < cols && index < children.length; col++) {
        const child = children[index++]
        
        // Add remainder pixels to rightmost and bottom cells
        const extraWidth = col < widthRemainder ? 1 : 0
        const extraHeight = row < heightRemainder ? 1 : 0
        
        // Calculate position accounting for extra pixels in previous cells
        const prevExtraWidth = Math.min(col, widthRemainder)
        const prevExtraHeight = Math.min(row, heightRemainder)
        
        const cellBox: Box = {
          x: contentBox.x + col * (cellWidth + gap) + prevExtraWidth,
          y: contentBox.y + row * (cellHeight + gap) + prevExtraHeight,
          width: cellWidth + extraWidth,
          height: cellHeight + extraHeight
        }
        this.computeLayout(child, cellBox)
      }
    }
  }
  
  private layoutDock(children: LayoutNode[], contentBox: Box, props: any): void {
    let availableBox = { ...contentBox }
    
    for (const child of children) {
      const dock = child.props?.dock || 'fill'
      
      switch (dock) {
        case 'top':
          const topHeight = child.props?.height || 3
          const topBox: Box = {
            x: availableBox.x,
            y: availableBox.y,
            width: availableBox.width,
            height: topHeight
          }
          this.computeLayout(child, topBox)
          availableBox.y += topHeight
          availableBox.height -= topHeight
          break
          
        case 'bottom':
          const bottomHeight = child.props?.height || 3
          const bottomBox: Box = {
            x: availableBox.x,
            y: availableBox.y + availableBox.height - bottomHeight,
            width: availableBox.width,
            height: bottomHeight
          }
          this.computeLayout(child, bottomBox)
          availableBox.height -= bottomHeight
          break
          
        case 'left':
          const leftWidth = child.props?.width || 20
          const leftBox: Box = {
            x: availableBox.x,
            y: availableBox.y,
            width: leftWidth,
            height: availableBox.height
          }
          this.computeLayout(child, leftBox)
          availableBox.x += leftWidth
          availableBox.width -= leftWidth
          break
          
        case 'right':
          const rightWidth = child.props?.width || 20
          const rightBox: Box = {
            x: availableBox.x + availableBox.width - rightWidth,
            y: availableBox.y,
            width: rightWidth,
            height: availableBox.height
          }
          this.computeLayout(child, rightBox)
          availableBox.width -= rightWidth
          break
          
        case 'fill':
        default:
          this.computeLayout(child, availableBox)
          break
      }
    }
  }
  
  private layoutStack(children: LayoutNode[], contentBox: Box, props: any): void {
    const direction = props.direction || 'vertical'
    const gap = props.gap || 0
    
    if (direction === 'vertical') {
      let currentY = contentBox.y
      
      children.forEach((child) => {
        // For text nodes, use minimal height
        const childHeight = child.type === 'text' ? 1 : 
                          child.props?.height || 
                          Math.floor((contentBox.height - gap * (children.length - 1)) / children.length)
        
        const childBox: Box = {
          x: contentBox.x,
          y: currentY,
          width: contentBox.width,
          height: Math.min(childHeight, contentBox.y + contentBox.height - currentY)
        }
        
        this.computeLayout(child, childBox)
        currentY += childHeight + gap
      })
    } else {
      const totalGap = gap * (children.length - 1)
      const itemWidth = Math.floor((contentBox.width - totalGap) / children.length)
      
      children.forEach((child, index) => {
        const childBox: Box = {
          x: contentBox.x + index * (itemWidth + gap),
          y: contentBox.y,
          width: itemWidth,
          height: contentBox.height
        }
        this.computeLayout(child, childBox)
      })
    }
  }
  
  private layoutFlexbox(children: LayoutNode[], contentBox: Box, props: any): void {
    const direction = props.direction || 'row'
    
    if (direction === 'vertical' || direction === 'column') {
      // Vertical flexbox layout
      let totalFlex = 0
      let fixedHeight = 0
      
      // Calculate flex and fixed sizes
      children.forEach(child => {
        if (child.props?.flex) {
          totalFlex += child.props.flex
        } else if (child.props?.height) {
          fixedHeight += child.props.height
        } else {
          // Auto height: calculate based on content + padding + border
          const autoHeight = this.calculateAutoHeight(child)
          fixedHeight += autoHeight
        }
      })
      
      const availableFlexHeight = contentBox.height - fixedHeight
      let currentY = contentBox.y
      
      children.forEach(child => {
        let childHeight: number
        if (child.props?.flex && totalFlex > 0) {
          childHeight = Math.floor(availableFlexHeight * child.props.flex / totalFlex)
        } else if (child.props?.height) {
          childHeight = child.props.height
        } else {
          childHeight = this.calculateAutoHeight(child)
        }
        
        const childBox: Box = {
          x: contentBox.x,
          y: currentY,
          width: contentBox.width,
          height: Math.min(childHeight, contentBox.y + contentBox.height - currentY)
        }
        
        this.computeLayout(child, childBox)
        currentY += childHeight
      })
    } else {
      // Horizontal flexbox (row) - use existing flex layout
      this.layoutFlex(children, contentBox, props)
    }
  }
  
  private layoutFlex(children: LayoutNode[], contentBox: Box, props: any): void {
    const direction = props.direction || 'row'
    const gap = props.gap || 0
    const justify = props.justify || 'start'
    const align = props.align || 'start'
    
    // Calculate flex factors
    let totalFlex = 0
    let fixedSize = 0
    
    children.forEach(child => {
      const flex = child.props?.flex || 0
      if (flex > 0) {
        totalFlex += flex
      } else {
        if (direction === 'row') {
          fixedSize += child.props?.width || 10
        } else {
          fixedSize += child.props?.height || 3
        }
      }
    })
    
    const totalGap = gap * (children.length - 1)
    const availableFlexSpace = direction === 'row' 
      ? contentBox.width - fixedSize - totalGap
      : contentBox.height - fixedSize - totalGap
    
    let currentPos = direction === 'row' ? contentBox.x : contentBox.y
    
    children.forEach(child => {
      const flex = child.props?.flex || 0
      let childBox: Box
      
      if (direction === 'row') {
        const width = flex > 0 
          ? Math.floor(availableFlexSpace * flex / totalFlex)
          : child.props?.width || 10
          
        childBox = {
          x: currentPos,
          y: contentBox.y,
          width,
          height: contentBox.height
        }
        currentPos += width + gap
      } else {
        const height = flex > 0
          ? Math.floor(availableFlexSpace * flex / totalFlex)
          : child.props?.height || 3
          
        childBox = {
          x: contentBox.x,
          y: currentPos,
          width: contentBox.width,
          height
        }
        currentPos += height + gap
      }
      
      this.computeLayout(child, childBox)
    })
  }
  
  private calculateAutoHeight(node: LayoutNode): number {
    // Calculate auto height based on content type and styling
    const props = node.props || {}
    const style = props.style || {}
    const padding = this.parseSpacing(style.padding || props.padding, 0)
    const border = (style.border || props.border) ? 1 : 0
    
    let contentHeight = 1 // Default minimum content height
    
    // Determine content height based on type
    switch (node.type) {
      case 'input':
        contentHeight = 1 // Input always needs 1 line
        break
      case 'container':
      case 'text':
        // Count lines in template/text
        if (props.template || props.text) {
          const text = props.template || props.text || ''
          contentHeight = (text.match(/\n/g) || []).length + 1
        }
        break
      case 'buttonGroup':
        contentHeight = 1 // Buttons in a row
        break
      case 'list':
        contentHeight = 10 // Default list height
        break
      default:
        contentHeight = 3 // Default for unknown types
    }
    
    // Total height = content + padding + border
    const totalHeight = contentHeight + 
                       padding.top + padding.bottom + 
                       (border * 2)
    
    return totalHeight
  }
  
  private parseSpacing(value: any, defaultValue: number = 0): { top: number, right: number, bottom: number, left: number } {
    if (typeof value === 'number') {
      return { top: value, right: value, bottom: value, left: value }
    }
    
    if (typeof value === 'string') {
      const parts = value.split(' ').map(Number)
      if (parts.length === 1) {
        const v = parts[0]
        return { top: v, right: v, bottom: v, left: v }
      } else if (parts.length === 2) {
        return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
      } else if (parts.length === 4) {
        return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
      }
    }
    
    if (typeof value === 'object') {
      return {
        top: value.top || defaultValue,
        right: value.right || defaultValue,
        bottom: value.bottom || defaultValue,
        left: value.left || defaultValue
      }
    }
    
    return { top: defaultValue, right: defaultValue, bottom: defaultValue, left: defaultValue }
  }
  
  updateDimensions(width: number, height: number): void {
    this.rootBox = { x: 0, y: 0, width, height }
  }
}