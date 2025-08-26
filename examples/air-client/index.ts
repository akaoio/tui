#!/usr/bin/env tsx

/**
 * Air TUI Client Launcher
 * 
 * Quick launcher for the Air P2P Database Client
 */

import { AirClient } from './AirClient';

console.log('💫 Launching @akaoio/air P2P Database Client...');
console.log('🌐 Experience distributed database management in the terminal');
console.log('💡 Press h for help, c to connect to network, q to quit\n');

const client = new AirClient();
client.start().catch(error => {
  console.error('❌ Failed to start Air Client:', error);
  process.exit(1);
});