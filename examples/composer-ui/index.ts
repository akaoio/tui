#!/usr/bin/env tsx

/**
 * Composer TUI Launcher
 * 
 * Quick launcher for the Composer Terminal User Interface
 */

import { ComposerTUI } from './ComposerTUI';

const projectPath = process.argv[2] || process.cwd();

console.log('🚀 Launching @akaoio/composer TUI...');
console.log(`📁 Project: ${projectPath}`);
console.log('💡 Press h for help, q to quit\n');

const app = new ComposerTUI(projectPath);
app.start().catch(error => {
  console.error('❌ Failed to start Composer TUI:', error);
  process.exit(1);
});