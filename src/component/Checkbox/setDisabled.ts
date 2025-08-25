export function setDisabled(this: any, disabled: boolean): void {
  this.disabled = disabled;
  this.render();
}