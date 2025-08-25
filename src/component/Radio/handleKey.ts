import { Key, KeyEvent } from '../../core/keyboard';

export function handleKey(this: any, key: Key, _event: KeyEvent): void {
  if (!this.focused) return;

  switch (key) {
    case Key.UP:
      if (this.orientation === 'vertical') {
        this.selectPrevious();
      }
      break;
    case Key.DOWN:
      if (this.orientation === 'vertical') {
        this.selectNext();
      }
      break;
    case Key.LEFT:
      if (this.orientation === 'horizontal') {
        this.selectPrevious();
      }
      break;
    case Key.RIGHT:
      if (this.orientation === 'horizontal') {
        this.selectNext();
      }
      break;
    case Key.SPACE:
    case Key.ENTER:
      this.emit('select', this.value);
      break;
    case Key.HOME:
      this.selectFirst();
      break;
    case Key.END:
      this.selectLast();
      break;
  }
  
  this.render();
}