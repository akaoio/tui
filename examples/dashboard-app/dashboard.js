#!/usr/bin/env node

/**
 * Dashboard Example - Clean implementation
 * Shows system metrics in a grid layout
 */

const { App, Component } = require('../../dist/index.js')

/**
 * Card Component with clean borders
 */
class Card extends Component {
  render(context) {
    const { region } = context
    
    // Clear area
    this.fillRegion(context, { x: 0, y: 0, width: region.width, height: region.height }, ' ')
    
    // Draw border
    this.drawBox(context, { x: 0, y: 0, width: region.width, height: region.height }, 'rounded')
    
    // Title
    if (this.props.title) {
      const title = ` ${this.props.title} `
      const titleX = Math.floor((region.width - title.length) / 2)
      this.writeText(context, title, titleX, 0, '\x1b[1m\x1b[36m')
    }
    
    // Render children
    this.children.forEach((child, index) => {
      child.render({
        ...context,
        region: {
          x: region.x + 2,
          y: region.y + 2 + index,
          width: region.width - 4,
          height: 1
        }
      })
    })
  }
}

/**
 * Metric Component
 */
class Metric extends Component {
  render(context) {
    const label = this.props.label || 'Metric'
    const value = this.props.value || '0'
    const color = this.props.color || '\x1b[37m'
    
    this.writeText(context, `${label}: `, 0, 0, '\x1b[90m')
    this.writeText(context, value, label.length + 2, 0, color)
  }
}

/**
 * Progress Bar
 */
class ProgressBar extends Component {
  render(context) {
    const { region } = context
    const progress = Math.min(100, Math.max(0, this.props.progress || 0))
    const width = Math.min(30, region.width - 10)
    const filled = Math.floor((progress / 100) * width)
    
    this.writeText(context, '[', 0, 0, '\x1b[37m')
    
    for (let i = 0; i < width; i++) {
      const char = i < filled ? '█' : '░'
      const color = i < filled ? '\x1b[32m' : '\x1b[90m'
      this.writeText(context, char, i + 1, 0, color)
    }
    
    this.writeText(context, ']', width + 1, 0, '\x1b[37m')
    this.writeText(context, ` ${progress}%`, width + 3, 0, '\x1b[37m')
  }
}

/**
 * Status Indicator
 */
class StatusIndicator extends Component {
  render(context) {
    const status = this.props.status || 'unknown'
    const icons = {
      online: { icon: '●', color: '\x1b[32m' },
      offline: { icon: '●', color: '\x1b[31m' },
      warning: { icon: '●', color: '\x1b[33m' },
      unknown: { icon: '●', color: '\x1b[90m' }
    }
    
    const { icon, color } = icons[status] || icons.unknown
    this.writeText(context, icon, 0, 0, color + '\x1b[1m')
    this.writeText(context, ` ${status.toUpperCase()}`, 2, 0, '\x1b[37m')
  }
}

/**
 * Dashboard Root Component
 */
class Dashboard extends Component {
  render(context) {
    const { region } = context
    
    // Clear screen
    this.fillRegion(context, { x: 0, y: 0, width: region.width, height: region.height }, ' ')
    
    // Calculate grid
    const cardWidth = Math.floor(region.width / 2)
    const cardHeight = Math.floor(region.height / 2)
    
    // Render cards in 2x2 grid
    this.children.forEach((child, index) => {
      const col = index % 2
      const row = Math.floor(index / 2)
      
      child.render({
        ...context,
        region: {
          x: col * cardWidth,
          y: row * cardHeight,
          width: cardWidth,
          height: cardHeight
        }
      })
    })
  }
}

// Create and run app
async function main() {
  const app = new App()
  
  // Create dashboard
  const dashboard = new Dashboard({})
  
  // System card
  const systemCard = new Card({ title: 'System' })
  systemCard.addChild(new Metric({ label: 'CPU', value: '45%', color: '\x1b[33m' }))
  systemCard.addChild(new Metric({ label: 'Memory', value: '78%', color: '\x1b[31m' }))
  systemCard.addChild(new Metric({ label: 'Disk', value: '23%', color: '\x1b[32m' }))
  
  // Network card
  const networkCard = new Card({ title: 'Network' })
  networkCard.addChild(new StatusIndicator({ status: 'online' }))
  networkCard.addChild(new Metric({ label: 'Bandwidth', value: '124 Mbps', color: '\x1b[36m' }))
  networkCard.addChild(new Metric({ label: 'Latency', value: '12ms', color: '\x1b[32m' }))
  
  // Build status
  const buildCard = new Card({ title: 'Build Status' })
  buildCard.addChild(new ProgressBar({ progress: 67 }))
  buildCard.addChild(new Metric({ label: 'Tests', value: '142/200', color: '\x1b[35m' }))
  buildCard.addChild(new Metric({ label: 'Coverage', value: '85%', color: '\x1b[32m' }))
  
  // Alerts
  const alertCard = new Card({ title: 'Alerts' })
  alertCard.addChild(new StatusIndicator({ status: 'warning' }))
  alertCard.addChild(new Metric({ label: 'Issues', value: '3', color: '\x1b[31m' }))
  alertCard.addChild(new Metric({ label: 'Last Check', value: '2 min ago', color: '\x1b[90m' }))
  
  dashboard.addChild(systemCard)
  dashboard.addChild(networkCard)
  dashboard.addChild(buildCard)
  dashboard.addChild(alertCard)
  
  // Update metrics periodically
  setInterval(() => {
    systemCard.children[0].props.value = `${Math.floor(Math.random() * 100)}%`
    systemCard.children[1].props.value = `${Math.floor(Math.random() * 100)}%`
    buildCard.children[0].props.progress = Math.floor(Math.random() * 100)
    app.render()
  }, 2000)
  
  // Handle exit
  app.on('keypress', (char, key) => {
    if (char === 'q' || key?.name === 'escape') {
      app.stop()
      process.exit(0)
    }
  })
  
  app.setRootComponent(dashboard)
  await app.start()
}

main().catch(console.error)