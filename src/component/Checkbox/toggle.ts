export function toggle(this: any): void {
  if (this.disabled) return;
  this.checked = !this.checked;
  this.value = this.checked;
  this.render && this.render();
  this.emit && this.emit('change', this.checked);
}