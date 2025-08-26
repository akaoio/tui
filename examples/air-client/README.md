# Air TUI Client

A comprehensive Terminal User Interface for managing @akaoio/air P2P distributed database networks with real-time monitoring, data browsing, and mobile-responsive design.

## Features

### 🌐 P2P Network Management
- Real-time node discovery and connection monitoring
- Network topology visualization
- Peer-to-peer latency tracking
- Connection health diagnostics

### 📊 Distributed Data Browser
- Live data exploration across network nodes
- Multi-format data support (objects, arrays, primitives)
- Real-time synchronization status tracking
- Version conflict detection and resolution

### 🔍 Advanced Query Engine
- Distributed query execution across nodes
- Pattern matching with wildcards
- Type-based filtering
- Query history and caching

### 📱 Mobile-Responsive Interface
- Optimized for terminals as small as 40x15 characters
- Adaptive layouts for phone SSH clients
- Essential information prioritization
- Touch-friendly navigation patterns

### 🔄 Real-Time Synchronization
- Live sync progress monitoring
- Node-by-node sync status tracking
- Conflict resolution visualization
- Network performance metrics

## Quick Start

```bash
# Run the Air client
npm run example:air

# Or directly with tsx
tsx examples/air-client/index.ts
```

## Views & Navigation

### 1. Network [1]
**Purpose**: P2P network node management and monitoring

**Features**:
- **Node Discovery**: Live list of discovered network nodes
- **Connection Status**: Real-time connection health (connected, connecting, disconnected, error)
- **Network Metrics**: Latency, peer counts, data synchronization status
- **Node Details**: Version information, last seen timestamps, sync progress

**Mobile View**:
```
● local
  localhost:8765
  12ms, 1543 records

◐ peer1
  192.168.1.100:8765
  45ms, 1540 records
```

**Desktop View**:
```
● local (localhost:8765) | ✓ Synced | 12ms | 1543 records | 2 peers
◐ peer1 (192.168.1.100:8765) | ◐ Syncing | 45ms | 1540 records | 3 peers
○ peer2 (192.168.1.101:8765) | ⬇ Behind | 89ms | 1520 records | 1 peer
```

### 2. Data Browser [2]
**Purpose**: Distributed data exploration and management

**Features**:
- **Record Listing**: Browse all distributed records with metadata
- **Type Visualization**: Color-coded data types (object, array, string, number, boolean, null)
- **Sync Status**: Real-time indication of synchronization state
- **Value Previews**: Smart preview of complex data structures

**Data Management**:
- Add new records across the network
- Edit existing distributed data
- Delete with network consensus
- Version history tracking

### 3. Query Engine [3]
**Purpose**: Advanced distributed data querying

**Query Syntax**:
- `users/*` - Pattern matching with wildcards
- `config/app` - Exact key matching
- `type:object` - Filter by data type
- `node:local` - Filter by source node

**Features**:
- **Query Execution**: Distributed query processing across nodes
- **Result Caching**: Automatic caching for performance
- **Query History**: Recent query storage and replay
- **Performance Metrics**: Execution time and source node tracking

### 4. Sync Status [4]
**Purpose**: Network synchronization monitoring

**Features**:
- **Global Sync Progress**: Network-wide synchronization percentage
- **Per-Node Status**: Individual node sync progress and health
- **Visual Progress Bars**: Real-time sync progress visualization
- **Performance Statistics**: Throughput, latency, and uptime metrics

**Sync Indicators**:
- `✓ Synced` - Node is fully synchronized
- `◐ Syncing` - Active synchronization in progress  
- `⬇ Behind` - Node is missing recent updates
- `⬆ Ahead` - Node has updates not yet distributed

### 5. Configuration [5]
**Purpose**: Network and client configuration management

**Settings**:
- **Local Node**: Address, port, auto-connect preferences
- **Peer Configuration**: Managed peer list and connection settings
- **Query Settings**: Result limits, timeout values
- **Auto-refresh**: Interval configuration for live updates

### 6. System Logs [6]
**Purpose**: Real-time system activity and debugging

**Log Categories**:
- **Connection Events**: Node joins, leaves, connection errors
- **Synchronization**: Data sync progress, conflicts, resolutions
- **Query Activity**: Query execution, performance, results
- **System Status**: Health checks, performance warnings

## Keyboard Shortcuts

### Global Navigation
- `1-6` - Switch between views (Network, Data, Query, Sync, Config, Logs)
- `h` - Show comprehensive help
- `q` or `Ctrl+C` - Quit application

### Network Operations
- `c` - Connect/disconnect from Air network
- `s` - Force network synchronization
- `r` - Refresh network data manually
- `a` - Toggle auto-refresh mode

### Data Management (Data Browser view)
- `n` - Add new record to distributed database
- `e` - Edit selected record
- `d` - Delete selected record (with network consensus)
- `f` - Show data filtering options

### Navigation & Selection
- `↑↓` - Navigate through nodes/records/results
- `←→` - Navigate between related items
- `Enter` - Select item or execute context action

## Mobile Optimizations

### Screen Size Adaptations

