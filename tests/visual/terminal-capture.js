/**
 * Terminal Visual Capture System
 * Allows agents to "see" TUI output through text descriptions
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TerminalCapture {
  constructor(options = {}) {
    this.width = options.width || 80;
    this.height = options.height || 24;
    this.timeout = options.timeout || 5000;
    this.captureDir = path.join(__dirname, 'captures');
    this.ensureCaptureDir();
  }

  ensureCaptureDir() {
    if (!fs.existsSync(this.captureDir)) {
      fs.mkdirSync(this.captureDir, { recursive: true });
    }
  }

  /**
   * Capture TUI component output và convert thành text mô tả
   */
  async captureComponent(componentPath, testName) {
    const outputFile = path.join(this.captureDir, `${testName}-${this.width}x${this.height}.txt`);
    
    return new Promise((resolve, reject) => {
      // Set terminal size environment
      const env = {
        ...process.env,
        COLUMNS: this.width.toString(),
        LINES: this.height.toString(),
        TERM: 'xterm-256color'
      };

      const child = spawn('node', [componentPath], {
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Timeout handler
      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Capture timeout after ${this.timeout}ms`));
      }, this.timeout);

      child.on('close', (code) => {
        clearTimeout(timer);
        
        if (code !== 0 && stderr) {
          reject(new Error(`Process failed: ${stderr}`));
          return;
        }

        // Convert ANSI output to readable description
        const description = this.convertToDescription(output);
        
        // Save capture
        fs.writeFileSync(outputFile, JSON.stringify({
          testName,
          dimensions: `${this.width}x${this.height}`,
          timestamp: new Date().toISOString(),
          rawOutput: output,
          description: description,
          exitCode: code
        }, null, 2));

        resolve({
          output,
          description,
          file: outputFile
        });
      });

      // Send some test inputs
      child.stdin.write('test input\n');
      setTimeout(() => child.stdin.write('\u0003'), 1000); // Ctrl+C after 1s
    });
  }

  /**
   * Convert ANSI output thành human-readable description
   */
  convertToDescription(ansiOutput) {
    const lines = ansiOutput.split('\n');
    const description = {
      totalLines: lines.length,
      content: [],
      colors: [],
      cursor: null,
      layout: this.analyzeLayout(ansiOutput)
    };

    lines.forEach((line, index) => {
      if (line.trim()) {
        // Remove ANSI escape codes for text analysis
        const cleanLine = line.replace(/\u001b\[[0-9;]*m/g, '');
        const colors = this.extractColors(line);
        
        description.content.push({
          line: index + 1,
          text: cleanLine,
          length: cleanLine.length,
          hasColors: colors.length > 0,
          colors: colors
        });
      }
    });

    return description;
  }

  /**
   * Extract color information from ANSI codes
   */
  extractColors(line) {
    const colorMatches = line.match(/\u001b\[[0-9;]*m/g) || [];
    return colorMatches.map(match => {
      const codes = match.slice(2, -1).split(';');
      return this.interpretColorCodes(codes);
    });
  }

  interpretColorCodes(codes) {
    // Basic ANSI color interpretation
    const colorMap = {
      '30': 'black', '31': 'red', '32': 'green', '33': 'yellow',
      '34': 'blue', '35': 'magenta', '36': 'cyan', '37': 'white',
      '90': 'bright-black', '91': 'bright-red', '92': 'bright-green',
      '93': 'bright-yellow', '94': 'bright-blue', '95': 'bright-magenta',
      '96': 'bright-cyan', '97': 'bright-white'
    };

    return codes.map(code => colorMap[code] || `code-${code}`).join(',');
  }

  /**
   * Analyze layout structure
   */
  analyzeLayout(output) {
    const hasBoxChars = /[┌┐└┘├┤┬┴┼─│]/.test(output);
    const hasIndentation = /^\s+/.test(output);
    const lineCount = output.split('\n').length;
    
    return {
      hasBoxDrawing: hasBoxChars,
      hasIndentation: hasIndentation,
      totalLines: lineCount,
      estimatedComponents: this.countComponents(output)
    };
  }

  countComponents(output) {
    // Heuristic để đếm components
    const inputFields = (output.match(/\[.*?\]/g) || []).length;
    const buttons = (output.match(/\( .*? \)/g) || []).length;
    const boxes = (output.match(/┌.*?┐/g) || []).length;
    
    return {
      inputs: inputFields,
      buttons: buttons,
      boxes: boxes
    };
  }

  /**
   * Test component across multiple terminal sizes
   */
  async testMultipleSizes(componentPath, testName) {
    const sizes = [
      { width: 40, height: 20, name: 'mobile' },
      { width: 80, height: 24, name: 'standard' },
      { width: 120, height: 30, name: 'wide' },
      { width: 200, height: 50, name: 'ultra-wide' }
    ];

    const results = [];
    
    for (const size of sizes) {
      const capture = new TerminalCapture(size);
      try {
        const result = await capture.captureComponent(componentPath, `${testName}-${size.name}`);
        results.push({
          size: size.name,
          dimensions: `${size.width}x${size.height}`,
          success: true,
          ...result
        });
      } catch (error) {
        results.push({
          size: size.name,
          dimensions: `${size.width}x${size.height}`,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = { TerminalCapture };