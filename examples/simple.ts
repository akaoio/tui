#!/usr/bin/env tsx
import { Screen, Keyboard, Key, Input } from '../src-new';

async function main() {
  const screen = new Screen();
  const keyboard = new Keyboard();
  
  screen.clear();
  screen.hideCursor();
  
  console.log('Simple TUI Input Example');
  console.log('========================\n');
  console.log('Press Enter to submit, Ctrl+C to exit\n');
  
  const input = new Input(screen, keyboard, {
    x: 0,
    y: 5,
    width: 40,
    placeholder: 'Enter your name...',
    validator: (value) => {
      if (value.length < 3) {
        return 'Name must be at least 3 characters';
      }
      return null;
    }
  });
  
  input.focus();
  input.render();
  
  input.on('submit', (value: string) => {
    screen.clear();
    screen.showCursor();
    console.log(`\nHello, ${value}!`);
    keyboard.stop();
    process.exit(0);
  });
  
  keyboard.onKey((key, event) => {
    if (key === Key.CTRL_C) {
      screen.clear();
      screen.showCursor();
      console.log('\nGoodbye!');
      keyboard.stop();
      process.exit(0);
    }
    
    input.handleKey(key, event);
  });
  
  keyboard.start();
}

main().catch(console.error);