export function getPercentage(this: any): number {
  if (this.total === 0) return 0;
  return Math.min(100, Math.floor((this.current / this.total) * 100));
}