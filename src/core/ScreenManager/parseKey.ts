/**
 * ScreenManager parseKey method
 */

export function parseKey(this: any, sequence: string): any {
  // Basic key parsing
  return {
    sequence,
    name: sequence,
    ctrl: sequence.includes('\x03'),
    meta: sequence.includes('\x1b'),
    shift: false
  };
}