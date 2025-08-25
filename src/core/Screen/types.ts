import { WriteStream } from 'tty';

export interface ScreenState {
  stdout: WriteStream;
  buffer: string[];
  width: number;
  height: number;
}