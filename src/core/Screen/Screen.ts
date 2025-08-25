import { WriteStream } from 'tty';
import { ScreenState } from './types';
import { constructor } from './constructor';
import { updateDimensions } from './updateDimensions';
import { getWidth } from './getWidth';
import { getHeight } from './getHeight';
import { clear } from './clear';
import { clearLine } from './clearLine';
import { moveCursor } from './moveCursor';
import { hideCursor } from './hideCursor';
import { showCursor } from './showCursor';
import { saveCursor } from './saveCursor';
import { restoreCursor } from './restoreCursor';
import { write } from './write';
import { writeLine } from './writeLine';
import { writeAt } from './writeAt';
import { startBuffer } from './startBuffer';
import { addToBuffer } from './addToBuffer';
import { flushBuffer } from './flushBuffer';
import { enableAlternateScreen } from './enableAlternateScreen';
import { disableAlternateScreen } from './disableAlternateScreen';
import { reset } from './reset';

export class Screen implements ScreenState {
  stdout: WriteStream = process.stdout as WriteStream;
  buffer: string[] = [];
  width: number = 80;
  height: number = 24;

  constructor(stdout: WriteStream = process.stdout as WriteStream) {
    constructor.call(this, stdout);
  }

  private updateDimensions(): void {
    updateDimensions.call(this);
  }

  getWidth(): number {
    return getWidth.call(this);
  }

  getHeight(): number {
    return getHeight.call(this);
  }

  clear(): void {
    clear.call(this);
  }

  clearLine(): void {
    clearLine.call(this);
  }

  moveCursor(x: number, y: number): void {
    moveCursor.call(this, x, y);
  }

  hideCursor(): void {
    hideCursor.call(this);
  }

  showCursor(): void {
    showCursor.call(this);
  }

  saveCursor(): void {
    saveCursor.call(this);
  }

  restoreCursor(): void {
    restoreCursor.call(this);
  }

  write(text: string): void {
    write.call(this, text);
  }

  writeLine(text: string): void {
    writeLine.call(this, text);
  }

  writeAt(x: number, y: number, text: string): void {
    writeAt.call(this, x, y, text);
  }

  startBuffer(): void {
    startBuffer.call(this);
  }

  addToBuffer(text: string): void {
    addToBuffer.call(this, text);
  }

  flushBuffer(): void {
    flushBuffer.call(this);
  }

  enableAlternateScreen(): void {
    enableAlternateScreen.call(this);
  }

  disableAlternateScreen(): void {
    disableAlternateScreen.call(this);
  }

  reset(): void {
    reset.call(this);
  }
}