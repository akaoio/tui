import { Color, color, reset } from '../../utils/colors';

export function warn(this: any, text?: string): void {
  this.stop();
  if (text) {
    this.text = text;
  }
  const warnText = color(Color.Yellow) + '⚠' + reset() + ' ' + this.text;
  this.screen.writeAt(this.x, this.y, warnText);
  this.emit('warn', this.text);
}