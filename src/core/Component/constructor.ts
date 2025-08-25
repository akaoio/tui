/**
 * Component constructor method
 */

import { ComponentProps } from './types'

export function constructor(this: any, props: ComponentProps = {}) {
  this.props = props
  this.children = []
  this.id = props.id
  this.focusable = props.focusable ?? false
}