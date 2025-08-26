#!/usr/bin/env tsx

/**
 * @akaoio/air TUI Client
 * 
 * A comprehensive P2P database management interface for @akaoio/air:
 * - Node network visualization and management
 * - Real-time data browser and query interface
 * - P2P connection monitoring and diagnostics
 * - Mobile-optimized database administration
 * - Distributed data synchronization tracking
 * - Graph database exploration tools
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { 
  Screen, 
  Keyboard, 
  UnifiedKeyboardHandler, 
  Form, 
  Input, 
  Select, 
  ProgressBar, 
  Spinner, 
  Radio,
  Checkbox,
  ResponsiveCommands,
  colors,
  styles
} from '../../src';

interface AirNode {
  id: string;
  address: string;
  port: number;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastSeen: number;
  latency?: number;
  version?: string;
  syncStatus: 'synced' | 'syncing' | 'behind' | 'ahead';
  dataCount: number;
  peerCount: number;
}

interface DataRecord {
  key: string;
  value: any;
  timestamp: number;
  node: string;
  version: number;
  synced: boolean;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
}

interface NetworkStats {
  totalNodes: number;
  connectedNodes: number;
  totalRecords: number;
  syncedRecords: number;
  networkLatency: number;
  throughput: number;
  uptime: number;
}

interface QueryResult {
  records: DataRecord[];
  totalCount: number;
  executionTime: number;
  fromCache: boolean;
  sourceNodes: string[];
}

class AirClient {
  private screen: Screen;
  private keyboard: Keyboard;
  private keyboardHandler: UnifiedKeyboardHandler;
  private currentView: 'network' | 'data' | 'query' | 'sync' | 'config' | 'logs' = 'network';
  private airProcess: ChildProcess | null = null;
  private isConnected = false;
  private responsiveCommands: ResponsiveCommands;
  
  // Air data
  private nodes: AirNode[] = [];
  private selectedNodeIndex = 0;
  private currentData: DataRecord[] = [];
  private selectedDataIndex = 0;
  private networkStats: NetworkStats;
  private queryHistory: string[] = [];
  private currentQuery = '';
  private queryResults: QueryResult | null = null;
  
  // UI components
  private spinner: Spinner | null = null;
  private logOutput: string[] = [];
  private autoRefresh = true;
  private refreshInterval = 5000; // 5 seconds
  
  // Configuration
  private config = {
    nodeAddress: 'localhost',
    nodePort: 8765,
    peers: ['localhost:8766', 'localhost:8767'],
    autoConnect: true,
    syncInterval: 1000,
    queryLimit: 100
  };

  constructor() {
    this.screen = new Screen();
    this.keyboard = new Keyboard();
    this.keyboardHandler = new UnifiedKeyboardHandler(this.keyboard);
    this.responsiveCommands = new ResponsiveCommands();
    
    // Initialize with demo data
    this.initializeDemoData();
    
    this.setupKeyboardHandlers();
    this.startAutoRefresh();
  }

  private initializeDemoData(): void {
    // Demo network nodes
    this.nodes = [
      {
        id: 'local',
        address: 'localhost',
        port: 8765,
        status: 'connected',
        lastSeen: Date.now(),
        latency: 12,
        version: '2.0.0',
        syncStatus: 'synced',
        dataCount: 1543,
        peerCount: 2
      },
      {
        id: 'peer1',
        address: '192.168.1.100',
        port: 8765,
        status: 'connected',
        lastSeen: Date.now() - 2000,
        latency: 45,
        version: '2.0.0',
        syncStatus: 'syncing',
        dataCount: 1540,
        peerCount: 3
      },
      {
        id: 'peer2',
        address: '192.168.1.101',
        port: 8765,
        status: 'connecting',
        lastSeen: Date.now() - 30000,
        latency: 89,
        version: '1.9.2',
        syncStatus: 'behind',
        dataCount: 1520,
        peerCount: 1
      }
    ];
    
    // Demo data records
    this.currentData = [
      {
        key: 'users/john',
        value: { name: 'John Doe', email: 'john@example.com', active: true },
        timestamp: Date.now() - 60000,
        node: 'local',
        version: 3,
        synced: true,
        type: 'object'
      },
      {
        key: 'users/jane',
        value: { name: 'Jane Smith', email: 'jane@example.com', active: false },
        timestamp: Date.now() - 120000,
        node: 'peer1',
        version: 2,
        synced: true,
        type: 'object'
      },
      {
        key: 'config/app',
        value: { version: '1.0.0', debug: false, features: ['auth', 'sync'] },
        timestamp: Date.now() - 300000,
        node: 'local',
        version: 5,
        synced: false,
        type: 'object'
      },
      {
        key: 'metrics/daily',
        value: [100, 120, 95, 110, 130],
        timestamp: Date.now() - 3600000,
        node: 'peer2',
        version: 1,
        synced: true,
        type: 'array'
      }
    ];
    
    // Demo network stats
    this.networkStats = {
      totalNodes: 3,
      connectedNodes: 2,
      totalRecords: 1543,
      syncedRecords: 1521,
      networkLatency: 45.3,
      throughput: 250.5,
      uptime: 86400 // 24 hours
    };
    
    this.isConnected = true;
  }

  private setupKeyboardHandlers(): void {
    // Global shortcuts
    this.keyboardHandler.onKey(['ctrl+c', 'q'], () => this.quit());
    this.keyboardHandler.onKey('h', () => this.showHelp());
    
    // View navigation
    this.keyboardHandler.onKey('1', () => this.currentView = 'network');
    this.keyboardHandler.onKey('2', () => this.currentView = 'data');
    this.keyboardHandler.onKey('3', () => this.currentView = 'query');
    this.keyboardHandler.onKey('4', () => this.currentView = 'sync');
    this.keyboardHandler.onKey('5', () => this.currentView = 'config');
    this.keyboardHandler.onKey('6', () => this.currentView = 'logs');
    
    // Connection management
    this.keyboardHandler.onKey('c', () => this.toggleConnection());
    this.keyboardHandler.onKey('r', () => this.refreshData());
    this.keyboardHandler.onKey('s', () => this.syncNetwork());
    this.keyboardHandler.onKey('a', () => this.toggleAutoRefresh());
    
    // Navigation
    this.keyboardHandler.onKey('up', () => this.navigateUp());
    this.keyboardHandler.onKey('down', () => this.navigateDown());
    this.keyboardHandler.onKey('left', () => this.navigateLeft());
    this.keyboardHandler.onKey('right', () => this.navigateRight());
    this.keyboardHandler.onKey('enter', () => this.handleEnter());
    
    // Data operations
    this.keyboardHandler.onKey('n', () => this.addNewRecord());
    this.keyboardHandler.onKey('e', () => this.editRecord());
    this.keyboardHandler.onKey('d', () => this.deleteRecord());
    this.keyboardHandler.onKey('f', () => this.showFilter());
  }

  private startAutoRefresh(): void {
    setInterval(() => {
      if (this.autoRefresh && this.isConnected) {
        this.updateNetworkData();
      }
    }, this.refreshInterval);
  }

  private updateNetworkData(): void {
    // Simulate network updates
    this.nodes.forEach(node => {
      if (node.status === 'connected') {
        node.lastSeen = Date.now();
        node.latency = Math.random() * 100 + 10;
        
        // Simulate sync progress
        if (node.syncStatus === 'syncing') {
          if (Math.random() > 0.7) {
            node.syncStatus = 'synced';
            node.dataCount = Math.max(node.dataCount, this.networkStats.totalRecords);
          }
        }
      }
    });
    
    // Update network stats
    this.networkStats.networkLatency = this.nodes
      .filter(n => n.status === 'connected' && n.latency)
      .reduce((sum, n) => sum + n.latency!, 0) / Math.max(1, this.nodes.filter(n => n.latency).length);
    
    this.networkStats.connectedNodes = this.nodes.filter(n => n.status === 'connected').length;
  }

  private getScreenDimensions(): { width: number; height: number; isMobile: boolean } {
    const { columns, rows } = process.stdout;
    const width = columns || 80;
    const height = rows || 24;
    const isMobile = width < 60 || height < 20;
    
    return { width, height, isMobile };
  }

  public async start(): Promise<void> {
    this.screen.clear();
    this.render();
    
    // Main rendering loop
    const renderLoop = () => {
      this.render();
      setTimeout(renderLoop, 200);
    };
    renderLoop();

    // Handle process cleanup
    process.on('SIGINT', () => this.quit());
    process.on('SIGTERM', () => this.quit());
  }

  private render(): void {
    const { width, height, isMobile } = this.getScreenDimensions();
    
    this.screen.clear();
    
    // Header
    this.renderHeader(width, isMobile);
    
    // Navigation
    if (isMobile) {
      this.renderMobileNavigation(width);
    } else {
      this.renderDesktopNavigation(width);
    }
    
    // Main content
    const contentStartY = isMobile ? 7 : 5;
    this.screen.setCursor(0, contentStartY);
    
    switch (this.currentView) {
      case 'network':
        this.renderNetworkView(width, height - contentStartY, isMobile);
        break;
      case 'data':
        this.renderDataView(width, height - contentStartY, isMobile);
        break;
      case 'query':
        this.renderQueryView(width, height - contentStartY, isMobile);
        break;
      case 'sync':
        this.renderSyncView(width, height - contentStartY, isMobile);
        break;
      case 'config':
        this.renderConfigView(width, height - contentStartY, isMobile);
        break;
      case 'logs':
        this.renderLogsView(width, height - contentStartY, isMobile);
        break;
    }
    
    // Footer
    this.renderFooter(width, height, isMobile);
  }

  private renderHeader(width: number, isMobile: boolean): void {
    const title = isMobile ? "Air P2P Client" : "@akaoio/air - Distributed Database Client";
    
    this.screen.write(0, 0, `${colors.cyan}${styles.bold}${title}${styles.reset}`);
    
    // Connection status
    const statusY = 1;
    const statusColor = this.isConnected ? colors.green : colors.red;
    const statusText = this.isConnected ? 'Connected' : 'Disconnected';
    
    this.screen.write(0, statusY, `${statusColor}● ${statusText}${colors.reset}`);
    
    if (!isMobile) {
      // Network stats on desktop
      const stats = `Nodes: ${this.networkStats.connectedNodes}/${this.networkStats.totalNodes} | ` +
                   `Records: ${this.networkStats.syncedRecords}/${this.networkStats.totalRecords} | ` +
                   `Latency: ${this.networkStats.networkLatency.toFixed(1)}ms`;
      
      this.screen.write(width - stats.length, statusY, `${colors.blue}${stats}${colors.reset}`);
    } else {
      // Compact stats on mobile
      const stats = `${this.networkStats.connectedNodes}/${this.networkStats.totalNodes} nodes`;
      this.screen.write(width - stats.length - 1, statusY, `${colors.blue}${stats}${colors.reset}`);
    }
    
    // Auto-refresh indicator
    if (this.autoRefresh) {
      const refreshY = statusY + 1;
      this.screen.write(0, refreshY, `${colors.blue}◉ Auto-refresh (${this.refreshInterval/1000}s)${colors.reset}`);
    }
    
    // Draw separator
    const separatorY = this.autoRefresh ? statusY + 2 : statusY + 1;
    this.screen.write(0, separatorY, '─'.repeat(width));
  }

  private renderMobileNavigation(width: number): void {
    const views = [
      { key: '1', name: 'Net', view: 'network' },
      { key: '2', name: 'Data', view: 'data' },
      { key: '3', name: 'Query', view: 'query' },
      { key: '4', name: 'Sync', view: 'sync' },
      { key: '5', name: 'Conf', view: 'config' },
      { key: '6', name: 'Logs', view: 'logs' }
    ];
    
    const nav1 = views.slice(0, 3).map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}]${name}${colors.reset}`;
    }).join(' ');
    
    const nav2 = views.slice(3).map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}]${name}${colors.reset}`;
    }).join(' ');
    
    this.screen.write(0, 5, nav1);
    this.screen.write(0, 6, nav2);
  }

  private renderDesktopNavigation(width: number): void {
    const views = [
      { key: '1', name: 'Network', view: 'network' },
      { key: '2', name: 'Data Browser', view: 'data' },
      { key: '3', name: 'Query Engine', view: 'query' },
      { key: '4', name: 'Sync Status', view: 'sync' },
      { key: '5', name: 'Configuration', view: 'config' },
      { key: '6', name: 'System Logs', view: 'logs' }
    ];
    
    const nav = views.map(({ key, name, view }) => {
      const active = this.currentView === view;
      const color = active ? colors.bgCyan + colors.black : colors.cyan;
      return `${color}[${key}] ${name}${colors.reset}`;
    }).join('  ');
    
    this.screen.write(0, 4, nav);
  }

  private renderNetworkView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}P2P Network Nodes${colors.reset}`);
    y++;
    
    // Network overview
    if (!isMobile) {
      this.screen.write(0, y++, `${colors.blue}Network Overview:${colors.reset}`);
      this.screen.write(0, y++, `Connected Nodes: ${this.networkStats.connectedNodes}/${this.networkStats.totalNodes} | ` +
                              `Average Latency: ${this.networkStats.networkLatency.toFixed(1)}ms | ` +
                              `Throughput: ${this.networkStats.throughput} ops/sec`);
      y++;
    }
    
    // Node list
    const maxNodes = Math.min(this.nodes.length, height - y - 4, isMobile ? 5 : 10);
    
    for (let i = 0; i < maxNodes; i++) {
      const node = this.nodes[i];
      const isSelected = i === this.selectedNodeIndex;
      
      let status = '';
      let color = colors.gray;
      
      switch (node.status) {
        case 'connected':
          status = '●';
          color = colors.green;
          break;
        case 'connecting':
          status = '◐';
          color = colors.yellow;
          break;
        case 'disconnected':
          status = '○';
          color = colors.gray;
          break;
        case 'error':
          status = '✗';
          color = colors.red;
          break;
      }
      
      const prefix = isSelected ? `${colors.bgWhite}${colors.black}>` : ' ';
      const resetColor = isSelected ? colors.reset + colors.bgWhite + colors.black : colors.reset;
      
      if (isMobile) {
        // Mobile: Compact node display
        this.screen.write(0, y++, `${prefix}${color}${status}${resetColor} ${node.id}${colors.reset}`);
        if (isSelected) {
          this.screen.write(2, y++, `${colors.gray}${node.address}:${node.port}${colors.reset}`);
          if (node.latency) {
            this.screen.write(2, y++, `${colors.gray}${node.latency.toFixed(0)}ms, ${node.dataCount} records${colors.reset}`);
          }
        }
      } else {
        // Desktop: Full node information
        const nodeInfo = `${node.address}:${node.port}`;
        const syncStatus = this.getSyncStatusIndicator(node.syncStatus);
        const latencyInfo = node.latency ? `${node.latency.toFixed(0)}ms` : 'N/A';
        const dataInfo = `${node.dataCount} records`;
        const peerInfo = `${node.peerCount} peers`;
        
        this.screen.write(0, y++, 
          `${prefix}${color}${status}${resetColor} ${styles.bold}${node.id}${styles.reset} (${nodeInfo}) | ` +
          `${syncStatus} | ${latencyInfo} | ${dataInfo} | ${peerInfo}${colors.reset}`);
      }
    }
    
    if (this.nodes.length > maxNodes) {
      this.screen.write(0, y++, `${colors.gray}... and ${this.nodes.length - maxNodes} more nodes${colors.reset}`);
    }
    
    // Selected node details (desktop only)
    if (!isMobile && this.selectedNodeIndex < this.nodes.length && y < height - 5) {
      const node = this.nodes[this.selectedNodeIndex];
      y += 2;
      
      this.screen.write(0, y++, `${colors.bold}Selected Node: ${node.id}${colors.reset}`);
      this.screen.write(0, y++, `${colors.blue}Address:${colors.reset} ${node.address}:${node.port}`);
      this.screen.write(0, y++, `${colors.blue}Status:${colors.reset} ${node.status}`);
      this.screen.write(0, y++, `${colors.blue}Version:${colors.reset} ${node.version || 'Unknown'}`);
      this.screen.write(0, y++, `${colors.blue}Sync Status:${colors.reset} ${node.syncStatus}`);
      this.screen.write(0, y++, `${colors.blue}Last Seen:${colors.reset} ${this.formatTimestamp(node.lastSeen)}`);
      
      if (node.latency) {
        this.screen.write(0, y++, `${colors.blue}Latency:${colors.reset} ${node.latency.toFixed(1)}ms`);
      }
    }
  }

  private getSyncStatusIndicator(status: string): string {
    switch (status) {
      case 'synced':
        return `${colors.green}✓ Synced${colors.reset}`;
      case 'syncing':
        return `${colors.blue}◐ Syncing${colors.reset}`;
      case 'behind':
        return `${colors.yellow}⬇ Behind${colors.reset}`;
      case 'ahead':
        return `${colors.yellow}⬆ Ahead${colors.reset}`;
      default:
        return `${colors.gray}? Unknown${colors.reset}`;
    }
  }

  private renderDataView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Distributed Data Browser${colors.reset}`);
    y++;
    
    // Data summary
    if (!isMobile) {
      this.screen.write(0, y++, `${colors.blue}Total Records:${colors.reset} ${this.networkStats.totalRecords} | ` +
                              `${colors.blue}Synced:${colors.reset} ${this.networkStats.syncedRecords} | ` +
                              `${colors.blue}Showing:${colors.reset} ${Math.min(this.currentData.length, height - y - 4)}`);
      y++;
    }
    
    // Data records list
    const maxRecords = Math.min(this.currentData.length, height - y - 3, isMobile ? 6 : 12);
    
    for (let i = 0; i < maxRecords; i++) {
      const record = this.currentData[i];
      const isSelected = i === this.selectedDataIndex;
      
      const syncStatus = record.synced ? `${colors.green}✓` : `${colors.yellow}◐`;
      const prefix = isSelected ? `${colors.bgWhite}${colors.black}>` : ' ';
      const resetColor = isSelected ? colors.reset + colors.bgWhite + colors.black : colors.reset;
      
      if (isMobile) {
        // Mobile: Key and type only
        let key = record.key;
        if (key.length > width - 10) {
          key = key.substring(0, width - 13) + '...';
        }
        
        this.screen.write(0, y++, `${prefix}${syncStatus} ${resetColor}${key}${colors.reset}`);
        
        if (isSelected) {
          this.screen.write(2, y++, `${colors.gray}${record.type} • v${record.version} • ${record.node}${colors.reset}`);
        }
      } else {
        // Desktop: Full record information
        const typeColor = this.getTypeColor(record.type);
        const nodeInfo = `${record.node}`;
        const timeInfo = this.formatTimestamp(record.timestamp);
        
        let key = record.key;
        if (key.length > 30) {
          key = key.substring(0, 27) + '...';
        }
        
        this.screen.write(0, y++, 
          `${prefix}${syncStatus} ${resetColor}${styles.bold}${key}${styles.reset} | ` +
          `${typeColor}${record.type}${colors.reset} | ` +
          `v${record.version} | ${nodeInfo} | ${timeInfo}${colors.reset}`);
      }
    }
    
    if (this.currentData.length > maxRecords) {
      this.screen.write(0, y++, `${colors.gray}... and ${this.currentData.length - maxRecords} more records${colors.reset}`);
    }
    
    // Selected record details (desktop only)
    if (!isMobile && this.selectedDataIndex < this.currentData.length && y < height - 3) {
      const record = this.currentData[this.selectedDataIndex];
      y += 2;
      
      this.screen.write(0, y++, `${colors.bold}Selected Record: ${record.key}${colors.reset}`);
      this.screen.write(0, y++, `${colors.blue}Type:${colors.reset} ${record.type} | ${colors.blue}Version:${colors.reset} ${record.version} | ${colors.blue}Source:${colors.reset} ${record.node}`);
      this.screen.write(0, y++, `${colors.blue}Synced:${colors.reset} ${record.synced ? 'Yes' : 'No'} | ${colors.blue}Updated:${colors.reset} ${this.formatTimestamp(record.timestamp)}`);
      
      // Show value preview
      if (y < height - 1) {
        const valuePreview = this.getValuePreview(record.value, width - 8);
        this.screen.write(0, y++, `${colors.blue}Value:${colors.reset} ${valuePreview}`);
      }
    }
  }

  private getTypeColor(type: string): string {
    switch (type) {
      case 'object':
        return colors.cyan;
      case 'array':
        return colors.magenta;
      case 'string':
        return colors.yellow;
      case 'number':
        return colors.green;
      case 'boolean':
        return colors.blue;
      case 'null':
        return colors.gray;
      default:
        return colors.white;
    }
  }

  private getValuePreview(value: any, maxLength: number): string {
    let preview = '';
    
    try {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          preview = `[${value.length} items]`;
        } else {
          const keys = Object.keys(value);
          preview = `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`;
        }
      } else {
        preview = JSON.stringify(value);
      }
    } catch (error) {
      preview = '<unable to display>';
    }
    
    if (preview.length > maxLength) {
      preview = preview.substring(0, maxLength - 3) + '...';
    }
    
    return preview;
  }

  private renderQueryView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Query Engine${colors.reset}`);
    y++;
    
    // Query input area
    this.screen.write(0, y++, `${colors.blue}Query:${colors.reset}`);
    const queryDisplay = this.currentQuery || 'Enter your query...';
    this.screen.write(0, y++, `> ${queryDisplay}`);
    y++;
    
    // Query history (desktop only)
    if (!isMobile && this.queryHistory.length > 0) {
      this.screen.write(0, y++, `${colors.blue}Recent Queries:${colors.reset}`);
      this.queryHistory.slice(-3).forEach(query => {
        if (y < height - 8) {
          let displayQuery = query;
          if (displayQuery.length > width - 4) {
            displayQuery = displayQuery.substring(0, width - 7) + '...';
          }
          this.screen.write(2, y++, `${colors.gray}${displayQuery}${colors.reset}`);
        }
      });
      y++;
    }
    
    // Query results
    if (this.queryResults) {
      this.screen.write(0, y++, `${colors.bold}Query Results:${colors.reset}`);
      
      const resultSummary = `${this.queryResults.records.length} records found ` +
                           `(${this.queryResults.executionTime}ms${this.queryResults.fromCache ? ', cached' : ''})`;
      this.screen.write(0, y++, `${colors.blue}${resultSummary}${colors.reset}`);
      y++;
      
      // Show results
      const maxResults = Math.min(this.queryResults.records.length, height - y - 2, isMobile ? 5 : 10);
      
      this.queryResults.records.slice(0, maxResults).forEach((record, index) => {
        if (y < height - 2) {
          if (isMobile) {
            let key = record.key;
            if (key.length > width - 6) {
              key = key.substring(0, width - 9) + '...';
            }
            this.screen.write(0, y++, `${colors.cyan}${index + 1}.${colors.reset} ${key}`);
          } else {
            const typeColor = this.getTypeColor(record.type);
            this.screen.write(0, y++, 
              `${colors.cyan}${index + 1}.${colors.reset} ${record.key} | ` +
              `${typeColor}${record.type}${colors.reset} | ${record.node}`);
          }
        }
      });
      
      if (this.queryResults.records.length > maxResults) {
        this.screen.write(0, y++, `${colors.gray}... and ${this.queryResults.records.length - maxResults} more results${colors.reset}`);
      }
    } else {
      // Example queries
      this.screen.write(0, y++, `${colors.bold}Example Queries:${colors.reset}`);
      
      const examples = [
        'users/*',
        'config/app',
        'metrics/daily',
        'type:object',
        'node:local'
      ];
      
      examples.forEach(example => {
        if (y < height - 2) {
          this.screen.write(2, y++, `${colors.cyan}${example}${colors.reset}`);
        }
      });
    }
  }

  private renderSyncView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Network Synchronization Status${colors.reset}`);
    y++;
    
    // Sync overview
    const syncProgress = (this.networkStats.syncedRecords / this.networkStats.totalRecords) * 100;
    this.screen.write(0, y++, `${colors.blue}Sync Progress:${colors.reset} ${syncProgress.toFixed(1)}% (${this.networkStats.syncedRecords}/${this.networkStats.totalRecords})`);
    
    // Visual progress bar
    const barWidth = isMobile ? 20 : 40;
    const filledWidth = Math.round((syncProgress / 100) * barWidth);
    const progressBar = '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);
    this.screen.write(0, y++, `[${progressBar}]`);
    y++;
    
    // Per-node sync status
    this.screen.write(0, y++, `${colors.bold}Node Synchronization:${colors.reset}`);
    
    this.nodes.forEach(node => {
      if (y >= height - 2) return;
      
      const syncIcon = this.getSyncStatusIndicator(node.syncStatus);
      const nodeProgress = node.dataCount / this.networkStats.totalRecords * 100;
      
      if (isMobile) {
        this.screen.write(0, y++, `${syncIcon} ${node.id}`);
        this.screen.write(2, y++, `${colors.gray}${nodeProgress.toFixed(0)}% (${node.dataCount} records)${colors.reset}`);
      } else {
        this.screen.write(0, y++, 
          `${syncIcon} ${styles.bold}${node.id}${styles.reset} | ` +
          `${nodeProgress.toFixed(1)}% | ${node.dataCount}/${this.networkStats.totalRecords} records | ` +
          `Last sync: ${this.formatTimestamp(node.lastSeen)}`);
      }
    });
    
    if (!isMobile && y < height - 5) {
      y += 2;
      this.screen.write(0, y++, `${colors.bold}Sync Statistics:${colors.reset}`);
      this.screen.write(0, y++, `${colors.blue}Network Uptime:${colors.reset} ${this.formatDuration(this.networkStats.uptime)}`);
      this.screen.write(0, y++, `${colors.blue}Sync Throughput:${colors.reset} ${this.networkStats.throughput} ops/sec`);
      this.screen.write(0, y++, `${colors.blue}Average Latency:${colors.reset} ${this.networkStats.networkLatency.toFixed(1)}ms`);
    }
  }

  private renderConfigView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}Air Configuration${colors.reset}`);
    y++;
    
    // Local node configuration
    this.screen.write(0, y++, `${colors.blue}Local Node:${colors.reset}`);
    this.screen.write(2, y++, `Address: ${this.config.nodeAddress}:${this.config.nodePort}`);
    this.screen.write(2, y++, `Auto-connect: ${this.config.autoConnect ? 'Yes' : 'No'}`);
    this.screen.write(2, y++, `Sync interval: ${this.config.syncInterval}ms`);
    y++;
    
    // Peer configuration
    this.screen.write(0, y++, `${colors.blue}Configured Peers:${colors.reset}`);
    this.config.peers.forEach(peer => {
      if (y < height - 5) {
        this.screen.write(2, y++, `• ${peer}`);
      }
    });
    y++;
    
    // Query settings
    this.screen.write(0, y++, `${colors.blue}Query Settings:${colors.reset}`);
    this.screen.write(2, y++, `Result limit: ${this.config.queryLimit}`);
    this.screen.write(2, y++, `Auto-refresh: ${this.autoRefresh ? `${this.refreshInterval/1000}s` : 'Off'}`);
    
    if (!isMobile && y < height - 3) {
      y += 2;
      this.screen.write(0, y++, `${colors.bold}Configuration Actions:${colors.reset}`);
      this.screen.write(0, y++, `${colors.cyan}[e]${colors.reset} Edit configuration file`);
      this.screen.write(0, y++, `${colors.cyan}[r]${colors.reset} Reload configuration`);
    }
  }

  private renderLogsView(width: number, height: number, isMobile: boolean): void {
    let y = 0;
    
    this.screen.write(0, y++, `${colors.bold}System Logs${colors.reset}`);
    
    if (this.logOutput.length === 0) {
      this.screen.write(0, y + 2, `${colors.gray}No logs available${colors.reset}`);
      this.screen.write(0, y + 3, `${colors.blue}Tip:${colors.reset} Connect to Air node to see activity logs`);
      return;
    }
    
    y++;
    const maxLines = height - 3;
    const startIndex = Math.max(0, this.logOutput.length - maxLines);
    
    for (let i = startIndex; i < this.logOutput.length && y < height - 2; i++) {
      let line = this.logOutput[i];
      if (line.length > width - 1) {
        line = line.substring(0, width - 4) + '...';
      }
      
      // Color code log lines
      let color = colors.gray;
      if (line.includes('ERROR') || line.includes('error:')) color = colors.red;
      else if (line.includes('WARN') || line.includes('warning:')) color = colors.yellow;
      else if (line.includes('SYNC') || line.includes('connected')) color = colors.green;
      else if (line.includes('QUERY') || line.includes('data')) color = colors.blue;
      
      this.screen.write(0, y++, `${color}${line}${colors.reset}`);
    }
  }

  private renderFooter(width: number, height: number, isMobile: boolean): void {
    const footerY = height - 1;
    
    let commands;
    if (isMobile) {
      commands = this.responsiveCommands.getCommands(width, [
        { key: 'h', desc: 'Help' },
        { key: 'q', desc: 'Quit' },
        { key: 'c', desc: 'Connect' },
        { key: 'r', desc: 'Refresh' }
      ]);
    } else {
      commands = this.responsiveCommands.getCommands(width, [
        { key: 'h', desc: 'Help' },
        { key: 'c', desc: 'Connect' },
        { key: 'r', desc: 'Refresh' },
        { key: 's', desc: 'Sync' },
        { key: 'a', desc: 'Auto-refresh' },
        { key: '↑↓', desc: 'Navigate' },
        { key: 'q', desc: 'Quit' }
      ]);
    }
    
    this.screen.write(0, footerY, `${colors.blue}${commands}${colors.reset}`);
  }

  // Helper methods
  private formatTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  private formatDuration(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  // Navigation handlers
  private navigateUp(): void {
    if (this.currentView === 'network') {
      this.selectedNodeIndex = Math.max(0, this.selectedNodeIndex - 1);
    } else if (this.currentView === 'data') {
      this.selectedDataIndex = Math.max(0, this.selectedDataIndex - 1);
    }
  }

  private navigateDown(): void {
    if (this.currentView === 'network') {
      this.selectedNodeIndex = Math.min(this.nodes.length - 1, this.selectedNodeIndex + 1);
    } else if (this.currentView === 'data') {
      this.selectedDataIndex = Math.min(this.currentData.length - 1, this.selectedDataIndex + 1);
    }
  }

  private navigateLeft(): void {
    // Could be used for horizontal navigation
  }

  private navigateRight(): void {
    // Could be used for horizontal navigation
  }

  private handleEnter(): void {
    if (this.currentView === 'network') {
      // Could show detailed node information
    } else if (this.currentView === 'data') {
      // Could show detailed record view
    } else if (this.currentView === 'query') {
      // Execute query
      this.executeQuery();
    }
  }

  // Action handlers
  private toggleConnection(): void {
    if (this.isConnected) {
      this.disconnect();
    } else {
      this.connect();
    }
  }

  private connect(): void {
    if (this.isConnected) return;
    
    this.logOutput.push(`Connecting to Air node at ${this.config.nodeAddress}:${this.config.nodePort}...`);
    this.spinner = new Spinner('Connecting...');
    this.spinner.start();
    
    // Simulate connection
    setTimeout(() => {
      this.spinner?.stop();
      this.spinner = null;
      this.isConnected = true;
      this.logOutput.push('✓ Connected to Air network');
      
      // Simulate initial data sync
      this.logOutput.push('Starting initial data synchronization...');
      this.refreshData();
    }, 2000);
  }

  private disconnect(): void {
    if (!this.isConnected) return;
    
    this.logOutput.push('Disconnecting from Air network...');
    this.isConnected = false;
    this.logOutput.push('✓ Disconnected');
  }

  private refreshData(): void {
    if (!this.isConnected) return;
    
    this.logOutput.push('Refreshing data from network...');
    this.updateNetworkData();
    this.logOutput.push('✓ Data refreshed');
  }

  private syncNetwork(): void {
    if (!this.isConnected) return;
    
    this.logOutput.push('Initiating network synchronization...');
    
    // Simulate sync process
    this.nodes.forEach(node => {
      if (node.status === 'connected') {
        this.logOutput.push(`Syncing with ${node.id}...`);
      }
    });
    
    setTimeout(() => {
      this.logOutput.push('✓ Network synchronization completed');
      this.networkStats.syncedRecords = this.networkStats.totalRecords;
      this.nodes.forEach(node => {
        if (node.status === 'connected') {
          node.syncStatus = 'synced';
          node.dataCount = this.networkStats.totalRecords;
        }
      });
    }, 3000);
  }

  private toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    this.logOutput.push(`Auto-refresh ${this.autoRefresh ? 'enabled' : 'disabled'}`);
  }

  private executeQuery(): void {
    if (!this.currentQuery.trim()) return;
    
    this.logOutput.push(`Executing query: ${this.currentQuery}`);
    
    // Add to history
    if (!this.queryHistory.includes(this.currentQuery)) {
      this.queryHistory.push(this.currentQuery);
      if (this.queryHistory.length > 10) {
        this.queryHistory.shift();
      }
    }
    
    // Simulate query execution
    const matchingRecords = this.currentData.filter(record => {
      // Simple pattern matching
      if (this.currentQuery.includes('*')) {
        const pattern = this.currentQuery.replace('*', '');
        return record.key.includes(pattern);
      }
      if (this.currentQuery.startsWith('type:')) {
        const type = this.currentQuery.substring(5);
        return record.type === type;
      }
      if (this.currentQuery.startsWith('node:')) {
        const node = this.currentQuery.substring(5);
        return record.node === node;
      }
      return record.key.includes(this.currentQuery);
    });
    
    this.queryResults = {
      records: matchingRecords,
      totalCount: matchingRecords.length,
      executionTime: Math.random() * 100 + 10,
      fromCache: Math.random() > 0.5,
      sourceNodes: ['local', 'peer1']
    };
    
    this.logOutput.push(`✓ Query completed: ${matchingRecords.length} results in ${this.queryResults.executionTime.toFixed(1)}ms`);
  }

  private addNewRecord(): void {
    // In a real implementation, this would open a form
    this.logOutput.push('Add new record functionality would be implemented here');
  }

  private editRecord(): void {
    // In a real implementation, this would open an editor
    if (this.currentView === 'data' && this.selectedDataIndex < this.currentData.length) {
      const record = this.currentData[this.selectedDataIndex];
      this.logOutput.push(`Edit record: ${record.key}`);
    }
  }

  private deleteRecord(): void {
    // In a real implementation, this would confirm and delete
    if (this.currentView === 'data' && this.selectedDataIndex < this.currentData.length) {
      const record = this.currentData[this.selectedDataIndex];
      this.logOutput.push(`Delete record: ${record.key}`);
    }
  }

  private showFilter(): void {
    // In a real implementation, this would show filter options
    this.logOutput.push('Filter options would be shown here');
  }

  private showHelp(): void {
    this.logOutput.push('=== Air Client Help ===');
    this.logOutput.push('Views: 1-6 to switch between views');
    this.logOutput.push('Connection: [c] Connect/Disconnect, [s] Sync');
    this.logOutput.push('Data: [n] New, [e] Edit, [d] Delete, [f] Filter');
    this.logOutput.push('Navigation: ↑↓ Navigate items, Enter to select');
    this.logOutput.push('Settings: [a] Auto-refresh, [r] Manual refresh');
    this.logOutput.push('General: [h] Help, [q] Quit');
  }

  private quit(): void {
    if (this.airProcess) {
      this.airProcess.kill();
    }
    this.spinner?.stop();
    this.screen.cleanup();
    this.keyboard.stop();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  console.log('💫 Starting Air P2P Database Client...');
  console.log('🌐 This demo shows Air network management capabilities');
  console.log('💡 Press h for help, c to connect, q to quit\n');
  
  const client = new AirClient();
  client.start().catch(error => {
    console.error('❌ Failed to start Air Client:', error);
    process.exit(1);
  });
}

export { AirClient };