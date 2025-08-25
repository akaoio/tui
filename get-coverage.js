const { execSync } = require('child_process');

try {
  const output = execSync('npx jest --coverage --silent --coverageReporters=json-summary 2>/dev/null', { 
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
} catch (e) {
  // Jest may exit with non-zero even if coverage is generated
}

try {
  const coverage = require('./coverage/coverage-summary.json');
  const total = coverage.total;
  
  console.log('Current Coverage:');
  console.log(`  Statements: ${total.statements.pct}%`);
  console.log(`  Branches: ${total.branches.pct}%`);
  console.log(`  Functions: ${total.functions.pct}%`);
  console.log(`  Lines: ${total.lines.pct}%`);
  
  // Show files with lowest coverage
  console.log('\nLowest coverage files:');
  const files = Object.entries(coverage).filter(([k]) => k !== 'total');
  files.sort(([,a], [,b]) => a.statements.pct - b.statements.pct);
  
  files.slice(0, 10).forEach(([file, data]) => {
    console.log(`  - ${file.replace(/^.*\/src\//, 'src/')}: ${data.statements.pct}%`);
  });
} catch (err) {
  console.log('Could not read coverage data');
}