**Mobile Phone (40×15)**:
- Vertical navigation stacking
- Abbreviated node information
- Essential status indicators only
- Two-line record display

**Tablet (60×20)**:
- Enhanced information density
- Side-by-side status indicators
- More detailed record previews
- Horizontal action layouts

**Desktop (80×30+)**:
- Full feature set with detailed information
- Multi-column data display
- Complete metadata visibility
- Advanced keyboard shortcuts

### Responsive Design Patterns

```typescript
// Node display adaptation
if (isMobile) {
  display = `● ${node.id}\n  ${node.address}:${node.port}`;
} else {
  display = `● ${node.id} (${node.address}:${node.port}) | ${syncStatus} | ${latency}ms`;
}
```

```typescript
// Data record truncation
if (isMobile && record.key.length > width - 10) {
  key = record.key.substring(0, width - 13) + '...';
}
```

## Integration with @akaoio/air

### Network Protocol Support
- **GUN.js Protocol**: Built on battle-tested P2P protocols
- **WebRTC Connections**: Direct peer-to-peer communication
- **WebSocket Fallback**: Reliable connection fallback
- **HTTP/HTTPS Support**: Web-compatible data access

### Data Format Compatibility
```typescript
interface DataRecord {
  key: string;           // Distributed key identifier
  value: any;           // JSON-serializable value
  timestamp: number;    // Last modification time
  node: string;         // Source node identifier
  version: number;      // Vector clock version
  synced: boolean;      // Network sync status
}
```

### Real-Time Features
- **Live Data Updates**: Automatic UI updates on data changes
- **Connection Monitoring**: Real-time network health tracking
- **Sync Progress**: Live synchronization status updates
- **Query Streaming**: Real-time query result updates

## Advanced Features

### Network Diagnostics
```typescript
interface NetworkStats {
  totalNodes: number;      // Total discovered nodes
  connectedNodes: number;  // Currently connected nodes
  totalRecords: number;    // Total distributed records
  syncedRecords: number;   // Fully synchronized records
  networkLatency: number;  // Average network latency
  throughput: number;      // Operations per second
  uptime: number;         // Network uptime in seconds
}
```

### Query Performance
- **Distributed Execution**: Queries run across multiple nodes
- **Result Aggregation**: Intelligent result merging
- **Caching Layer**: Performance optimization with caching
- **Load Balancing**: Automatic query distribution

### Conflict Resolution
- **Vector Clocks**: Distributed versioning system
- **Last-Write-Wins**: Automatic conflict resolution
- **Manual Resolution**: User-guided conflict handling
- **Rollback Support**: Version history and rollback

## Use Cases & Applications

### 1. Distributed System Administration
- **Microservices**: Configuration management across services
- **Container Orchestration**: State synchronization
- **Edge Computing**: Local-first data with sync

### 2. Development & Testing
- **Configuration Management**: Environment-specific configs
- **Feature Flags**: Distributed feature toggles
- **A/B Testing**: Real-time experiment data

### 3. IoT & Edge Computing
- **Sensor Networks**: Distributed sensor data collection
- **Smart Home**: Device state synchronization
- **Industrial IoT**: Equipment status and configuration

### 4. Collaborative Applications
- **Team Tools**: Shared workspace data
- **Real-time Collaboration**: Document and state sync
- **Multi-user Systems**: User preference synchronization

## Demo Data & Examples

The client includes comprehensive demo data:

### Demo Network Topology
```
Local Node (localhost:8765)
├── Connected to peer1 (192.168.1.100:8765)
├── Attempting connection to peer2 (192.168.1.101:8765)
└── Sync status: 98.6% complete (1521/1543 records)
```

### Sample Data Records
```typescript
// User management
'users/john' → { name: 'John Doe', email: 'john@example.com', active: true }

// Application configuration  
'config/app' → { version: '1.0.0', debug: false, features: ['auth', 'sync'] }

// Metrics and analytics
'metrics/daily' → [100, 120, 95, 110, 130]
```

### Example Queries
```bash
users/*              # All user records
config/app           # Specific configuration
type:object          # All object-type records
node:local           # Records from local node
*.active:true        # Pattern matching with property filters
```

## Technical Architecture

### P2P Network Layer
```typescript
interface AirNode {
  id: string;              // Unique node identifier
  address: string;         // Network address
  port: number;           // Connection port
  status: NodeStatus;     // Connection state
  syncStatus: SyncStatus; // Synchronization state
  peerCount: number;      // Connected peer count
}
```

### Data Synchronization
```typescript
// Real-time sync monitoring
private updateNetworkData(): void {
  this.nodes.forEach(node => {
    // Update connection status
    // Calculate sync progress
    // Measure network latency
  });
}
```

### Query Engine
```typescript
// Distributed query execution
private executeQuery(): Promise<QueryResult> {
  // Parse query syntax
  // Distribute across nodes
  // Aggregate results
  // Return with performance metrics
}
```

This Air TUI Client demonstrates sophisticated P2P database management patterns and serves as a comprehensive example of building distributed system administration tools with responsive terminal interfaces.