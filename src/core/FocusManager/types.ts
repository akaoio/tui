/**
 * FocusManager types
 */

import { Component } from '../Component'

export interface FocusManagerState {
  focusableComponents: Component[]
  currentIndex: number
}