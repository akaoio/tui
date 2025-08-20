import { WriteStream } from 'tty';

export class Screen {
  private stdout: WriteStream;
  private buffer: string[] = [];
  private width: number = 80;
  private height: number = 24;

  constructor(stdout: WriteStream = process.stdout as WriteStream) {
    this.stdout = stdout;
    this.updateDimensions();
    
    if (this.stdout.isTTY) {
      this.stdout.on('resize', () => this.updateDimensions());
    }
  }

  private updateDimensions(): void {
    if (this.stdout.isTTY) {
      this.width = this.stdout.columns || 80;
      this.height = this.stdout.rows || 24;
    }
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  clear(): void {
    this.write('\x1b[2J');
    this.moveCursor(0, 0);
  }

  clearLine(): void {
    this.write('\x1b[2K');
  }

  moveCursor(x: number, y: number): void {
    this.write(`\x1b[${y + 1};${x + 1}H`);
  }

  hideCursor(): void {
    this.write('\x1b[?25l');
  }

  showCursor(): void {
    this.write('\x1b[?25h');
  }

  saveCursor(): void {
    this.write('\x1b[s');
  }

  restoreCursor(): void {
    this.write('\x1b[u');
  }

  write(text: string): void {
    this.stdout.write(text);
  }

  writeLine(text: string): void {
    this.write(text + '\n');
  }

  writeAt(x: number, y: number, text: string): void {
    this.saveCursor();
    this.moveCursor(x, y);
    this.write(text);
    this.restoreCursor();
  }

  startBuffer(): void {
    this.buffer = [];
  }

  addToBuffer(text: string): void {
    this.buffer.push(text);
  }

  flushBuffer(): void {
    if (this.buffer.length > 0) {
      this.write(this.buffer.join(''));
      this.buffer = [];
    }
  }

  enableAlternateScreen(): void {
    this.write('\x1b[?1049h');
  }

  disableAlternateScreen(): void {
    this.write('\x1b[?1049l');
  }

  reset(): void {
    this.write('\x1b[0m');
  }
}