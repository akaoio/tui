/**
 * Write text helper method
 */

import { RenderContext } from './types'

export function writeText(this: any, context: RenderContext, text: string, x: number, y: number, style?: string): void {
  context.screen.write(text, context.region.x + x, context.region.y + y, style)
}