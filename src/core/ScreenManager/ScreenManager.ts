/**
 * ScreenManager class (CONTAINER ONLY - no logic)
 */

import { EventEmitter } from 'events';
import { 
  Cell, 
  ComponentInfo, 
  ScreenDimensions,
  MouseEvent
} from './types';
import { constructor } from './constructor';
import { write } from './write';
import { clear } from './clear';
import { flush } from './flush';
import { getDimensions } from './getDimensions';
import { setCursorPosition } from './setCursorPosition';
import { setCursorVisible } from './setCursorVisible';
import { enterAlternateScreen } from './enterAlternateScreen';
import { exitAlternateScreen } from './exitAlternateScreen';
import { enableMouse } from './enableMouse';
import { disableMouse } from './disableMouse';
import { registerComponent } from './registerComponent';
import { unregisterComponent } from './unregisterComponent';
import { fillRegion } from './fillRegion';
import { cleanup } from './cleanup';
import { getInstance } from './getInstance';

export class ScreenManager extends EventEmitter {
  public static instance: any;
  
  public buffer: Cell[][] = [];
  public prevBuffer: Cell[][] | null = null;
  public width: number = 80;
  public height: number = 24;
  public cursorX = 0;
  public cursorY = 0;
  public cursorVisible = true;
  public isAlternateScreen = false;
  public isMouseEnabled = false;
  public isRawMode = false;
  public rl?: any;
  public stdin: NodeJS.ReadStream = process.stdin;
  public stdout: NodeJS.WriteStream = process.stdout;
  public outputFilter: any;
  public virtualCursorManager: any;
  public components: Map<string, ComponentInfo> = new Map();
  public inputBuffer = '';
  public cursorMode = false;
  
  private constructor() {
    super();
    constructor.call(this);
  }
  
  static getInstance(): any {
    return getInstance();
  }
  
  write(text: string, x: number, y: number, style?: string): void {
    return write.call(this, text, x, y, style);
  }
  
  clear(): void {
    return clear.call(this);
  }
  
  flush(): void {
    return flush.call(this);
  }
  
  getDimensions(): ScreenDimensions {
    return getDimensions.call(this);
  }
  
  setCursorPosition(x: number, y: number): void {
    return setCursorPosition.call(this, x, y);
  }
  
  setCursorVisible(visible: boolean): void {
    return setCursorVisible.call(this, visible);
  }
  
  enterAlternateScreen(): void {
    return enterAlternateScreen.call(this);
  }
  
  exitAlternateScreen(): void {
    return exitAlternateScreen.call(this);
  }

  enableMouse(): void {
    return enableMouse.call(this);
  }
  
  disableMouse(): void {
    return disableMouse.call(this);
  }
  
  registerComponent(id: string, component: any, region: any): void {
    return registerComponent.call(this, id, component, region);
  }
  
  unregisterComponent(id: string): void {
    return unregisterComponent.call(this, id);
  }
  
  fillRegion(region: any, char: string, style?: string): void {
    return fillRegion.call(this, region, char, style);
  }
  
  cleanup(): void {
    return cleanup.call(this);
  }
}