/**
 * ComponentRegistry module exports
 */

export { ComponentRegistry } from './ComponentRegistry';
export {
  ComponentMetadata,
  ComponentRef,
  RegistryStats,
  RegisterOptions,
  MountRegion
} from './types';

// Export utility functions if needed
export { generateId, uuidv4 } from './utils';
export {
  getAncestors,
  getChildren,
  getTreeJSON,
  calculateMaxDepth
} from './tree';