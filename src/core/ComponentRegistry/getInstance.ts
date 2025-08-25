/**
 * ComponentRegistry getInstance method (singleton)
 */

let instance: any = null;

export function getInstance(this: any): any {
  if (!instance) {
    const ComponentRegistryClass = require('./ComponentRegistry').ComponentRegistry;
    instance = new ComponentRegistryClass();
  }
  return instance;
}