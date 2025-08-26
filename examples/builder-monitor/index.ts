#!/usr/bin/env tsx

/**
 * Builder TUI Monitor Launcher
 * 
 * Quick launcher for the Builder Build Monitoring Dashboard
 */

import { BuilderMonitor } from './BuilderMonitor';

const projectPath = process.argv[2] || process.cwd();

console.log('🔧 Launching @akaoio/builder Build Monitor...');
console.log(`📁 Project: ${projectPath}`);
console.log('💡 Press h for help, b to build, w for watch mode, q to quit\n');

const monitor = new BuilderMonitor(projectPath);
monitor.start().catch(error => {
  console.error('❌ Failed to start Builder Monitor:', error);
  process.exit(1);
});