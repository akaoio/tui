import { Key, KeyEvent } from '../../core/keyboard';

export function handleKey(this: any, key: Key, _event: KeyEvent): void {
  if (!this.focused || this.disabled) return;

  if (key === Key.SPACE) {
    this.toggle();
  } else if (key === Key.ENTER) {
    this.toggle();
    this.emit('submit', this.checked);
  }
}