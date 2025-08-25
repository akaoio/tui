/**
 * Enable output filtering - nuclear option method
 */

import { filterMouseSequences } from './filterMouseSequences'

export function enable(this: any): void {
  if (this.enabled) return
  this.enabled = true
  
  // Override stdout.write to filter mouse sequences
  process.stdout.write = (chunk: any, encoding?: any, callback?: any): boolean => {
    const str = chunk.toString()
    
    // Filter out ANY potential mouse coordinate patterns
    const filtered = filterMouseSequences.call(this, str)
    
    if (filtered !== str) {
      // Mouse data was filtered - write cleaned version
      return this.originalWrite(filtered, encoding, callback)
    }
    
    return this.originalWrite(chunk, encoding, callback)
  }
  
  // Also filter stderr just in case
  process.stderr.write = (chunk: any, encoding?: any, callback?: any): boolean => {
    const str = chunk.toString()
    const filtered = filterMouseSequences.call(this, str)
    
    if (filtered !== str) {
      return this.originalErrorWrite(filtered, encoding, callback)
    }
    
    return this.originalErrorWrite(chunk, encoding, callback)
  }
}