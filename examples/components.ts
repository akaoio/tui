#!/usr/bin/env tsx
import {
  Screen,
  Keyboard,
  Key,
  Spinner,
  ProgressBar,
  Select,
  Checkbox,
  Radio,
  Color
} from '../src';

async function main() {
  const screen = new Screen();
  const keyboard = new Keyboard();
  
  screen.clear();
  screen.hideCursor();
  
  console.log('TUI Components Demo');
  console.log('===================\n');
  
  // Spinner demo
  const spinner = new Spinner(screen, keyboard, {
    x: 0,
    y: 3,
    text: 'Loading data...',
    style: 'dots',
    color: Color.Cyan
  });
  
  spinner.start();
  
  setTimeout(() => {
    spinner.succeed('Data loaded successfully!');
    
    // Progress bar demo
    const progressBar = new ProgressBar(screen, keyboard, {
      x: 0,
      y: 5,
      total: 100,
      current: 0,
      barWidth: 40,
      showPercentage: true,
      showNumbers: true
    });
    
    progressBar.render();
    
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      progressBar.setProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        demonstrateInteractiveComponents();
      }
    }, 100);
  }, 2000);
  
  function demonstrateInteractiveComponents() {
    screen.clear();
    console.log('Interactive Components Demo');
    console.log('===========================\n');
    console.log('Use arrow keys to navigate, Space/Enter to select, Ctrl+C to exit\n');
    
    // Select component
    const select = new Select(screen, keyboard, {
      x: 0,
      y: 5,
      width: 30,
      options: [
        { label: 'Option 1', value: 1 },
        { label: 'Option 2', value: 2 },
        { label: 'Option 3', value: 3 },
        { label: 'Disabled Option', value: 4, disabled: true },
        { label: 'Option 5', value: 5 }
      ],
      maxDisplay: 5
    });
    
    // Checkboxes
    const checkbox1 = new Checkbox(screen, keyboard, {
      x: 0,
      y: 8,
      label: 'Enable notifications'
    });
    
    const checkbox2 = new Checkbox(screen, keyboard, {
      x: 0,
      y: 9,
      label: 'Auto-save enabled',
      checked: true
    });
    
    // Radio buttons
    const radio = new Radio(screen, keyboard, {
      x: 0,
      y: 11,
      orientation: 'vertical',
      options: [
        { label: 'Small', value: 's' },
        { label: 'Medium', value: 'm' },
        { label: 'Large', value: 'l' }
      ],
      selected: 1
    });
    
    const components = [select, checkbox1, checkbox2, radio];
    let currentIndex = 0;
    
    // Initial render
    components.forEach(c => c.render());
    components[currentIndex]?.focus();
    
    keyboard.onKey((key, event) => {
      if (key === Key.CTRL_C) {
        screen.clear();
        screen.showCursor();
        console.log('\nExiting demo...');
        keyboard.stop();
        process.exit(0);
      }
      
      if (key === Key.TAB) {
        components[currentIndex]?.blur();
        currentIndex = (currentIndex + 1) % components.length;
        components[currentIndex]?.focus();
      } else {
        components[currentIndex]?.handleKey(key, event);
      }
    });
    
    // Log changes
    select.on('select', (value) => {
      screen.writeAt(35, 5, `Selected: ${value}     `);
    });
    
    checkbox1.on('change', (checked) => {
      screen.writeAt(35, 8, checked ? 'Notifications ON ' : 'Notifications OFF');
    });
    
    checkbox2.on('change', (checked) => {
      screen.writeAt(35, 9, checked ? 'Auto-save ON ' : 'Auto-save OFF');
    });
    
    radio.on('change', (value) => {
      screen.writeAt(35, 12, `Size: ${value}     `);
    });
  }
  
  keyboard.start();
}

main().catch(console.error);