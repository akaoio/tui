/**
 * Stop the app method
 */

export function stop(this: any): void {
  if (!this.running) return
  
  this.running = false
  this.screen.cleanup()
  this.emit('stop')
}