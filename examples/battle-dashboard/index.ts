#!/usr/bin/env tsx

/**
 * Battle TUI Dashboard Launcher
 * 
 * Quick launcher for the Battle Test Execution Dashboard
 */

import { BattleDashboard } from './BattleDashboard';

const projectPath = process.argv[2] || process.cwd();

console.log('⚔️  Launching @akaoio/battle Test Dashboard...');
console.log(`📁 Project: ${projectPath}`);
console.log('💡 Press h for help, r to run tests, q to quit\n');

const dashboard = new BattleDashboard(projectPath);
dashboard.start().catch(error => {
  console.error('❌ Failed to start Battle Dashboard:', error);
  process.exit(1);
});