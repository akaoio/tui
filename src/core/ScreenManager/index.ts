/**
 * ScreenManager module exports
 */

export { ScreenManager } from './ScreenManager';
export { 
  ANSI,
  MouseEventType,
  MouseButton,
  type MouseEvent,
  type Cell,
  type ComponentInfo,
  type ScreenDimensions,
  type Region
} from './types';

// Export utility functions for external use if needed
export {
  createBuffer,
  clearBuffer,
  writeToBuffer,
  fillRegion
} from './bufferManagement';

export {
  parseSGRMouse,
  isMouseSequence
} from './mouseHandling';