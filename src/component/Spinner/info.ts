import { Color, color, reset } from '../../utils/colors';

export function info(this: any, text?: string): void {
  this.stop();
  if (text) {
    this.text = text;
  }
  const infoText = color(Color.Blue) + 'ℹ' + reset() + ' ' + this.text;
  this.screen.writeAt(this.x, this.y, infoText);
  this.emit('info', this.text);
}