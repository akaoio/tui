import { Color, color, reset } from '../../utils/colors';

export function fail(this: any, text?: string): void {
  this.stop();
  if (text) {
    this.text = text;
  }
  const failText = color(Color.Red) + '✗' + reset() + ' ' + this.text;
  this.screen.writeAt(this.x, this.y, failText);
  this.emit('fail', this.text);
}