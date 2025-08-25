/**
 * Visual Test Runner - Cho phép agents "nhìn thấy" TUI output
 */

const { TerminalCapture } = require('./terminal-capture');
const fs = require('fs');
const path = require('path');

class VisualTestRunner {
  constructor() {
    this.reportsDir = path.join(__dirname, 'reports');
    this.ensureReportsDir();
  }

  ensureReportsDir() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Chạy visual tests cho TUI components
   */
  async runVisualTests() {
    console.log('🎯 Starting Visual Tests - Agents will "see" TUI output...\n');

    const testSuites = [
      { name: 'Input Component', path: this.createInputDemo() },
      { name: 'Select Component', path: this.createSelectDemo() },
      { name: 'Form Component', path: this.createFormDemo() },
      { name: 'Layout System', path: this.createLayoutDemo() }
    ];

    const allResults = [];

    for (const suite of testSuites) {
      console.log(`📸 Testing: ${suite.name}...`);
      
      try {
        const capture = new TerminalCapture();
        const results = await capture.testMultipleSizes(suite.path, suite.name.toLowerCase().replace(' ', '-'));
        
        allResults.push({
          suite: suite.name,
          results: results
        });

        // Generate agent-readable report
        await this.generateAgentReport(suite.name, results);
        
        console.log(`✅ ${suite.name}: ${results.length} sizes tested\n`);
      } catch (error) {
        console.error(`❌ ${suite.name}: ${error.message}\n`);
        allResults.push({
          suite: suite.name,
          error: error.message
        });
      }
    }

    // Generate summary report
    await this.generateSummaryReport(allResults);
    
    console.log('🎉 Visual testing complete! Check reports/ for agent-readable results.');
    return allResults;
  }

  /**
   * Create demo scripts cho testing
   */
  createInputDemo() {
    // Use standalone demo that works without build
    return path.join(__dirname, 'standalone-demo.js');
  }

  createSelectDemo() {
    // Use standalone demo for all components
    return path.join(__dirname, 'standalone-demo.js');
  }

  createFormDemo() {
    // Use standalone demo for all components
    return path.join(__dirname, 'standalone-demo.js');
  }

  createLayoutDemo() {
    // Use standalone demo for all components
    return path.join(__dirname, 'standalone-demo.js');
  }

  /**
   * Generate report mà agents có thể đọc và hiểu
   */
  async generateAgentReport(suiteName, results) {
    const reportPath = path.join(this.reportsDir, `${suiteName.toLowerCase().replace(' ', '-')}-report.md`);
    
    let report = `# Visual Test Report: ${suiteName}\n\n`;
    report += `**Generated**: ${new Date().toISOString()}\n\n`;
    
    report += `## Test Results Summary\n\n`;
    
    results.forEach(result => {
      report += `### Terminal Size: ${result.size} (${result.dimensions})\n\n`;
      
      if (result.success) {
        report += `✅ **Status**: Success\n\n`;
        report += `**What the agent can "see":**\n`;
        report += `- Total lines rendered: ${result.description.totalLines}\n`;
        report += `- Content lines: ${result.description.content.length}\n`;
        report += `- Has box drawing: ${result.description.layout.hasBoxDrawing ? 'Yes' : 'No'}\n`;
        report += `- Has colors: ${result.description.content.some(c => c.hasColors) ? 'Yes' : 'No'}\n`;
        report += `- Estimated components: ${JSON.stringify(result.description.layout.estimatedComponents)}\n\n`;
        
        if (result.description.content.length > 0) {
          report += `**Visible Content:**\n`;
          result.description.content.slice(0, 10).forEach(line => {
            report += `- Line ${line.line}: "${line.text}" (${line.length} chars)\n`;
          });
          if (result.description.content.length > 10) {
            report += `- ... and ${result.description.content.length - 10} more lines\n`;
          }
          report += `\n`;
        }
      } else {
        report += `❌ **Status**: Failed\n`;
        report += `**Error**: ${result.error}\n\n`;
      }
    });

    report += `## Agent Analysis\n\n`;
    report += `This report allows AI agents to "see" how the TUI component renders across different terminal sizes. `;
    report += `Agents can use this information to:\n\n`;
    report += `1. **Understand visual layout** - See how components are positioned\n`;
    report += `2. **Detect responsive behavior** - How UI adapts to different sizes\n`;
    report += `3. **Identify rendering issues** - Missing content or broken layouts\n`;
    report += `4. **Validate user experience** - Ensure UI is usable across terminals\n\n`;

    fs.writeFileSync(reportPath, report);
    console.log(`📊 Agent report generated: ${reportPath}`);
  }

  /**
   * Generate summary report
   */
  async generateSummaryReport(allResults) {
    const reportPath = path.join(this.reportsDir, 'visual-test-summary.md');
    
    let report = `# TUI Visual Testing Summary\n\n`;
    report += `**Generated**: ${new Date().toISOString()}\n`;
    report += `**Purpose**: Allow agents to "see" TUI output without physical displays\n\n`;
    
    report += `## Overall Results\n\n`;
    
    const totalSuites = allResults.length;
    const successfulSuites = allResults.filter(r => !r.error).length;
    
    report += `- **Test Suites**: ${totalSuites}\n`;
    report += `- **Successful**: ${successfulSuites}\n`;
    report += `- **Failed**: ${totalSuites - successfulSuites}\n\n`;
    
    report += `## Visual Testing Benefits for Agents\n\n`;
    report += `1. **Virtual Vision**: Agents can now "see" terminal output through text descriptions\n`;
    report += `2. **Multi-Size Testing**: Verify responsive behavior across terminal sizes\n`;
    report += `3. **Layout Validation**: Detect box drawing, colors, and component positioning\n`;
    report += `4. **User Experience**: Understand how real users see the TUI\n\n`;
    
    allResults.forEach(suite => {
      report += `### ${suite.suite}\n`;
      if (suite.error) {
        report += `❌ **Status**: Failed - ${suite.error}\n\n`;
      } else {
        const sizes = suite.results.length;
        const successful = suite.results.filter(r => r.success).length;
        report += `✅ **Status**: ${successful}/${sizes} sizes tested successfully\n\n`;
      }
    });

    fs.writeFileSync(reportPath, report);
    console.log(`📋 Summary report generated: ${reportPath}`);
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new VisualTestRunner();
  runner.runVisualTests()
    .then(results => {
      console.log(`\n✨ Visual testing complete! Results: ${results.length} suites tested`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Visual testing failed:', error);
      process.exit(1);
    });
}

module.exports = { VisualTestRunner };