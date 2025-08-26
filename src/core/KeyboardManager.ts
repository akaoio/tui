import * as readline from 'readline';
import { EventEmitter } from 'events';

/**
 * Singleton KeyboardManager to prevent multiple stdin listeners
 * This solves the hanging/blocking issue with multiple components
 */
export class KeyboardManager extends EventEmitter {
  private static instance: KeyboardManager | null = null;
  private rl: readline.Interface | null = null;
  private isRawMode: boolean = false;
  private activeListeners: Set<string> = new Set();
  
  private constructor() {
    super();
    this.setupKeyboard();
  }

  public static getInstance(): KeyboardManager {
    if (!KeyboardManager.instance) {
      KeyboardManager.instance = new KeyboardManager();
    }
    return KeyboardManager.instance;
  }

  private setupKeyboard(): void {
    // Only create one readline interface
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
      });

      // Single data listener that broadcasts to all components
      process.stdin.on('data', (key: Buffer) => {
        this.emit('keypress', key);
      });
    }
  }

  public enableRawMode(): void {
    if (!this.isRawMode && process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      this.isRawMode = true;
    }
  }

  public disableRawMode(): void {
    if (this.isRawMode && process.stdin.isTTY) {
      process.stdin.setRawMode(false);
      this.isRawMode = false;
    }
  }

  public registerComponent(componentId: string): void {
    this.activeListeners.add(componentId);
    if (this.activeListeners.size === 1) {
      this.enableRawMode();
    }
  }

  public unregisterComponent(componentId: string): void {
    this.activeListeners.delete(componentId);
    if (this.activeListeners.size === 0) {
      this.disableRawMode();
    }
  }

  public cleanup(): void {
    this.disableRawMode();
    process.stdin.removeAllListeners('data');
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
    this.removeAllListeners();
    KeyboardManager.instance = null;
  }

  public pause(): void {
    if (this.rl) {
      this.rl.pause();
    }
  }

  public resume(): void {
    if (this.rl) {
      this.rl.resume();
    }
  }
}

export default KeyboardManager;