/**
 * Start the app method
 */

import { render } from './render'

export async function start(this: any): Promise<void> {
  if (this.running) return
  
  this.running = true
  this.screen.enterAlternateScreen()
  this.screen.enableMouse()
  render.call(this)
}