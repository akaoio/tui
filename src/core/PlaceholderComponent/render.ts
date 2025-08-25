/**
 * Placeholder component render method
 */

import { RenderContext } from '../Component'

export function render(this: any, context: RenderContext): void {
  const text = `[${this.props.type || 'component'}]`
  this.writeText(context, text, 0, 0, '\x1b[90m') // Gray text
}