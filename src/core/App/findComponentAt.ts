/**
 * Find component at specific coordinates method
 */

import { Component } from '../Component'

export function findComponentAt(this: any, component: Component, x: number, y: number): Component | null {
  // This is framework logic - apps define their own hit testing
  // For now, just return the component
  return component
}