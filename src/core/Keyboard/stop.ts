/**
 * Stop keyboard listener
 */
export function stop(this: any): void {
  if (this.rawMode && this.stdin.isTTY) {
    this.stdin.setRawMode(false);
  }
  this.stdin.pause();
  this.stdin.removeAllListeners('keypress');
  this.rl = null;
}