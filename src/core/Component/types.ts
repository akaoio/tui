/**
 * Component types
 */

import { ScreenManager, Region } from '../ScreenManager/index'

export interface ComponentProps {
  [key: string]: any
}

export interface RenderContext {
  screen: ScreenManager
  region: Region
  focused?: boolean
  hovered?: boolean
  state?: any
}