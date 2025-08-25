/**
 * Fill region helper method
 */

import { RenderContext } from './types'
import { Region } from '../ScreenManager/index'

export function fillRegion(this: any, context: RenderContext, region: Region, char: string = ' ', style?: string): void {
  const absRegion = {
    x: context.region.x + region.x,
    y: context.region.y + region.y,
    width: region.width,
    height: region.height
  }
  context.screen.fillRegion(absRegion, char, style)
}