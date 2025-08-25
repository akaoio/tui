/**
 * App constructor method
 */

import { ScreenManager } from '../ScreenManager/index'
import { FocusManager } from '../FocusManager/index'
import { setupEventHandlers } from './setupEventHandlers'

export function constructor(this: any): void {
  this.screen = ScreenManager.getInstance()
  this.focusManager = new FocusManager()
  this.running = false
  this.firstRender = true
  
  setupEventHandlers.call(this)
}