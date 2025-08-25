export function check(this: any): void {
  if (this.disabled || this.checked) return;
  this.checked = true;
  this.value = true;
  this.render && this.render();
  this.emit && this.emit('change', true);
}