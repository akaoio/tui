/**
 * OutputFilter types
 */

export interface FilterState {
  originalWrite: typeof process.stdout.write
  originalErrorWrite: typeof process.stderr.write
  enabled: boolean
}