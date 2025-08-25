export function setTotal(this: any, total: number): void {
  this.total = total;
  if (this.current > this.total) {
    this.current = this.total;
  }
  this.value = this.getPercentage();
  this.render();
}