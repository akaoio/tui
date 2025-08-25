import { Color, color, reset } from '../../utils/colors';

export function succeed(this: any, text?: string): void {
  this.stop();
  if (text) {
    this.text = text;
  }
  const successText = color(Color.Green) + '✓' + reset() + ' ' + this.text;
  this.screen.writeAt(this.x, this.y, successText);
  this.emit('succeed', this.text);
}