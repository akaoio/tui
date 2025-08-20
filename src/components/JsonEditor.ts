/**
 * JSON Editor Component
 * Interactive editor for JSON configuration files
 */

import { Component } from '../core/Component'
import { VirtualCursorManager } from '../core/VirtualCursor'

interface JsonNode {
  key: string
  value: any
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  path: string[]
  expanded: boolean
  level: number
  parent?: JsonNode
  children?: JsonNode[]
}

export class JsonEditor extends Component {
  private data: any = {}
  private nodes: JsonNode[] = []
  private selectedIndex: number = 0
  private editMode: boolean = false
  private editValue: string = ''
  private scrollOffset: number = 0
  private onChange?: (data: any) => void

  constructor(props?: any) {
    super(props)
    if (props?.data) {
      this.setData(props.data)
    }
  }

  /**
   * Set JSON data to edit
   */
  setData(data: any): void {
    this.data = data
    this.nodes = this.buildNodeTree(data)
    this.selectedIndex = 0
    this.scrollOffset = 0
  }

  /**
   * Get current JSON data
   */
  getData(): any {
    return this.data
  }

  /**
   * Set change callback
   */
  onDataChange(callback: (data: any) => void): void {
    this.onChange = callback
  }

  /**
   * Build node tree from JSON data
   */
  private buildNodeTree(data: any, key: string = 'root', path: string[] = [], level: number = 0): JsonNode[] {
    const nodes: JsonNode[] = []
    const type = this.getType(data)
    
    const node: JsonNode = {
      key,
      value: data,
      type,
      path,
      expanded: level < 2, // Auto-expand first 2 levels
      level
    }
    
    nodes.push(node)
    
    if (node.expanded) {
      if (type === 'object' && data !== null) {
        node.children = []
        Object.entries(data).forEach(([k, v]) => {
          const childNodes = this.buildNodeTree(v, k, [...path, k], level + 1)
          childNodes[0].parent = node
          node.children!.push(...childNodes)
          nodes.push(...childNodes)
        })
      } else if (type === 'array') {
        node.children = []
        data.forEach((item: any, index: number) => {
          const childNodes = this.buildNodeTree(item, `[${index}]`, [...path, String(index)], level + 1)
          childNodes[0].parent = node
          node.children!.push(...childNodes)
          nodes.push(...childNodes)
        })
      }
    }
    
    return nodes
  }

  /**
   * Get type of value
   */
  private getType(value: any): JsonNode['type'] {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value as JsonNode['type']
  }

  /**
   * Toggle node expansion
   */
  private toggleNode(node: JsonNode): void {
    if (node.type === 'object' || node.type === 'array') {
      node.expanded = !node.expanded
      
      if (!node.expanded) {
        // Collapse - remove children from flat list
        this.nodes = this.nodes.filter(n => {
          return !this.isDescendantOf(n, node)
        })
      } else {
        // Expand - rebuild tree
        this.nodes = this.buildNodeTree(this.data)
      }
    }
  }

  /**
   * Check if node is descendant of another
   */
  private isDescendantOf(node: JsonNode, ancestor: JsonNode): boolean {
    let current = node.parent
    while (current) {
      if (current === ancestor) return true
      current = current.parent
    }
    return false
  }

  /**
   * Start editing selected node
   */
  private startEdit(): void {
    const node = this.nodes[this.selectedIndex]
    if (!node || node.type === 'object' || node.type === 'array') return
    
    this.editMode = true
    this.editValue = String(node.value)
  }

  /**
   * Apply edit
   */
  private applyEdit(): void {
    const node = this.nodes[this.selectedIndex]
    if (!node) return
    
    // Parse value based on type
    let newValue: any = this.editValue
    
    if (node.type === 'number') {
      newValue = Number(this.editValue)
      if (isNaN(newValue)) return
    } else if (node.type === 'boolean') {
      newValue = this.editValue.toLowerCase() === 'true'
    } else if (node.type === 'null') {
      newValue = null
    }
    
    // Update data
    this.updateValue(node.path, newValue)
    
    // Rebuild tree
    this.nodes = this.buildNodeTree(this.data)
    
    this.editMode = false
    this.editValue = ''
    
    // Notify change
    this.onChange?.(this.data)
  }

