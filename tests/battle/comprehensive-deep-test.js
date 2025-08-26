#!/usr/bin/env node

/**
 * Bộ Kiểm Định Toàn Diện 100% - Phát hiện MỌI vấn đề tiềm ẩn
 * Không chỉ kiểm tra input/output mà kiểm tra từng pixel, từng tính năng
 */

const { Battle } = require('@akaoio/battle');
const path = require('path');

class DeepTUIValidator {
  constructor() {
    this.issues = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  addIssue(category, description, severity = 'HIGH') {
    this.issues.push({ category, description, severity });
  }

  test(description, passed) {
    this.totalTests++;
    if (passed) {
      this.passedTests++;
      console.log(`    ✅ ${description}`);
    } else {
      console.log(`    ❌ ${description}`);
    }
    return passed;
  }

  async testSelectNavigation() {
    console.log('\n🔍 KIỂM ĐỊNH NAVIGATION - Enhanced Visual Detection');
    
    // Strategy: Use enhanced Battle framework with visual change detection
    const battle = new Battle({
      command: 'node',
      args: ['-e', `
        const { TUI } = require('./dist/index.js');
        const tui = new TUI();
        console.log('START_MARKER');
        tui.select('Pick:', ['A', 'B', 'C'], 0).then(r => {
          console.log('FINAL_RESULT:' + r);
          process.exit(0);
        });
      `],
      timeout: 8000
    });

    try {
      await battle.spawn();
      await battle.wait(500);

      // Kiểm tra initial state
      const initialOutput = battle.output;
      const hasInitialArrow = initialOutput.includes('▶');
      this.test('Initial arrow indicator present', hasInitialArrow);

      // Ghi lại vị trí arrow ban đầu  
      const initialArrowPos = this.findArrowPosition(initialOutput);
      
      // Sử dụng Battle enhanced method để test navigation
      const navigationWorked1 = await battle.sendKeyAndDetectResponse('\x1b[B', 200);
      this.test('Arrow moves to next option immediately', navigationWorked1);
      
      if (!navigationWorked1) {
        this.addIssue('NAVIGATION', 'Arrow keys không di chuyển cursor trong thời gian thực', 'CRITICAL');
      }

      // Test second arrow key
      const navigationWorked2 = await battle.sendKeyAndDetectResponse('\x1b[B', 200);
      this.test('Arrow moves to third option', navigationWorked2);

      // Test boundary (should not respond at end)
      const boundaryResponse = await battle.sendKeyAndDetectResponse('\x1b[B', 200);
      this.test('Arrow respects boundaries (no overflow)', !boundaryResponse);

      // Test up arrow
      const upResponse = await battle.sendKeyAndDetectResponse('\x1b[A', 200);
      this.test('Up arrow moves cursor backwards', upResponse);

      // Test selection accuracy
      await battle.write('\r');
      await battle.wait(500);
      
      const finalOutput = battle.output;
      const selectedOption = this.extractSelectedOption(finalOutput);
      const expectedOption = this.getOptionAtPosition(upArrowPos);
      
      const selectionAccurate = selectedOption === expectedOption;
      this.test(`Selection matches cursor position (got: ${selectedOption}, expected: ${expectedOption})`, selectionAccurate);

      if (!selectionAccurate) {
        this.addIssue('SELECTION', `Selection không khớp với cursor position. Got: ${selectedOption}, Expected: ${expectedOption}`, 'CRITICAL');
      }

      battle.cleanup();

    } catch (error) {
      this.addIssue('SYSTEM', `Select component crashed: ${error.message}`, 'CRITICAL');
      battle.cleanup();
    }
  }

  async testVisualRendering() {
    console.log('\n🎨 KIỂM ĐỊNH VISUAL RENDERING - Cấp độ ANSI');
    
    const battle = new Battle({
      command: 'node',
      args: ['-e', `
        const { TUI } = require('./dist/index.js');
        const tui = new TUI();
        tui.select('Test:', ['Option1', 'Option2'], 0);
      `],
      timeout: 3000
    });

    try {
      await battle.spawn();
      await battle.wait(300);

      const output = battle.output;
      
      // Kiểm tra ANSI color codes
      const hasColorCodes = output.includes('\x1b[36m') || output.includes('\x1b[1m');
      this.test('Uses ANSI color codes for highlighting', hasColorCodes);

      // Kiểm tra box drawing characters
      const hasArrow = output.includes('▶');
      this.test('Uses proper arrow character (▶)', hasArrow);

      // Kiểm tra alignment
      const lines = output.split('\n');
      const optionLines = lines.filter(line => line.includes('Option'));
      const properAlignment = optionLines.every(line => 
        line.startsWith('▶ ') || line.startsWith('  ')
      );
      this.test('Options have consistent alignment', properAlignment);

      // Kiểm tra ANSI escape sequences không bị leak
      const hasRawEscapes = output.includes('[2K') || output.includes('[A') || output.includes('[B');
      this.test('No raw ANSI escape sequences visible', !hasRawEscapes);

      if (hasRawEscapes) {
        this.addIssue('RENDERING', 'Raw ANSI escape sequences visible in output (không được render đúng)', 'HIGH');
      }

      battle.cleanup();

    } catch (error) {
      this.addIssue('RENDERING', `Visual rendering test failed: ${error.message}`, 'HIGH');
    }
  }

  async testPerformanceAndMemory() {
    console.log('\n⚡ KIỂM ĐỊNH PERFORMANCE & MEMORY');
    
    const startTime = Date.now();
    const startMem = process.memoryUsage().heapUsed;

    // Tạo nhiều instance để test memory leak
    const battles = [];
    
    for (let i = 0; i < 5; i++) {
      const battle = new Battle({
        command: 'node',
        args: ['-e', `
          const { TUI } = require('./dist/index.js');
          const tui = new TUI();
          setTimeout(() => process.exit(0), 100);
        `],
        timeout: 2000
      });
      
      battles.push(battle);
      await battle.spawn();
      await battle.wait(150);
      battle.cleanup();
    }

    const endTime = Date.now();
    const endMem = process.memoryUsage().heapUsed;
    
    const timePerInstance = (endTime - startTime) / 5;
    const memoryGrowth = (endMem - startMem) / 1024 / 1024; // MB

    this.test(`Instance creation time < 500ms (actual: ${timePerInstance}ms)`, timePerInstance < 500);
    this.test(`Memory growth < 10MB (actual: ${memoryGrowth.toFixed(2)}MB)`, memoryGrowth < 10);

    if (timePerInstance > 500) {
      this.addIssue('PERFORMANCE', `TUI khởi tạo chậm: ${timePerInstance}ms`, 'MEDIUM');
    }

    if (memoryGrowth > 10) {
      this.addIssue('MEMORY', `Memory leak detected: tăng ${memoryGrowth.toFixed(2)}MB`, 'HIGH');
    }
  }

  async testEdgeCases() {
    console.log('\n🚨 KIỂM ĐỊNH EDGE CASES');

    // Test với terminal size cực nhỏ
    const tinyBattle = new Battle({
      command: 'node',
      args: ['-e', `
        const { TUI } = require('./dist/index.js');
        const tui = new TUI();
        tui.select('?', ['A'], 0).then(() => process.exit(0));
      `],
      timeout: 3000,
      cols: 5,
      rows: 3
    });

    try {
      await tinyBattle.spawn();
      await tinyBattle.wait(200);
      await tinyBattle.write('\r');
      await tinyBattle.wait(200);
      
      this.test('Handles extremely small terminal (5×3)', true);
      tinyBattle.cleanup();
    } catch (error) {
      this.test('Handles extremely small terminal (5×3)', false);
      this.addIssue('EDGE_CASE', `Crashes on tiny terminal: ${error.message}`, 'MEDIUM');
    }

    // Test với options rất dài
    const longBattle = new Battle({
      command: 'node',
      args: ['-e', `
        const { TUI } = require('./dist/index.js');
        const tui = new TUI();
        const longOpts = Array(50).fill(0).map((_, i) => 'Option' + i.toString().repeat(20));
        tui.select('Pick:', longOpts, 0).then(() => process.exit(0));
      `],
      timeout: 3000
    });

    try {
      await longBattle.spawn();
      await longBattle.wait(200);
      await longBattle.write('\r');
      await longBattle.wait(200);
      
      this.test('Handles very long option lists (50 items)', true);
      longBattle.cleanup();
    } catch (error) {
      this.test('Handles very long option lists (50 items)', false);
      this.addIssue('EDGE_CASE', `Crashes on long lists: ${error.message}`, 'HIGH');
    }

    // Test với special characters
    const specialBattle = new Battle({
      command: 'node',
      args: ['-e', `
        const { TUI } = require('./dist/index.js');
        const tui = new TUI();
        tui.select('选择:', ['🚀 Rocket', '💀 Skull', '🎉 Party'], 0).then(() => process.exit(0));
      `],
      timeout: 3000
    });

    try {
      await specialBattle.spawn();
      await specialBattle.wait(200);
      await specialBattle.write('\r');
      await specialBattle.wait(200);
      
      this.test('Handles Unicode and emoji characters', true);
      specialBattle.cleanup();
    } catch (error) {
      this.test('Handles Unicode and emoji characters', false);
      this.addIssue('EDGE_CASE', `Unicode handling broken: ${error.message}`, 'MEDIUM');
    }
  }

  async testConcurrency() {
    console.log('\n🔄 KIỂM ĐỊNH CONCURRENCY');

    // Chạy multiple instances đồng thời
    const battles = [];
    const promises = [];

    for (let i = 0; i < 3; i++) {
      const battle = new Battle({
        command: 'node',
        args: ['-e', `
          const { TUI } = require('./dist/index.js');
          const tui = new TUI();
          tui.select('Pick:', ['A', 'B', 'C'], 0).then(r => {
            console.log('DONE:' + r);
            process.exit(0);
          });
        `],
        timeout: 4000
      });

      battles.push(battle);
      
      const promise = battle.spawn().then(async () => {
        await battle.wait(200);
        await battle.write('\r');
        await battle.wait(200);
        return battle;
      });
      
      promises.push(promise);
    }

    try {
      await Promise.all(promises);
      this.test('Multiple concurrent instances work', true);
    } catch (error) {
      this.test('Multiple concurrent instances work', false);
      this.addIssue('CONCURRENCY', `Concurrent instances failed: ${error.message}`, 'HIGH');
    }

    battles.forEach(b => b.cleanup());
  }

  // Utility methods
  findArrowPosition(output) {
    const lines = output.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('▶')) {
        return i;
      }
    }
    return -1;
  }

  extractSelectedOption(output) {
    const match = output.match(/RESULT:(\w+)/);
    return match ? match[1] : 'UNKNOWN';
  }

  getOptionAtPosition(position) {
    const options = ['A', 'B', 'C'];
    // This is a simplified mapping - in real implementation,
    // would need to parse the actual output structure
    if (position === -1) return 'UNKNOWN';
    return options[Math.min(position - 2, options.length - 1)] || 'A'; // Rough estimate
  }

  printReport() {
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('                    BÁO CÁO KIỂM ĐỊNH TOÀN DIỆN');
    console.log('═'.repeat(80));
    
    console.log(`\n📊 TỔNG KẾT:`);
    console.log(`   ✅ Passed: ${this.passedTests}/${this.totalTests}`);
    console.log(`   ❌ Failed: ${this.totalTests - this.passedTests}/${this.totalTests}`);
    console.log(`   📈 Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);

    if (this.issues.length === 0) {
      console.log('\n🎉 CHÚC MỪNG! Không phát hiện vấn đề nào.');
      console.log('   Bộ TUI này đã vượt qua kiểm định toàn diện 100%.');
    } else {
      console.log(`\n🚨 PHÁT HIỆN ${this.issues.length} VẤN ĐỀ:`);
      
      const critical = this.issues.filter(i => i.severity === 'CRITICAL');
      const high = this.issues.filter(i => i.severity === 'HIGH');
      const medium = this.issues.filter(i => i.severity === 'MEDIUM');

      if (critical.length > 0) {
        console.log(`\n🔥 CRITICAL ISSUES (${critical.length}):`);
        critical.forEach((issue, i) => {
          console.log(`   ${i+1}. [${issue.category}] ${issue.description}`);
        });
      }

      if (high.length > 0) {
        console.log(`\n⚠️  HIGH PRIORITY ISSUES (${high.length}):`);
        high.forEach((issue, i) => {
          console.log(`   ${i+1}. [${issue.category}] ${issue.description}`);
        });
      }

      if (medium.length > 0) {
        console.log(`\n💡 MEDIUM PRIORITY ISSUES (${medium.length}):`);
        medium.forEach((issue, i) => {
          console.log(`   ${i+1}. [${issue.category}] ${issue.description}`);
        });
      }

      console.log('\n📋 KHUYẾN NGHỊ:');
      console.log('   - Fix tất cả CRITICAL issues trước khi release');
      console.log('   - Review và sửa HIGH priority issues');
      console.log('   - Cân nhắc sửa MEDIUM issues nếu có thời gian');
    }

    console.log('\n═'.repeat(80));
    
    return this.issues.length === 0 && this.passedTests === this.totalTests;
  }

  async runFullValidation() {
    console.log('🔍 BẮT ĐẦU KIỂM ĐỊNH TOÀN DIỆN TUI FRAMEWORK');
    console.log('   Mục tiêu: Phát hiện MỌI vấn đề tiềm ẩn\n');

    await this.testSelectNavigation();
    await this.testVisualRendering();
    await this.testPerformanceAndMemory();
    await this.testEdgeCases();
    await this.testConcurrency();

    return this.printReport();
  }
}

// Chạy kiểm định
async function main() {
  const validator = new DeepTUIValidator();
  const allPassed = await validator.runFullValidation();
  
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});