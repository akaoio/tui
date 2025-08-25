/**
 * Select open method
 */

export function open(this: any): void {
  this.state.isOpen = true;
  this.state.hoveredIndex = this.state.selectedIndex;
  this.emit('open');
}