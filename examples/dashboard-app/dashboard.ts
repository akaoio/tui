#!/usr/bin/env tsx

/**
 * Dashboard App - Layout hoàn toàn khác để chứng minh sự linh hoạt
 * Framework generic không force bất kỳ design nào
 */

import { App, Component, RenderContext, ComponentProps, Region } from '../../src'

/**
 * Grid Layout - Hoàn toàn khác dock layout
 */
class GridLayout extends Component {
  render(context: RenderContext): void {
    const { region } = context
    const cols = this.props.cols || 2
    const rows = this.props.rows || 2
    
    const cellWidth = Math.floor(region.width / cols)
    const cellHeight = Math.floor(region.height / rows)
    
    this.children.forEach((child, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      
      child.render({
        ...context,
        region: {
          x: region.x + col * cellWidth,
          y: region.y + row * cellHeight,
          width: cellWidth,
          height: cellHeight
        }
      })
    })
  }
}

/**
 * Card Component với border và title
 */
class Card extends Component {
  render(context: RenderContext): void {
    const { region } = context
    
    // Clear card area first to prevent artifacts
    this.fillRegion(context, { x: 0, y: 0, width: region.width, height: region.height }, ' ')
    
    // Draw border
    this.drawBox(context, { x: 0, y: 0, width: region.width, height: region.height }, 'rounded')
    
    // Title (without background, just colored text)
    if (this.props.title) {
      const titleText = ` ${this.props.title} `
      this.writeText(context, titleText, 2, 0, '\x1b[1m\x1b[36m') // Bold cyan title
    }
    
    // Content area
    const contentY = this.props.title ? 2 : 1
    const contentHeight = region.height - contentY - 1
    
    this.children.forEach((child, index) => {
      child.render({
        ...context,
        region: {
          x: region.x + 2,
          y: region.y + contentY + index,
          width: region.width - 4,
          height: 1
        }
      })
    })
  }
}

/**
 * Metric Display
 */
class Metric extends Component {
  render(context: RenderContext): void {
    const value = this.props.value || '0'
    const label = this.props.label || 'Metric'
    const color = this.props.color || '\x1b[37m'
    
    this.writeText(context, `${label}: `, 0, 0, '\x1b[90m') // Gray label
    this.writeText(context, value, label.length + 2, 0, color) // Colored value
  }
}

/**
 * Progress Bar
 */
class ProgressBar extends Component {
  render(context: RenderContext): void {
    const { region } = context
    const progress = Math.min(100, Math.max(0, this.props.progress || 0))
    const maxWidth = Math.min(30, region.width - 10) // Limit width to prevent overflow
    const filled = Math.floor((progress / 100) * maxWidth)
    
    // Background
    this.writeText(context, '[', 0, 0, '\x1b[37m')
    
    // Progress bar
    for (let i = 0; i < maxWidth; i++) {
      const char = i < filled ? '█' : '░'
      const color = i < filled ? '\x1b[32m' : '\x1b[90m' // Green or gray
      this.writeText(context, char, i + 1, 0, color)
    }
    
    this.writeText(context, ']', maxWidth + 1, 0, '\x1b[37m')
    
    // Percentage
    this.writeText(context, ` ${progress}%`, maxWidth + 3, 0, '\x1b[37m')
  }
}

/**
 * Status Indicator với colors
 */
class StatusIndicator extends Component {
  render(context: RenderContext): void {
    const status = this.props.status || 'unknown'
    const statusColors = {
      online: '\x1b[32m', // Green
      offline: '\x1b[31m', // Red  
      warning: '\x1b[33m', // Yellow
      unknown: '\x1b[90m'  // Gray
    }
    
    const color = statusColors[status as keyof typeof statusColors] || statusColors.unknown
    this.writeText(context, '● ', 0, 0, color + '\x1b[1m')
    this.writeText(context, status.toUpperCase(), 2, 0, '\x1b[37m')
  }
}

/**
 * Tạo Dashboard App với layout grid
 */
function createDashboardApp(): App {
  const app = new App()
  
  // Grid layout 2x2
  const root = new GridLayout({ cols: 2, rows: 2 })
  
  // Card 1: System Metrics
  const systemCard = new Card({ title: 'System' })
  systemCard.addChild(new Metric({ label: 'CPU', value: '45%', color: '\x1b[33m' })) // Yellow
  systemCard.addChild(new Metric({ label: 'Memory', value: '78%', color: '\x1b[31m' })) // Red
  systemCard.addChild(new Metric({ label: 'Disk', value: '23%', color: '\x1b[32m' })) // Green
  
  // Card 2: Network Status  
  const networkCard = new Card({ title: 'Network' })
  networkCard.addChild(new StatusIndicator({ status: 'online' }))
  networkCard.addChild(new Metric({ label: 'Bandwidth', value: '124 Mbps', color: '\x1b[36m' })) // Cyan
  
  // Card 3: Build Progress
  const buildCard = new Card({ title: 'Build Status' })
  buildCard.addChild(new ProgressBar({ progress: 67 }))
  buildCard.addChild(new Metric({ label: 'Tests', value: '142/200', color: '\x1b[35m' })) // Magenta
  
  // Card 4: Alerts
  const alertCard = new Card({ title: 'Alerts' })
  alertCard.addChild(new StatusIndicator({ status: 'warning' }))
  alertCard.addChild(new Metric({ label: 'Issues', value: '3', color: '\x1b[31m' })) // Red
  
  root.addChild(systemCard)
  root.addChild(networkCard) 
  root.addChild(buildCard)
  root.addChild(alertCard)
  
  // Simulate live updates
  setInterval(() => {
    // Update random metrics
    if (systemCard.children.length > 0) {
      systemCard.children[0].props.value = `${Math.floor(Math.random() * 100)}%`
    }
    if (buildCard.children.length > 0) {
      buildCard.children[0].props.progress = Math.floor(Math.random() * 100)
    }
    app.render()
  }, 2000)
  
  app.on('keypress', (char: string, key: any) => {
    if (char === 'q' || key?.name === 'escape') {
      app.stop()
      process.exit(0)
    }
  })
  
  app.setRootComponent(root)
  return app
}

async function main() {
  const app = createDashboardApp()
  await app.start()
}

main().catch(() => {})