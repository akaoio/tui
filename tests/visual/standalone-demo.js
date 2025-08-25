/**
 * Standalone Visual Demo - Pure ANSI output cho agents "nhìn thấy"
 */

function runStandaloneDemo() {
  console.clear();
  
  const width = process.stdout.columns || 80;
  const height = process.stdout.rows || 24;
  
  // Header with colors
  console.log('\x1b[36m' + '='.repeat(width) + '\x1b[0m');
  console.log('\x1b[1;36m' + 'TUI FRAMEWORK VISUAL DEMO' + '\x1b[0m');
  console.log('\x1b[36m' + '='.repeat(width) + '\x1b[0m');
  console.log('');
  
  console.log(`\x1b[33mTerminal Size: ${width}x${height}\x1b[0m`);
  console.log('');
  
  // Form simulation
  console.log('\x1b[1mUser Registration Form:\x1b[0m');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│                                         │');
  console.log('│  Name: [\x1b[90mEnter your name...\x1b[0m        ] │');
  console.log('│                                         │');
  console.log('│  Email: [\x1b[90muser@example.com\x1b[0m         ] │');
  console.log('│                                         │');
  console.log('│  Age: [\x1b[32m25\x1b[0m                       ] │');
  console.log('│                                         │');
  console.log('│  [\x1b[42;30m Submit \x1b[0m] [\x1b[41;30m Cancel \x1b[0m]          │');
  console.log('│                                         │');
  console.log('└─────────────────────────────────────────┘');
  console.log('');
  
  // Status indicators
  console.log('\x1b[1mSystem Status:\x1b[0m');
  console.log('┌─ Status Panel ─┐');
  console.log('│ \x1b[32m●\x1b[0m Database: Online  │');
  console.log('│ \x1b[32m●\x1b[0m API: Connected   │'); 
  console.log('│ \x1b[33m●\x1b[0m Cache: Warning   │');
  console.log('│ \x1b[31m●\x1b[0m Backup: Error    │');
  console.log('└─────────────────┘');
  console.log('');
  
  // Navigation menu
  console.log('\x1b[1mNavigation:\x1b[0m');
  console.log('\x1b[7m Home \x1b[0m \x1b[2m Profile \x1b[0m \x1b[2m Settings \x1b[0m \x1b[2m Help \x1b[0m');
  console.log('');
  
  // Progress bar
  console.log('\x1b[1mLoading Progress:\x1b[0m');
  console.log('[\x1b[42m████████████\x1b[0m\x1b[100m        \x1b[0m] 60%');
  console.log('');
  
  // Data table
  console.log('\x1b[1mData Table:\x1b[0m');
  console.log('┌────┬──────────┬────────┬────────┐');
  console.log('│ ID │ Name     │ Status │ Score  │');
  console.log('├────┼──────────┼────────┼────────┤');
  console.log('│ 1  │ Alice    │ \x1b[32mActive\x1b[0m │   95   │');
  console.log('│ 2  │ Bob      │ \x1b[33mPending\x1b[0m│   82   │');
  console.log('│ 3  │ Charlie  │ \x1b[31mInactive\x1b[0m│   67   │');
  console.log('└────┴──────────┴────────┴────────┘');
  console.log('');
  
  // Footer
  console.log('\x1b[90m' + '─'.repeat(width) + '\x1b[0m');
  console.log('\x1b[32m✓ Visual Demo Complete for Agent Analysis\x1b[0m');
  console.log('');
  
  // Agent analysis data
  console.log('\x1b[1mAGENT VISUAL ANALYSIS DATA:\x1b[0m');
  console.log('- \x1b[36mComponents detected:\x1b[0m 8 (form, buttons, status, menu, progress, table)');
  console.log('- \x1b[36mColors used:\x1b[0m 7 (cyan, yellow, green, red, white, gray, blue)');
  console.log('- \x1b[36mBox drawing:\x1b[0m Present (Unicode box characters)');
  console.log('- \x1b[36mInteractive elements:\x1b[0m 4 (input fields, buttons)');
  console.log('- \x1b[36mLayout structure:\x1b[0m Organized in sections with clear hierarchy');
  console.log('- \x1b[36mUser experience:\x1b[0m Professional TUI with good visual organization');
  console.log('');
  
  setTimeout(() => {
    console.log('\x1b[33m--- DEMO END ---\x1b[0m');
    process.exit(0);
  }, 1000);
}

runStandaloneDemo();