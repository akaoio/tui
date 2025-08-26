#!/usr/bin/env tsx

/**
 * Mobile-First Responsive TUI Demo Launcher
 * 
 * Demonstrates responsive design patterns for terminal interfaces
 */

import { MobileResponsiveDemo } from './MobileDemo';

console.log('📱 Launching Mobile-First Responsive TUI Demo...');
console.log('🎨 This demo showcases adaptive terminal interface patterns');
console.log('📏 Try resizing your terminal to see responsive behavior:');
console.log('   • 40x15 (mobile phone)');
console.log('   • 60x20 (tablet)'); 
console.log('   • 100x30 (desktop)');
console.log('💡 Press h for help, 1-6 to explore views, q to quit\n');

const demo = new MobileResponsiveDemo();
demo.start().catch(error => {
  console.error('❌ Failed to start Mobile Responsive Demo:', error);
  process.exit(1);
});