/**
 * ComponentRegistry setupComponentEvents method
 */

import { Component } from '../Component';

export function setupComponentEvents(
  this: any,
  id: string, 
  component: Component
): void {
  // Forward component events with ID context
  const events = ['change', 'focus', 'blur', 'click', 'submit'];
  
  events.forEach((eventName: any) => {
    if (component && typeof component.on === 'function') {
      component.on(eventName, (...args) => {
        this.emit && this.emit(`component:${eventName}`, {
          id,
          component,
          args
        });
      });
    }
  });
}