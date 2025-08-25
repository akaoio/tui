/**
 * ScreenManager getInstance method (singleton)
 */

let instance: any = null;

export function getInstance(this: any): any {
  if (!instance) {
    // Avoid circular import by using dynamic import
    const ScreenManagerClass = require('./ScreenManager').ScreenManager;
    instance = new ScreenManagerClass();
  }
  return instance;
}