  /**
   * Update value in data
   */
  private updateValue(path: string[], value: any): void {
    if (path.length === 0) {
      this.data = value
      return
    }
    
    let current = this.data
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]]
    }
    current[path[path.length - 1]] = value
  }

  /**
   * Add new property to object
   */
  private addProperty(): void {
    const node = this.nodes[this.selectedIndex]
    if (!node || node.type !== 'object') return
    
    const key = `newProperty${Object.keys(node.value).length}`
    node.value[key] = ''
    
    // Rebuild tree
    this.nodes = this.buildNodeTree(this.data)
    
    // Find and select new property
    const newNode = this.nodes.find(n => 
      n.path.join('.') === [...node.path, key].join('.')
    )
    if (newNode) {
      this.selectedIndex = this.nodes.indexOf(newNode)
      this.startEdit()
    }
    
    this.onChange?.(this.data)
  }

  /**
   * Delete selected property
   */
  private deleteProperty(): void {
    const node = this.nodes[this.selectedIndex]
    if (!node || node.path.length === 0) return
    
    // Get parent and delete property
    let parent = this.data
    for (let i = 0; i < node.path.length - 1; i++) {
      parent = parent[node.path[i]]
    }
    
    const lastKey = node.path[node.path.length - 1]
    if (Array.isArray(parent)) {
      parent.splice(Number(lastKey), 1)
    } else {
      delete parent[lastKey]
    }
    
    // Rebuild tree
    this.nodes = this.buildNodeTree(this.data)
    
    // Adjust selection
    if (this.selectedIndex >= this.nodes.length) {
      this.selectedIndex = Math.max(0, this.nodes.length - 1)
    }
    
    this.onChange?.(this.data)
  }

  handleInput(char: string, key: any): boolean {
    if (this.editMode) {
      // Edit mode handling
      if (key?.name === 'escape') {
        this.editMode = false
        this.editValue = ''
        return true
      }
      
      if (key?.name === 'return' || key?.name === 'enter') {
        this.applyEdit()
        return true
      }
      
      if (key?.name === 'backspace') {
        this.editValue = this.editValue.slice(0, -1)
        return true
      }
      
      if (char && char.length === 1) {
        this.editValue += char
        return true
      }
      
      return true
    }
    
    // Normal mode handling
    if (key?.name === 'up' || char === 'k') {
      this.moveSelection(-1)
      return true
    }
    
    if (key?.name === 'down' || char === 'j') {
      this.moveSelection(1)
      return true
    }
    
    if (key?.name === 'left' || char === 'h') {
      const node = this.nodes[this.selectedIndex]
      if (node && node.expanded) {
        this.toggleNode(node)
      }
      return true
    }
    
    if (key?.name === 'right' || char === 'l') {
      const node = this.nodes[this.selectedIndex]
      if (node && !node.expanded && (node.type === 'object' || node.type === 'array')) {
        this.toggleNode(node)
      }
      return true
    }
    
    if (key?.name === 'return' || key?.name === 'enter' || char === 'e') {
      this.startEdit()
      return true
    }
    
    if (char === ' ') {
      const node = this.nodes[this.selectedIndex]
      if (node) {
        this.toggleNode(node)
      }
      return true
    }
    
    if (char === 'a') {
      this.addProperty()
      return true
    }
    
    if (char === 'd' || key?.name === 'delete') {
      this.deleteProperty()
      return true
    }
    
    return false
  }

  private moveSelection(delta: number): void {
    this.selectedIndex = Math.max(0, Math.min(this.nodes.length - 1, this.selectedIndex + delta))
    
    // Adjust scroll to keep selection visible
    const visibleHeight = this.props.height || 20
    if (this.selectedIndex < this.scrollOffset) {
      this.scrollOffset = this.selectedIndex
    } else if (this.selectedIndex >= this.scrollOffset + visibleHeight - 2) {
      this.scrollOffset = this.selectedIndex - visibleHeight + 3
    }
  }

  render(context: any): void {
    const { region } = context
    
    // Draw border
    this.drawBox(context, { x: 0, y: 0, width: region.width, height: region.height }, 'rounded')
    
    // Title
    this.writeText(context, ' JSON Editor ', 2, 0, '\x1b[1m\x1b[36m')
    
    // Help text
    const helpText = '[↑↓] Navigate [←→] Collapse/Expand [e] Edit [a] Add [d] Delete'
    this.writeText(context, helpText, 2, region.height - 1, '\x1b[90m')
    
    // Render nodes
    let y = 2
    const maxY = region.height - 2
    const visibleNodes = this.nodes.slice(this.scrollOffset)
    
    for (let i = 0; i < visibleNodes.length && y < maxY; i++) {
      const node = visibleNodes[i]
      const isSelected = this.nodes.indexOf(node) === this.selectedIndex
      const indent = '  '.repeat(node.level)
      
      // Selection indicator
      const prefix = isSelected ? '▶ ' : '  '
      const bgColor = isSelected ? '\x1b[48;5;238m' : ''
      const resetBg = isSelected ? '\x1b[0m' : ''
      
      // Build line
      let line = `${bgColor}${prefix}${indent}`
      
      // Expand/collapse indicator
      if (node.type === 'object' || node.type === 'array') {
        line += node.expanded ? '▼ ' : '▶ '
      } else {
        line += '  '
      }
      
      // Key
      if (node.key !== 'root') {
        line += `\x1b[36m${node.key}\x1b[0m${bgColor}: `
      }
      
      // Value
      if (isSelected && this.editMode) {
        // Edit mode
        line += `\x1b[33m${this.editValue}█\x1b[0m`
      } else {
        // Display mode
        if (node.type === 'object') {
          const count = Object.keys(node.value).length
          line += `\x1b[90m{ ${count} properties }${node.expanded ? '' : '...'}\x1b[0m`
        } else if (node.type === 'array') {
          line += `\x1b[90m[ ${node.value.length} items ]${node.expanded ? '' : '...'}\x1b[0m`
        } else if (node.type === 'string') {
          line += `\x1b[32m"${node.value}"\x1b[0m`
        } else if (node.type === 'number') {
          line += `\x1b[33m${node.value}\x1b[0m`
        } else if (node.type === 'boolean') {
          line += node.value ? '\x1b[32mtrue\x1b[0m' : '\x1b[31mfalse\x1b[0m'
        } else if (node.type === 'null') {
          line += '\x1b[90mnull\x1b[0m'
        }
      }
      
      line += resetBg
      
      // Write line
      this.writeText(context, line, 2, y, '')
      y++
    }
    
    // Scroll indicator
    if (this.nodes.length > maxY - 2) {
      const scrollText = `${this.selectedIndex + 1}/${this.nodes.length}`
      this.writeText(context, scrollText, region.width - scrollText.length - 2, 1, '\x1b[90m')
    }
  }
}