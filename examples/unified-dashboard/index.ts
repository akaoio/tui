#!/usr/bin/env tsx

/**
 * Unified @akaoio Dashboard Launcher
 * 
 * The ultimate dashboard for managing the entire @akaoio ecosystem
 */

import { UnifiedDashboard } from './UnifiedDashboard';

const projectPath = process.argv[2] || process.cwd();

console.log('🚀 Launching @akaoio Unified Dashboard...');
console.log('🎯 The complete development ecosystem in one interface');
console.log(`📁 Project: ${projectPath}`);
console.log('');
console.log('🛠️  Integrated Tools:');
console.log('   📝 Composer - Documentation engine'); 
console.log('   ⚔️  Battle - Testing framework');
console.log('   🔧 Builder - Build system');
console.log('   💫 Air - P2P database');
console.log('');
console.log('💡 Quick Actions: d=Docs, w=Watch, t=Test, b=Build, n=Network');
console.log('📱 Fully responsive for mobile terminals');
console.log('💡 Press h for help, q to quit\n');

const dashboard = new UnifiedDashboard(projectPath);
dashboard.start().catch(error => {
  console.error('❌ Failed to start Unified Dashboard:', error);
  process.exit(1);
});